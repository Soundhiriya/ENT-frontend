// DynamicFindingListEditor.tsx
// Reusable dynamic list editor — same behavior/UI as FindingDetailsScreen:
// single-line input, Enter to add, removable chip per item, order preserved.

"use client";

import { FindingDto } from "@/src/types/consultationtypes";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface DynamicFindingListEditorProps {
  label: string;
  icon: LucideIcon;
  items: FindingDto[];
  setItems: React.Dispatch<React.SetStateAction<FindingDto[]>>;
  placeholder?: string;
}

export default function DynamicFindingListEditor({
  label,
  icon: Icon,
  items,
  setItems,
  placeholder,
}: DynamicFindingListEditorProps) {
  const [value, setValue] = useState("");

  const addItem = () => {
    if (!value.trim()) return;

    const exists = items.some(
      (item) => item.finding.toLowerCase() === value.trim().toLowerCase()
    );

    if (exists) return;

    setItems((prev) => [...prev, { finding: value.trim() }]);

    setValue("");
  };

  const removeItem = (finding: string) => {
    setItems((prev) => prev.filter((item) => item.finding !== finding));
  };

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </h3>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()} finding`}
        className="h-8 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addItem();
          }
        }}
      />

      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <div
              key={item.finding}
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
            >
              <span>{item.finding}</span>
              <button
                type="button"
                onClick={() => removeItem(item.finding)}
                className="font-bold text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
