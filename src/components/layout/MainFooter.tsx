"use client";

import { useI18n } from "@/providers/I18nProvider";

export function MainFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">MutPark</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {t("footer.tagline")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-200">
              {t("footer.customerCenter")}
            </p>
            <p>Email: support@mutpark.com</p>
            <p>Tel: +90 212 000 0000</p>
            <p>{t("footer.hours")}: 09:00 ~ 18:00 (GMT+3)</p>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.policy")}
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.privacy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
