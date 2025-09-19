import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { issueSession } from "@/services/auth-service";
import { hashPassword } from "@/lib/auth";
import { SocialProvider } from "@prisma/client";
import { randomBytes } from "node:crypto";

interface SocialLoginPayload {
  token: string;
}

async function verifyGoogleToken(idToken: string) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) {
    throw new Error("Invalid Google token");
  }
  const data = (await response.json()) as {
    email?: string;
    name?: string;
  };
  if (!data.email) {
    throw new Error("Google token missing email");
  }
  return {
    email: data.email,
    name: data.name ?? data.email.split("@")[0],
  };
}

async function verifyKakaoToken(accessToken: string) {
  const response = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Invalid Kakao token");
  }
  const data = (await response.json()) as {
    id: number;
    kakao_account?: {
      email?: string;
      profile?: {
        nickname?: string;
      };
      profile_needs_agreement?: boolean;
      has_email?: boolean;
      email_needs_agreement?: boolean;
      locale?: string;
    };
  };
  const email = data.kakao_account?.email;
  if (!email) {
    throw new Error("Kakao token missing email consent");
  }
  return {
    email,
    name: data.kakao_account?.profile?.nickname ?? email.split("@")[0],
    providerUserId: data.id.toString(),
    locale: data.kakao_account?.locale ?? "ko",
  };
}

async function findOrCreateUser({
  provider,
  providerUserId,
  email,
  name,
  locale,
}: {
  provider: SocialProvider;
  providerUserId: string;
  email: string;
  name: string;
  locale?: string;
}) {
  const socialAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    include: {
      user: true,
    },
  });

  if (socialAccount) {
    return socialAccount.user;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (locale && existingUser.locale !== locale) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { locale },
      });
    }
    await prisma.socialAccount.create({
      data: {
        provider,
        providerUserId,
        userId: existingUser.id,
      },
    });
    return existingUser;
  }

  const randomPassword = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      locale: locale ?? "ko",
      socialAccounts: {
        create: {
          provider,
          providerUserId,
        },
      },
    },
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  try {
    const { token } = (await request.json()) as SocialLoginPayload;
    if (!token) {
      return errorResponse("Token is required", 400);
    }

    const { provider: providerParamValue } = await context.params;
    const providerParam = providerParamValue.toLowerCase();

    let email: string;
    let name: string;
    let providerUserId: string;
    let localePref: string | undefined;
    let provider: SocialProvider;

    if (providerParam === "google") {
      provider = SocialProvider.GOOGLE;
      const profile = await verifyGoogleToken(token);
      email = profile.email;
      name = profile.name;
      providerUserId = profile.email;
      localePref = undefined;
    } else if (providerParam === "kakao") {
      provider = SocialProvider.KAKAO;
      const profile = await verifyKakaoToken(token);
      email = profile.email;
      name = profile.name;
      providerUserId = profile.providerUserId ?? profile.email;
      localePref = profile.locale;
    } else {
      return errorResponse("Unsupported provider", 400);
    }

    const user = await findOrCreateUser({ provider, providerUserId, email, name, locale: localePref });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        locale: user.locale,
        role: user.role,
      },
      provider,
    });

    await issueSession(response, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return response;
  } catch (error) {
    console.error(error);
    return errorResponse((error as Error).message ?? "Unable to authenticate", 400);
  }
}
