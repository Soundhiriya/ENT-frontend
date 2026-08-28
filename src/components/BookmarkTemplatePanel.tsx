// BookmarkTemplatePanel.tsx

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, Save, RefreshCw, Trash2 } from "lucide-react";

import { BookmarkDetailDto, BookmarkResponse } from "../types/bookmark";
import { useAuth } from "../Context/AuthProvider";

import {
createBookmark,
deleteBookmark,
getBookmark,
getBookmarks,
updateBookmark,
} from "../services/bookmarkService";

import { ComplaintDto, DiagnosisDto, FindingDto, MedicineDto, YoutubeVideoDto } from "../types/consultationtypes";

interface BookmarkTemplatePanelProps {
complaints: ComplaintDto[];
findings: FindingDto[];
otoendoscopies: FindingDto[];
diagnosticNasalEndoscopies: FindingDto[];
videoLaryngoscopies: FindingDto[];
diagnoses: DiagnosisDto[];
medicines: MedicineDto[];
advice: string;
youtubeVideos: YoutubeVideoDto[];

setComplaints: React.Dispatch<React.SetStateAction<ComplaintDto[]>>;
setFindings: React.Dispatch<React.SetStateAction<FindingDto[]>>;
setOtoendoscopies: React.Dispatch<React.SetStateAction<FindingDto[]>>;
setDiagnosticNasalEndoscopies: React.Dispatch<React.SetStateAction<FindingDto[]>>;
setVideoLaryngoscopies: React.Dispatch<React.SetStateAction<FindingDto[]>>;
setDiagnoses: React.Dispatch<React.SetStateAction<DiagnosisDto[]>>;
setMedicines: React.Dispatch<React.SetStateAction<MedicineDto[]>>;
setAdvice: React.Dispatch<React.SetStateAction<string>>;
setYoutubeVideos: React.Dispatch<React.SetStateAction<YoutubeVideoDto[]>>;
}

// Merge `incoming` into `current`, skipping anything whose text (by `key`)
// already matches an existing entry — same case-insensitive dedupe rule the
// manual "type + Enter" inputs use.
function mergeByKey<T extends Record<K, string>, K extends string>(
    current: T[],
    incoming: T[],
    key: K
): T[] {
    return [
        ...current,
        ...incoming.filter(
            (item) =>
                !current.some(
                    (existing) =>
                        (existing[key] as string).toLowerCase() ===
                        (item[key] as string).toLowerCase()
                )
        ),
    ];
}

// The inverse of mergeByKey — drop anything from `current` that matches an
// entry in `toRemove`.
function removeByKey<T extends Record<K, string>, K extends string>(
    current: T[],
    toRemove: T[],
    key: K
): T[] {
    return current.filter(
        (item) =>
            !toRemove.some(
                (removed) =>
                    (removed[key] as string).toLowerCase() ===
                    (item[key] as string).toLowerCase()
            )
    );
}

function mergeAdvice(current: string, incoming?: string): string {
    const chunk = incoming?.trim();
    if (!chunk) return current;
    if (!current.trim()) return chunk;
    if (current.includes(chunk)) return current;
    return `${current}\n${chunk}`;
}

function removeAdviceChunk(current: string, toRemove?: string): string {
    const chunk = toRemove?.trim();
    if (!chunk) return current;
    return current.replace(chunk, "").replace(/\n{2,}/g, "\n").trim();
}

function mergeMedicines(current: MedicineDto[], incoming: MedicineDto[]): MedicineDto[] {
    // Medicines aren't de-duplicated on manual add either (same name can
    // carry a different dosage/frequency), so just append.
    return [...current, ...incoming];
}

function removeMedicines(current: MedicineDto[], toRemove: MedicineDto[]): MedicineDto[] {
    return current.filter(
        (m) =>
            !toRemove.some(
                (r) =>
                    r.medicineName === m.medicineName &&
                    r.dosage === m.dosage &&
                    r.frequency === m.frequency &&
                    r.duration === m.duration &&
                    r.instructions === m.instructions
            )
    );
}

