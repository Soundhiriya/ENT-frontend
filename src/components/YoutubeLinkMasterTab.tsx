"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
    YoutubeLinkDropdown,
    getYoutubeLinkMasterData,
    createYoutubeLinkMaster,
    updateYoutubeLinkMaster,
    deleteYoutubeLinkMaster,
} from "@/src/services/masterservices";

export default function YoutubeLinkMasterTab() {
    const [items, setItems] = useState<YoutubeLinkDropdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");

    const loadItems = async () => {
        setLoading(true);
        try {
            const response = await getYoutubeLinkMasterData();
            setItems(response);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load YouTube links");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newUrl.trim()) return;

        try {
            setSaving(true);
            await createYoutubeLinkMaster(newTitle.trim(), newUrl.trim());
            toast.success("YouTube link added successfully");
            setNewTitle("");
            setNewUrl("");
            await loadItems();
        } catch (error: any) {
            toast.error(error?.message ?? "Failed to add YouTube link");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (item: YoutubeLinkDropdown) => {
        setEditingId(item.id);
        setEditTitle(item.title);
        setEditUrl(item.youtubeUrl);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditUrl("");
    };

    const saveEdit = async (id: number) => {
        if (!editTitle.trim() || !editUrl.trim()) return;

        try {
            await updateYoutubeLinkMaster(id, editTitle.trim(), editUrl.trim());
            toast.success("YouTube link updated successfully");
            setEditingId(null);
            await loadItems();
        } catch (error: any) {
            toast.error(error?.message ?? "Failed to update YouTube link");
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm("Remove this YouTube link?")) return;

        try {
            await deleteYoutubeLinkMaster(id);
            toast.success("YouTube link removed successfully");
            await loadItems();
        } catch (error: any) {
            toast.error(error?.message ?? "Failed to remove YouTube link");
        }
    };

    return (
        <div>
            <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-2">
                <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Title"
                    className="min-w-[160px] flex-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20"
                />
                <input
                    value={newUrl}
                    data-no-capitalize
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="YouTube URL"
                    className="min-w-[200px] flex-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-[10px] bg-[var(--brand-primary)] px-3 py-2 text-xs font-medium text-white shadow-sm transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                >
                    <Plus size={15} />
                    Add
                </button>
            </form>

            {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">Loading...</div>
            ) : items.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                    No YouTube links added yet.
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
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Title"
                                        className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-sm outline-none focus:border-[var(--brand-secondary)]"
                                    />
                                    <input
                                        value={editUrl}
                                        data-no-capitalize
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        placeholder="YouTube URL"
                                        className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-sm outline-none focus:border-[var(--brand-secondary)]"
                                    />
                                    <button
                                        onClick={() => saveEdit(item.id)}
                                        aria-label="Save"
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50"
                                    >
                                        <Check size={15} />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        aria-label="Cancel"
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
                                    >
                                        <X size={15} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-800">
                                            {item.title}
                                        </p>
                                        <p className="truncate text-xs text-slate-400">
                                            {item.youtubeUrl}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => startEdit(item)}
                                        aria-label="Edit"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        aria-label="Remove"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-500 hover:bg-red-50"
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
