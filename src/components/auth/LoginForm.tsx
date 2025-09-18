"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

export function LoginForm({ locale }: { locale: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message ?? "Login failed");
      }
      router.push(`/${locale}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("auth.login.email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("auth.login.password")}
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {loading ? "..." : t("auth.login.submit")}
      </button>
      <div className="flex gap-3">
        <SocialLoginButton provider="google" label={t("auth.login.withGoogle")} />
        <SocialLoginButton provider="kakao" label={t("auth.login.withKakao")} />
      </div>
      <p className="text-center text-sm text-slate-500 dark:text-slate-300">
        <span>{t("auth.login.registerLink")}</span>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/auth/register`)}
          className="ml-2 font-semibold text-emerald-600 hover:underline"
        >
          {t("auth.register.title")}
        </button>
      </p>
    </form>
  );
}

function SocialLoginButton({ provider, label }: { provider: "google" | "kakao"; label: string }) {
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async () => {
    setLoading(true);
    try {
      // Placeholder function. Integrate actual OAuth provider on the client side.
      const demoToken = window.prompt(`${provider.toUpperCase()} OAuth token`);
      if (!demoToken) {
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/auth/social/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: demoToken }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message ?? "Social login failed");
      }
      window.location.reload();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSocialLogin}
      disabled={loading}
      className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
    >
      {loading ? "..." : label}
    </button>
  );
}
