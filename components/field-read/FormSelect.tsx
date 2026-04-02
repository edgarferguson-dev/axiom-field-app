"use client";

import { useState, useRef } from "react";

export function FormSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [custom, setCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "Other") {
      setCustom(true);
      onChange("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setCustom(false);
      onChange(e.target.value);
    }
  };

  const selectValue = custom ? "Other" : options.includes(value) ? value : value ? "Other" : "";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        value={selectValue}
        onChange={handleSelect}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <option value="" disabled>
          {placeholder ?? `Select ${label}`}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {custom && (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}…`}
          className="mt-2 w-full rounded-xl border border-accent/40 bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      )}
    </div>
  );
}
