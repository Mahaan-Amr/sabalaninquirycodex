type SearchableProduct = {
  rowNumber: string;
  name: string;
  description?: string | null;
  listPrice?: number | null;
  finalPrice?: number | null;
  discountAvailability?: string | null;
  lastDiscountPercent?: number | null;
};

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

function toAsciiDigit(digit: string) {
  const persianIndex = persianDigits.indexOf(digit);
  if (persianIndex >= 0) {
    return String(persianIndex);
  }

  const arabicIndex = arabicDigits.indexOf(digit);
  return arabicIndex >= 0 ? String(arabicIndex) : digit;
}

export function normalizeProductSearchText(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[۰-۹٠-٩]/g, toAsciiDigit)
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ۀة]/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/إ|أ|آ/g, "ا")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[\u200C\u200D]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");
}

function compact(value: string) {
  return value.replace(/\s+/g, "");
}

function productSearchText(product: SearchableProduct) {
  return [
    product.rowNumber,
    product.name,
    product.description,
    product.finalPrice,
    product.listPrice,
    product.discountAvailability,
    product.lastDiscountPercent,
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(" ");
}

export function productMatchesSearch(product: SearchableProduct, query: string) {
  const normalizedQuery = normalizeProductSearchText(query);
  if (!normalizedQuery) {
    return true;
  }

  const normalizedText = normalizeProductSearchText(productSearchText(product));
  const compactQuery = compact(normalizedQuery);
  const compactText = compact(normalizedText);

  if (
    normalizedText.includes(normalizedQuery) ||
    (compactQuery && compactText.includes(compactQuery))
  ) {
    return true;
  }

  return normalizedQuery
    .split(" ")
    .filter(Boolean)
    .every((term) => normalizedText.includes(term) || compactText.includes(compact(term)));
}

export function filterProductsBySearch<T extends SearchableProduct>(products: T[], query: string) {
  return products.filter((product) => productMatchesSearch(product, query));
}
