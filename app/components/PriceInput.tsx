"use client";

import { useMemo, useState } from "react";
import { formatInputNumber, normalizeNumericText } from "@/lib/format";

type PriceInputProps = {
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  decimal?: boolean;
};

function cleanValue(value: string, decimal: boolean) {
  const normalized = normalizeNumericText(value);
  const allowed = decimal ? /[^0-9.]/g : /[^0-9]/g;
  const cleaned = normalized.replace(allowed, "");

  if (!decimal) {
    return cleaned;
  }

  const [first, ...rest] = cleaned.split(".");
  return rest.length ? `${first}.${rest.join("")}` : first;
}

export function PriceInput({
  name,
  defaultValue,
  placeholder,
  className,
  disabled,
  decimal = false,
}: PriceInputProps) {
  const initialValue = useMemo(
    () => cleanValue(String(defaultValue ?? ""), decimal),
    [defaultValue, decimal],
  );
  const [rawValue, setRawValue] = useState(initialValue);

  return (
    <>
      <input type="hidden" name={name} value={disabled ? "" : rawValue} />
      <input
        type="text"
        inputMode={decimal ? "decimal" : "numeric"}
        value={disabled ? "" : formatInputNumber(rawValue)}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => setRawValue(cleanValue(event.target.value, decimal))}
        className={className}
      />
    </>
  );
}
