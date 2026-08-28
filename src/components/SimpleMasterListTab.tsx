"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface SimpleMasterItem {
    id: number;
}

interface Props<T extends SimpleMasterItem> {
    label: string;
    placeholder: string;
    fetchAll: () => Promise<T[]>;
    create: (value: string) => Promise<T>;
    update: (id: number, value: string) => Promise<T>;
    remove: (id: number) => Promise<{ message: string }>;
    getValue: (item: T) => string;
}

export default function SimpleMasterListTab<T extends SimpleMasterItem>({
    label,
    placeholder,
    fetchAll,
    create,
    update,
    remove,
    getValue,
}: Props<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [newValue, setNewValue] = useState("");
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const loadItems = async () => {
        setLoading(true);
        try {
            const response = await fetchAll();
            setItems(response);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to load ${label.toLowerCase()}s`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        try {
            setSaving(true);
            await create(newValue.trim());
            toast.success(`${label} added successfully`);
            setNewValue("");
            await loadItems();
        } catch (error: any) {
            toast.error(error?.message ?? `Failed to add ${label.toLowerCase()}`);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (item: T) => {
        setEditingId(item.id);
        setEditValue(getValue(item));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveEdit = async (id: number) => {
        if (!editValue.trim()) return;

        try {
            await update(id, editValue.trim());
            toast.success(`${label} updated successfully`);
            setEditingId(null);
            await loadItems();
        } catch (error: any) {
            toast.error(error?.message ?? `Failed to update ${label.toLowerCase()}`);
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm(`Remove this ${label.toLowerCase()}?`)) return;

        try {
            await remove(id);
            toast.success(`${label} removed successfully`);
            await loadItems();
        } catch (error: any) {
            toast.error(error?.message ?? `Failed to remove ${label.toLowerCase()}`);
        }
    };

    return (
        <div>
            <form onSubmit={handleAdd} className="mb-4 flex gap-2">
                <input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-[10px] bg-[var(--brand-primary)] px-3 py-2 text-xs font-medium text-white shadow-sm transition-opacity duration-150 hover:opacity-90 disabled:opacity-60 max-lg:min-h-[40px]"
                >
                    <Plus size={15} />
                    Add
                </button>
            </form>

            {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">Loading...</div>
            ) : items.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                    No {label.toLowerCase()}s added yet.
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-3 py-2"
                        >
                            {editingId === item.id ? (
                                <>
                                    <input
                                        autoFocus
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-sm outline-none focus:border-[var(--brand-secondary)]"
                                    />
                                    <button
                                        onClick={() => saveEdit(item.id)}
                                        aria-label="Save"
                                        className="flex h-7 w-7 max-lg:h-10 max-lg:w-10 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50"
                                    >
                                        <Check size={15} />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        aria-label="Cancel"
                                        className="flex h-7 w-7 max-lg:h-10 max-lg:w-10 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
                                    >
                                        <X size={15} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 text-sm text-slate-800">
                                        {getValue(item)}
                                    </span>
                                    <button
                                        onClick={() => startEdit(item)}
                                        aria-label="Edit"
                                        className="flex h-7 w-7 max-lg:h-10 max-lg:w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        aria-label="Remove"
                                        className="flex h-7 w-7 max-lg:h-10 max-lg:w-10 items-center justify-center rounded-md text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
