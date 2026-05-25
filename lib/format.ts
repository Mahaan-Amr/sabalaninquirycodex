const persianNumberFormatter = new Intl.NumberFormat("fa-IR");
const inputNumberFormatter = new Intl.NumberFormat("en-US");

const persianDateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

export function formatToman(value: number) {
  return `${persianNumberFormatter.format(value)} تومان`;
}

export function formatOptionalToman(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : formatToman(value);
}

export function formatDiscountPercent(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : `${persianNumberFormatter.format(value)}٪`;
}

export function displayText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed || "-";
}

export function displayDiscountAvailability(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed || "ندارد";
}

export function formatPersianDateTime(value: Date) {
  return persianDateTimeFormatter.format(value);
}

export function normalizeNumericText(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[٬,]/g, "")
    .replace(/٫/g, ".")
    .trim();
}

export function normalizePercentText(value: string) {
  return normalizeNumericText(value).replace(/[٪%]/g, "").trim();
}

export function formatInputNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const normalized = normalizeNumericText(String(value));
  const [integerPart, decimalPart] = normalized.split(".");
  const parsed = Number.parseInt(integerPart, 10);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  return decimalPart === undefined
    ? inputNumberFormatter.format(parsed)
    : `${inputNumberFormatter.format(parsed)}.${decimalPart}`;
}

export function toSafeInt(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number.parseInt(normalizeNumericText(value), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
