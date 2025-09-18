"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

interface Profile {
  name: string;
  phone?: string | null;
  locale: string;
  currency: string;
}

export function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const { t } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message ?? "Failed to update profile");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("auth.register.name")}</label>
        <input
          value={profile.name}
          onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("auth.register.phone")}</label>
        <input
          value={profile.phone ?? ""}
          onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Locale</label>
          <select
            value={profile.locale}
            onChange={(event) => setProfile((prev) => ({ ...prev, locale: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="ko">한국어</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Currency</label>
          <input
            value={profile.currency}
            onChange={(event) => setProfile((prev) => ({ ...prev, currency: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {loading ? "..." : t("account.update")}
      </button>
    </form>
  );
}
