import { Prisma } from "@prisma/client";

export function decimalToNumber(value: Prisma.Decimal | number | string) {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return value;
}
