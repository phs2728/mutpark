"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/providers/I18nProvider";

interface Address {
  id: number;
  label?: string | null;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const { t } = useI18n();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    city: "",
    district: "",
    street: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message ?? "Failed to create address");
      }
      setAddresses((prev) => [json.data, ...prev]);
      setForm({ recipientName: "", phone: "", city: "", district: "", street: "", isDefault: false });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    const target = addresses.find((address) => address.id === id);
    if (!target) return;
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...target, isDefault: true }),
    });
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    );
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((address) => address.id !== id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`rounded-3xl border px-5 py-4 shadow-sm transition dark:border-slate-800 ${
              address.isDefault ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{address.recipientName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {address.city} {address.district} {address.street}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">{address.phone}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm font-semibold text-emerald-600"
                  >
                    {t("account.addressForm.setAsDefault")}
                  </button>
                ) : (
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {t("account.addressForm.defaultBadge")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="text-sm text-red-500"
                >
                  {t("account.addressForm.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("account.addressForm.title")}
        </h2>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <input
          required
          placeholder={t("account.addressForm.name")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          value={form.recipientName}
          onChange={(event) => setForm((prev) => ({ ...prev, recipientName: event.target.value }))}
        />
        <input
          required
          placeholder={t("account.addressForm.phone")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <input
          required
          placeholder={t("account.addressForm.city")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          value={form.city}
          onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
        />
        <input
          required
          placeholder={t("account.addressForm.district")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          value={form.district}
          onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))}
        />
        <input
          required
          placeholder={t("account.addressForm.street")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          value={form.street}
          onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
          />
          {t("account.addressForm.setDefault")}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading ? "..." : t("account.addressForm.submit")}
        </button>
      </form>
    </div>
  );
}