const BookmarkTemplatePanel = ({
complaints,
findings,
otoendoscopies,
diagnosticNasalEndoscopies,
videoLaryngoscopies,
diagnoses,
medicines,
advice,
youtubeVideos,
setComplaints,
setFindings,
setOtoendoscopies,
setDiagnosticNasalEndoscopies,
setVideoLaryngoscopies,
setDiagnoses,
setMedicines,
setAdvice,
setYoutubeVideos,
}: BookmarkTemplatePanelProps) => {
const { user } = useAuth();
const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
const [selectedBookmarks, setSelectedBookmarks] = useState<BookmarkDetailDto[]>([]);
const [bookmarkName, setBookmarkName] = useState("");

useEffect(() => {
    loadBookmarks();
}, []);

const loadBookmarks = async () => {
    try {
    const response = await getBookmarks();
    setBookmarks(response);
    } catch (error) {
    console.error(error);
    toast.error("Failed to load bookmarks");
    }
};

const applyBookmarkContent = (response: BookmarkDetailDto) => {
    setComplaints((prev) => mergeByKey(prev, response.complaints, "complaint"));
    setFindings((prev) => mergeByKey(prev, response.findings, "finding"));
    setOtoendoscopies((prev) => mergeByKey(prev, response.otoendoscopies, "finding"));
    setDiagnosticNasalEndoscopies((prev) =>
        mergeByKey(prev, response.diagnosticNasalEndoscopies, "finding")
    );
    setVideoLaryngoscopies((prev) => mergeByKey(prev, response.videoLaryngoscopies, "finding"));
    setDiagnoses((prev) => mergeByKey(prev, response.diagnoses, "diagnosis"));
    setMedicines((prev) => mergeMedicines(prev, response.medicines));
    setAdvice((prev) => mergeAdvice(prev, response.advice));
    setYoutubeVideos((prev) => {
        const filtered = response.youtubeVideos.filter(
            (v) => !prev.some((p) => p.youtubeUrl === v.youtubeUrl)
        );
        return [...prev, ...filtered];
    });
};

const revertBookmarkContent = (bookmark: BookmarkDetailDto) => {
    setComplaints((prev) => removeByKey(prev, bookmark.complaints, "complaint"));
    setFindings((prev) => removeByKey(prev, bookmark.findings, "finding"));
    setOtoendoscopies((prev) => removeByKey(prev, bookmark.otoendoscopies, "finding"));
    setDiagnosticNasalEndoscopies((prev) =>
        removeByKey(prev, bookmark.diagnosticNasalEndoscopies, "finding")
    );
    setVideoLaryngoscopies((prev) => removeByKey(prev, bookmark.videoLaryngoscopies, "finding"));
    setDiagnoses((prev) => removeByKey(prev, bookmark.diagnoses, "diagnosis"));
    setMedicines((prev) => removeMedicines(prev, bookmark.medicines));
    setAdvice((prev) => removeAdviceChunk(prev, bookmark.advice));
    setYoutubeVideos((prev) =>
        prev.filter((v) => !bookmark.youtubeVideos.some((bv) => bv.youtubeUrl === v.youtubeUrl))
    );
};

const handleSelectBookmark = async (value: string) => {
    if (!value) return;

    const id = Number(value);

    if (selectedBookmarks.some((b) => b.id === id)) {
        return;
    }

    try {
        const response = await getBookmark(id);

        applyBookmarkContent(response);

        setSelectedBookmarks((prev) => {
            const next = [...prev, response];
            setBookmarkName(next.length === 1 ? next[0].bookmarkName : "");
            return next;
        });
    } catch (error) {
        console.error(error);
        toast.error(String(error));
    }
};

const handleRemoveSelectedBookmark = (bookmark: BookmarkDetailDto) => {
    revertBookmarkContent(bookmark);

    setSelectedBookmarks((prev) => {
        const next = prev.filter((b) => b.id !== bookmark.id);
        setBookmarkName(next.length === 1 ? next[0].bookmarkName : "");
        return next;
    });
};

const handleUpdateBookmark = async () => {
    if (selectedBookmarks.length !== 1) return;

    if (!bookmarkName.trim()) {
    toast.error("Please enter bookmark name");
    return;
    }
    try {
    await updateBookmark(selectedBookmarks[0].id, {
        bookmarkName,
        complaints,
        findings,
        otoendoscopies,
        diagnosticNasalEndoscopies,
        videoLaryngoscopies,
        diagnoses,
        medicines,
        advice,
        youtubeVideos,
    });
    toast.success("Bookmark updated successfully");
    await loadBookmarks();
    } catch (error) {
    console.error(error);
    toast.error(String(error));
    }
};

const handleDeleteBookmark = async () => {
    if (selectedBookmarks.length !== 1) return;

    if (!confirm("Delete this bookmark?")) {
    return;
    }
    try {
    await deleteBookmark(selectedBookmarks[0].id);
    toast.success("Bookmark deleted");
    setSelectedBookmarks([]);
    setBookmarkName("");
    setComplaints([]);
    setFindings([]);
    setOtoendoscopies([]);
    setDiagnosticNasalEndoscopies([]);
    setVideoLaryngoscopies([]);
    setDiagnoses([]);
    setMedicines([]);
    setAdvice("");
    setYoutubeVideos([]);
    await loadBookmarks();
    } catch (error) {
    console.error(error);
    toast.error(String(error));
    }
};

// Bookmark names must be unique. Used both for a fresh save and for saving
// merged content from 2+ selected bookmarks (Update is disabled in that
// case, since there's no single bookmark to point it at) — if the typed
// name already belongs to an existing bookmark, save into that one instead
// of creating a duplicate.
const handleSaveBookmark = async () => {
    if (!bookmarkName.trim()) {
    toast.error("Please enter bookmark name");
    return;
    }

    const payload = {
        bookmarkName,
        complaints,
        findings,
        otoendoscopies,
        diagnosticNasalEndoscopies,
        videoLaryngoscopies,
        diagnoses,
        medicines,
        advice,
        youtubeVideos,
    };

    // Only ever match against bookmarks the current doctor actually owns —
    // bookmarks are shared clinic-wide now, so matching against the full
    // list here would try to "update" a bookmark that belongs to someone
    // else (and the backend correctly rejects that, since only the owner
    // can update/delete their own bookmark).
    const existing = bookmarks.find(
        (b) =>
            b.doctorId === user?.id &&
            b.bookmarkName.trim().toLowerCase() === bookmarkName.trim().toLowerCase()
    );

    try {
    if (existing) {
        await updateBookmark(existing.id, payload);
        toast.success(`"${bookmarkName}" already existed — saved into it.`);
    } else {
        await createBookmark(payload);
        toast.success("Bookmark saved successfully");
    }
    setBookmarkName("");
    setSelectedBookmarks([]);
    await loadBookmarks();
    } catch (error) {
    console.error(error);
    toast.error(String(error));
    }
};

const isSingleSelection = selectedBookmarks.length === 1;
const isMultiSelection = selectedBookmarks.length >= 2;
// Update/Delete stay restricted to whoever created the bookmark — anyone
// can select and apply a colleague's bookmark, but not edit/remove it.
const isOwner =
    isSingleSelection && selectedBookmarks[0].doctorId === user?.id;
const canEditSelected = isSingleSelection && isOwner;

return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">

        <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Bookmark className="h-3.5 w-3.5" />
                Bookmark Template
            </h2>

            {canEditSelected && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-sm font-medium text-slate-500 sm:text-[11px]">
                    Editing
                </span>
            )}

            {isSingleSelection && !isOwner && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-700 sm:text-[11px]">
                    Shared by Dr. {selectedBookmarks[0].doctorName}
                </span>
            )}

            {isMultiSelection && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-700 sm:text-[11px]">
                    {selectedBookmarks.length} merged
                </span>
            )}
        </div>

        <div className="flex flex-col gap-3">

            {/* Bookmark Dropdown — a picker: choosing an option adds that
                bookmark on top of whatever is already selected, then resets */}
            <select
                className="h-9 max-lg:h-10 rounded-md border border-slate-300 px-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value=""
                onChange={(e) => handleSelectBookmark(e.target.value)}
            >
                <option value="">
                    {selectedBookmarks.length === 0 ? "Select a bookmark…" : "Add another bookmark…"}
                </option>

                {bookmarks
                    .filter((bookmark) => !selectedBookmarks.some((b) => b.id === bookmark.id))
                    .map((bookmark) => (
                        <option key={bookmark.id} value={bookmark.id}>
                            {bookmark.bookmarkName}
                            {bookmark.doctorId !== user?.id ? ` — Dr. ${bookmark.doctorName}` : ""}
                        </option>
                    ))}
            </select>

            {/* Selected bookmark chips — click × to un-merge just that one */}
            {selectedBookmarks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedBookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                        >
                            <span>
                                {bookmark.bookmarkName}
                                {bookmark.doctorId !== user?.id && (
                                    <span className="text-blue-500"> · Dr. {bookmark.doctorName}</span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveSelectedBookmark(bookmark)}
                                className="font-bold text-red-500 hover:text-red-700"
                                aria-label={`Remove ${bookmark.bookmarkName}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Bookmark Name */}
            <input
                type="text"
                placeholder="Bookmark Name"
                value={bookmarkName}
                disabled={canEditSelected}
                onChange={(e) => setBookmarkName(e.target.value)}
                className="h-9 rounded-md border border-slate-300 px-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
            />

            {/* Buttons — Update/Delete only ever shown to the bookmark's
                owner; anyone else (or a merge of 2+) can only save as new */}
            {canEditSelected ? (
                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={handleUpdateBookmark}
                        className="flex-1 inline-flex h-9 max-lg:h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Update
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteBookmark}
                        className="flex-1 inline-flex h-9 max-lg:h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-100"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>

                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleSaveBookmark}
                    className="inline-flex h-9 max-lg:h-10 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
                >
                    <Save className="h-3.5 w-3.5" />
                    {selectedBookmarks.length > 0 ? "Save as New Bookmark" : "Save Bookmark"}
                </button>
            )}

        </div>

    </div>
);
};

export default BookmarkTemplatePanel;
