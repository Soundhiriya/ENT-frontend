// CustomMedicalHistoryInput.tsx
// Lets a doctor add free-text medical history conditions beyond the fixed
// checklist (Diabetes, Hypertension, etc). Same interaction as
// DynamicFindingListEditor: type, Enter (or blur) to add, click × to
// remove. Renders as pills so it drops straight into the existing
// Medical History flex-wrap row.

"use client";

import { useState } from "react";

interface CustomMedicalHistoryInputProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export default function CustomMedicalHistoryInput({
  items,
  onChange,
}: CustomMedicalHistoryInputProps) {
  const [value, setValue] = useState("");

  const addItem = () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const exists = items.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      onChange([...items, trimmed]);
    }
    setValue("");
  };

  const removeItem = (item: string) => {
    onChange(items.filter((existing) => existing !== item));
  };

  return (
    <>
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700"
        >
          {item}
          <button
            type="button"
            onClick={() => removeItem(item)}
            className="font-bold text-red-400 hover:text-red-600"
            aria-label={`Remove ${item}`}
          >
            ×
          </button>
        </span>
      ))}

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+ Add custom"
        className="h-7 w-32 rounded-full border border-dashed border-slate-300 bg-white px-2.5 text-[11px] text-slate-600 placeholder:text-slate-400 focus:border-red-400 focus:border-solid focus:outline-none focus:ring-1 focus:ring-red-400"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addItem();
          }
        }}
        onBlur={addItem}
      />
    </>
  );
}
