import { z } from "zod";
import { defaultLocale, locales } from "@/i18n/config";

export const registerUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    name: z.string().min(2),
    phone: z.string().optional(),
    locale: z.enum(locales).default(defaultLocale),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const productFilterSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
  category: z.string().optional(),
  brand: z.string().optional(),
  halal: z
    .union([z.string(), z.boolean()])
    .transform((val) => (typeof val === "boolean" ? val : val === "true"))
    .optional(),
  spicy: z
    .union([z.string(), z.boolean()])
    .transform((val) => (typeof val === "boolean" ? val : val === "true"))
    .optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
});

const translationSchema = z.object({
  language: z.string().min(2),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const upsertCartSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  addressId: z.number().int(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["iyzico", "papara", "installment"]).default("iyzico"),
  installmentPlan: z.number().int().positive().optional(),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
});

export const upsertAddressSchema = z.object({
  id: z.number().int().optional(),
  label: z.string().optional(),
  recipientName: z.string().min(2),
  phone: z.string().min(6),
  country: z.string().min(2).default("TR"),
  city: z.string().min(1),
  district: z.string().min(1),
  street: z.string().min(1),
  postalCode: z.string().optional(),
  addressLine2: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  locale: z.enum(locales).optional(),
  currency: z.string().optional(),
});

export const createProductSchema = z.object({
  sku: z.string().min(3),
  slug: z.string().min(3),
  baseName: z.string().min(2),
  baseDescription: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default("TRY"),
  stock: z.number().int().min(0).default(0),
  halalCertified: z.boolean().default(false),
  spiceLevel: z.number().int().min(0).max(5).nullable().optional(),
  weightGrams: z.number().int().min(0).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
  translations: z.array(translationSchema).min(1),
});

export const updateProductSchema = createProductSchema.partial().extend({
  translations: z.array(translationSchema).optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
