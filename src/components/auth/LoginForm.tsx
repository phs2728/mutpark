"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({ locale }: { locale: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message ?? "Login failed");
      }

      // 권한별 리다이렉트 처리
      if (json.data.isAdmin) {
        // 관리자는 관리자 대시보드로
        router.push(json.data.redirectTo || "/admin/dashboard");
      } else {
        // 일반 사용자는 메인 페이지로
        router.push(json.data.redirectTo || `/${locale}`);
      }

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {loading ? "..." : t("auth.login.submit")}
      </button>
      <div className="flex">
        <SocialLoginButton provider="google" label={t("auth.login.withGoogle")} />
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

function SocialLoginButton({ provider, label }: { provider: "google"; label: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        // 실제 Google OAuth URL로 리다이렉트
        const googleOAuthURL = new URL('https://accounts.google.com/oauth/authorize');
        googleOAuthURL.searchParams.append('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
        googleOAuthURL.searchParams.append('redirect_uri', `${window.location.origin}/api/auth/callback/google`);
        googleOAuthURL.searchParams.append('response_type', 'code');
        googleOAuthURL.searchParams.append('scope', 'openid email profile');
        googleOAuthURL.searchParams.append('state', crypto.randomUUID());

        // Google OAuth로 리다이렉트
        window.location.href = googleOAuthURL.toString();
      }
    } catch (error) {
      alert((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 flex items-center justify-center gap-2"
    >
      {loading ? (
        "..."
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
