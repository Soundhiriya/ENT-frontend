"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { toast } from "sonner";

import {
    Bookmark,
    Save,
    RefreshCw,
    Trash2,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import {
    BookmarkDetailDto,
    BookmarkResponse,
    BookmarkPageResponse,
    CreateBookmarkDto,
} from "../types/bookmark";

import { useAuth } from "../Context/AuthProvider";

import {
    createBookmark,
    deleteBookmark,
    getBookmark,
    getBookmarks,
    updateBookmark,
} from "../services/bookmarkService";

import {
    ComplaintDto,
    DiagnosisDto,
    FindingDto,
    MedicineDto,
    YoutubeVideoDto,
} from "../types/consultationtypes";


// ============================================================
// PROPS
// ============================================================

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

    setComplaints: React.Dispatch<
        React.SetStateAction<ComplaintDto[]>
    >;

    setFindings: React.Dispatch<
        React.SetStateAction<FindingDto[]>
    >;

    setOtoendoscopies: React.Dispatch<
        React.SetStateAction<FindingDto[]>
    >;

    setDiagnosticNasalEndoscopies: React.Dispatch<
        React.SetStateAction<FindingDto[]>
    >;

    setVideoLaryngoscopies: React.Dispatch<
        React.SetStateAction<FindingDto[]>
    >;

    setDiagnoses: React.Dispatch<
        React.SetStateAction<DiagnosisDto[]>
    >;

    setMedicines: React.Dispatch<
        React.SetStateAction<MedicineDto[]>
    >;

    setAdvice: React.Dispatch<
        React.SetStateAction<string>
    >;

    setYoutubeVideos: React.Dispatch<
        React.SetStateAction<YoutubeVideoDto[]>
    >;
}


// ============================================================
// MERGE ARRAY BY KEY
// ============================================================

function mergeByKey<
    T extends Record<K, string>,
    K extends string
>(
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
                        String(existing[key])
                            .toLowerCase()
                            ===
                        String(item[key])
                            .toLowerCase()
                )
        ),
    ];
}


// ============================================================
// REMOVE ARRAY BY KEY
// ============================================================

function removeByKey<
    T extends Record<K, string>,
    K extends string
>(
    current: T[],
    toRemove: T[],
    key: K
): T[] {

    return current.filter(
        (item) =>
            !toRemove.some(
                (removed) =>
                    String(removed[key])
                        .toLowerCase()
                        ===
                    String(item[key])
                        .toLowerCase()
            )
    );
}


// ============================================================
// MERGE ADVICE
// ============================================================

function mergeAdvice(
    current: string,
    incoming?: string
): string {

    const chunk =
        incoming?.trim();

    if (!chunk) {
        return current;
    }

    if (!current.trim()) {
        return chunk;
    }

    if (current.includes(chunk)) {
        return current;
    }

    return `${current}\n${chunk}`;
}


// ============================================================
// REMOVE ADVICE
// ============================================================

function removeAdviceChunk(
    current: string,
    toRemove?: string
): string {

    const chunk =
        toRemove?.trim();

    if (!chunk) {
        return current;
    }

    return current
        .replace(chunk, "")
        .replace(/\n{2,}/g, "\n")
        .trim();
}


// ============================================================
// MERGE MEDICINES
// ============================================================

function mergeMedicines(
    current: MedicineDto[],
    incoming: MedicineDto[]
): MedicineDto[] {

    return [
        ...current,
        ...incoming,
    ];
}


// ============================================================
// REMOVE MEDICINES
// ============================================================

function removeMedicines(
    current: MedicineDto[],
    toRemove: MedicineDto[]
): MedicineDto[] {

    return current.filter(
        (medicine) =>
            !toRemove.some(
                (removed) =>
                    removed.medicineName ===
                        medicine.medicineName &&

                    removed.dosage ===
                        medicine.dosage &&

                    removed.frequency ===
                        medicine.frequency &&

                    removed.duration ===
                        medicine.duration &&

                    removed.instructions ===
                        medicine.instructions
            )
    );
}


// ============================================================
// COMPONENT
// ============================================================

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


    // ========================================================
    // BOOKMARK LIST
    // ========================================================

    const [bookmarks, setBookmarks] =
        useState<BookmarkResponse[]>([]);


    // ========================================================
    // SELECTED BOOKMARKS
    // ========================================================

    const [selectedBookmarks, setSelectedBookmarks] =
        useState<BookmarkDetailDto[]>([]);


    // ========================================================
    // BOOKMARK NAME
    // ========================================================

    const [bookmarkName, setBookmarkName] =
        useState("");


    // ========================================================
    // SEARCH TEXT
    // ========================================================

    const [bookmarkSearch, setBookmarkSearch] =
        useState("");


    // ========================================================
    // DROPDOWN OPEN / CLOSE
    // ========================================================

    const [bookmarkDropdownOpen, setBookmarkDropdownOpen] =
        useState(false);


    // ========================================================
    // PAGINATION
    // ========================================================

    const [bookmarkPage, setBookmarkPage] =
        useState(0);

    const [bookmarkTotalPages, setBookmarkTotalPages] =
        useState(0);

    const [bookmarkTotalElements, setBookmarkTotalElements] =
        useState(0);


    // ========================================================
    // LOADING
    // ========================================================

    const [bookmarkLoading, setBookmarkLoading] =
        useState(false);


    // ========================================================
    // REQUEST ID
    //
    // Prevents an older search response from replacing a newer
    // search result.
    // ========================================================

    const requestIdRef =
        useRef(0);


    // ========================================================
    // SEARCH TIMER
    // ========================================================

    const searchTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);


    // ========================================================
    // DROPDOWN REF
    // ========================================================

    const bookmarkDropdownRef =
        useRef<HTMLDivElement | null>(null);


    // ========================================================
    // LOAD BOOKMARKS
    // ========================================================

    const loadBookmarks = useCallback(
        async (
            search: string = "",
            page: number = 0
        ) => {

            const requestId =
                ++requestIdRef.current;

            try {

                setBookmarkLoading(true);


                const response =
                    await getBookmarks(
                        search.trim(),
                        page,
                        10
                    );


                // Ignore old request

                if (
                    requestId !==
                    requestIdRef.current
                ) {
                    return;
                }


                /*
                 * Backend returns Spring Page:
                 *
                 * {
                 *     content: [],
                 *     totalPages: 3,
                 *     totalElements: 25,
                 *     number: 0
                 * }
                 */

                const content =
                    Array.isArray(
                        response?.content
                    )
                        ? response.content
                        : [];


                // IMPORTANT:
                // bookmarks must ALWAYS be an array.

                setBookmarks(
                    content
                );


                setBookmarkPage(
                    typeof response?.number ===
                        "number"
                        ? response.number
                        : page
                );


                setBookmarkTotalPages(
                    typeof response?.totalPages ===
                        "number"
                        ? response.totalPages
                        : 0
                );


                setBookmarkTotalElements(
                    typeof response?.totalElements ===
                        "number"
                        ? response.totalElements
                        : content.length
                );

            } catch (error) {

                if (
                    requestId !==
                    requestIdRef.current
                ) {
                    return;
                }


                console.error(
                    "Failed to load bookmarks:",
                    error
                );


                setBookmarks([]);

                setBookmarkTotalPages(0);

                setBookmarkTotalElements(0);


                toast.error(
                    "Failed to load bookmarks"
                );

            } finally {

                if (
                    requestId ===
                    requestIdRef.current
                ) {

                    setBookmarkLoading(
                        false
                    );
                }
            }

        },
        []
    );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        loadBookmarks(
            "",
            0
        );

    }, [loadBookmarks]);


    // ========================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // ========================================================

    useEffect(() => {

        const handleOutsideClick = (
            event: MouseEvent
        ) => {

            if (
                bookmarkDropdownRef.current &&
                !bookmarkDropdownRef.current.contains(
                    event.target as Node
                )
            ) {

                setBookmarkDropdownOpen(
                    false
                );
            }
        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    // ========================================================
    // CLEAN SEARCH TIMER
    // ========================================================

    useEffect(() => {

        return () => {

            if (
                searchTimerRef.current
            ) {

                clearTimeout(
                    searchTimerRef.current
                );

                searchTimerRef.current =
                    null;
            }

        };

    }, []);


    // ========================================================
    // SEARCH BOOKMARKS
    // ========================================================

    const handleBookmarkSearch = (
        value: string
    ) => {

        setBookmarkSearch(
            value
        );


        setBookmarkDropdownOpen(
            true
        );


        /*
         * Every new search starts from page 0.
         */

        setBookmarkPage(0);


        /*
         * Cancel previous request timer.
         */

        if (
            searchTimerRef.current
        ) {

            clearTimeout(
                searchTimerRef.current
            );
        }


        /*
         * Wait 300ms before calling backend.
         */

        searchTimerRef.current =
            setTimeout(() => {

                loadBookmarks(
                    value,
                    0
                );

            }, 300);
    };


    // ========================================================
    // OPEN BOOKMARK DROPDOWN
    //
    // Clicking the search box without typing loads all
    // bookmarks.
    // ========================================================

    const handleOpenBookmarkDropdown =
        async () => {

            setBookmarkDropdownOpen(
                true
            );


            /*
             * If search is empty, reload first page
             * of all bookmarks.
             */

            if (
                !bookmarkSearch.trim()
            ) {

                await loadBookmarks(
                    "",
                    0
                );

            } else {

                /*
                 * If search already has text,
                 * search that text again.
                 */

                await loadBookmarks(
                    bookmarkSearch,
                    0
                );
            }
        };


    // ========================================================
    // APPLY BOOKMARK CONTENT
    // ========================================================

    const applyBookmarkContent = (
        response: BookmarkDetailDto
    ) => {

        setComplaints(
            (prev) =>
                mergeByKey(
                    prev,
                    response.complaints ?? [],
                    "complaint"
                )
        );


        setFindings(
            (prev) =>
                mergeByKey(
                    prev,
                    response.findings ?? [],
                    "finding"
                )
        );


        setOtoendoscopies(
            (prev) =>
                mergeByKey(
                    prev,
                    response.otoendoscopies ?? [],
                    "finding"
                )
        );


        setDiagnosticNasalEndoscopies(
            (prev) =>
                mergeByKey(
                    prev,
                    response.diagnosticNasalEndoscopies ?? [],
                    "finding"
                )
        );


        setVideoLaryngoscopies(
            (prev) =>
                mergeByKey(
                    prev,
                    response.videoLaryngoscopies ?? [],
                    "finding"
                )
        );


        setDiagnoses(
            (prev) =>
                mergeByKey(
                    prev,
                    response.diagnoses ?? [],
                    "diagnosis"
                )
        );


        setMedicines(
            (prev) =>
                mergeMedicines(
                    prev,
                    response.medicines ?? []
                )
        );


        setAdvice(
            (prev) =>
                mergeAdvice(
                    prev,
                    response.advice
                )
        );


        setYoutubeVideos(
            (prev) => {

                const incoming =
                    response.youtubeVideos ?? [];


                const filtered =
                    incoming.filter(
                        (video) =>
                            !prev.some(
                                (existing) =>
                                    existing.youtubeUrl ===
                                    video.youtubeUrl
                            )
                    );


                return [
                    ...prev,
                    ...filtered,
                ];
            }
        );
    };


    // ========================================================
    // REVERT BOOKMARK CONTENT
    // ========================================================

    const revertBookmarkContent = (
        bookmark: BookmarkDetailDto
    ) => {

        setComplaints(
            (prev) =>
                removeByKey(
                    prev,
                    bookmark.complaints ?? [],
                    "complaint"
                )
        );


        setFindings(
            (prev) =>
                removeByKey(
                    prev,
                    bookmark.findings ?? [],
                    "finding"
                )
        );


        setOtoendoscopies(
            (prev) =>
                removeByKey(
                    prev,
                    bookmark.otoendoscopies ?? [],
                    "finding"
                )
        );


        setDiagnosticNasalEndoscopies(
            (prev) =>
                removeByKey(
                    prev,
                    bookmark.diagnosticNasalEndoscopies ?? [],
                    "finding"
                )
        );


        setVideoLaryngoscopies(
            (prev) =>
                removeByKey(
                    prev,
                    bookmark.videoLaryngoscopies ?? [],
                    "finding"
                )
        );


        setDiagnoses(
            (prev) =>
                removeByKey(
                    prev,
                    bookmark.diagnoses ?? [],
                    "diagnosis"
                )
        );


        setMedicines(
            (prev) =>
                removeMedicines(
                    prev,
                    bookmark.medicines ?? []
                )
        );


        setAdvice(
            (prev) =>
                removeAdviceChunk(
                    prev,
                    bookmark.advice
                )
        );


        setYoutubeVideos(
            (prev) =>
                prev.filter(
                    (video) =>
                        !(bookmark.youtubeVideos ?? [])
                            .some(
                                (bookmarkVideo) =>
                                    bookmarkVideo.youtubeUrl ===
                                    video.youtubeUrl
                            )
                )
        );
    };


    // ========================================================
    // SELECT BOOKMARK
    // ========================================================

    const handleSelectBookmark = async (
        value: string
    ) => {

        if (!value) {
            return;
        }


        const id =
            Number(value);


        if (
            !Number.isFinite(id)
        ) {
            return;
        }


        /*
         * Don't select the same bookmark twice.
         */

        if (
            selectedBookmarks.some(
                (bookmark) =>
                    bookmark.id === id
            )
        ) {
            setBookmarkDropdownOpen(
                false
            );

            return;
        }


        try {

            setBookmarkLoading(
                true
            );


            const response =
                await getBookmark(
                    id
                );


            if (!response) {

                toast.error(
                    "Bookmark not found"
                );

                return;
            }


            /*
             * Apply bookmark data
             * to consultation.
             */

            applyBookmarkContent(
                response
            );


            /*
             * Add to selected bookmarks.
             */

            setSelectedBookmarks(
                (prev) => {

                    const next = [
                        ...prev,
                        response,
                    ];


                    /*
                     * If only one bookmark is selected,
                     * put its name into Bookmark Name.
                     *
                     * If multiple bookmarks are selected,
                     * clear Bookmark Name so user can enter
                     * a new name for merged content.
                     */

                    setBookmarkName(
                        next.length === 1
                            ? next[0].bookmarkName
                            : ""
                    );


                    return next;
                }
            );


            /*
             * Clear search after selection.
             */

            setBookmarkSearch("");


            /*
             * Close dropdown.
             */

            setBookmarkDropdownOpen(
                false
            );

        } catch (error) {

            console.error(
                "Failed to get bookmark:",
                error
            );

            toast.error(
                "Failed to load bookmark"
            );

        } finally {

            setBookmarkLoading(
                false
            );
        }
    };


    // ========================================================
    // REMOVE SELECTED BOOKMARK
    // ========================================================

    const handleRemoveSelectedBookmark = (
        bookmark: BookmarkDetailDto
    ) => {

        /*
         * Remove its content from consultation.
         */

        revertBookmarkContent(
            bookmark
        );


        /*
         * Remove from selected list.
         */

        setSelectedBookmarks(
            (prev) => {

                const next =
                    prev.filter(
                        (item) =>
                            item.id !==
                            bookmark.id
                    );


                /*
                 * If exactly one remains,
                 * use that bookmark name.
                 */

                setBookmarkName(
                    next.length === 1
                        ? next[0].bookmarkName
                        : ""
                );


                return next;
            }
        );
    };


    // ========================================================
    // UPDATE BOOKMARK
    // ========================================================

    const handleUpdateBookmark =
        async () => {

            if (
                selectedBookmarks.length !== 1
            ) {
                return;
            }


            if (
                !bookmarkName.trim()
            ) {

                toast.error(
                    "Please enter bookmark name"
                );

                return;
            }


            try {

                const payload:
                    CreateBookmarkDto = {

                    bookmarkName:
                        bookmarkName.trim(),

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


                await updateBookmark(
                    selectedBookmarks[0].id,
                    payload
                );


                toast.success(
                    "Bookmark updated successfully"
                );


                await loadBookmarks(
                    bookmarkSearch,
                    bookmarkPage
                );

            } catch (error) {

                console.error(
                    "Failed to update bookmark:",
                    error
                );

                toast.error(
                    "Failed to update bookmark"
                );
            }
        };


    // ========================================================
    // DELETE BOOKMARK
    // ========================================================

    const handleDeleteBookmark =
        async () => {

            if (
                selectedBookmarks.length !== 1
            ) {
                return;
            }


            if (
                !window.confirm(
                    "Delete this bookmark?"
                )
            ) {
                return;
            }


            try {

                await deleteBookmark(
                    selectedBookmarks[0].id
                );


                toast.success(
                    "Bookmark deleted"
                );


                /*
                 * Clear selected bookmark.
                 */

                setSelectedBookmarks(
                    []
                );

                setBookmarkName("");


                /*
                 * Clear consultation content.
                 */

                setComplaints([]);

                setFindings([]);

                setOtoendoscopies([]);

                setDiagnosticNasalEndoscopies([]);

                setVideoLaryngoscopies([]);

                setDiagnoses([]);

                setMedicines([]);

                setAdvice("");

                setYoutubeVideos([]);


                /*
                 * Reload bookmarks.
                 */

                await loadBookmarks(
                    bookmarkSearch,
                    bookmarkPage
                );

            } catch (error) {

                console.error(
                    "Failed to delete bookmark:",
                    error
                );

                toast.error(
                    "Failed to delete bookmark"
                );
            }
        };


    // ========================================================
    // SAVE BOOKMARK
    // ========================================================

    const handleSaveBookmark =
        async () => {

            if (
                !bookmarkName.trim()
            ) {

                toast.error(
                    "Please enter bookmark name"
                );

                return;
            }


            const payload:
                CreateBookmarkDto = {

                bookmarkName:
                    bookmarkName.trim(),

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


            /*
             * Find existing bookmark belonging
             * to current doctor.
             */

            const existing =
                bookmarks.find(
                    (bookmark) =>
                        bookmark.doctorId ===
                            user?.id &&

                        bookmark.bookmarkName
                            .trim()
                            .toLowerCase() ===
                        bookmarkName
                            .trim()
                            .toLowerCase()
                );


            try {

                if (existing) {

                    await updateBookmark(
                        existing.id,
                        payload
                    );


                    toast.success(
                        `"${bookmarkName.trim()}" already existed — saved into it.`
                    );

                } else {

                    await createBookmark(
                        payload
                    );


                    toast.success(
                        "Bookmark saved successfully"
                    );
                }


                setBookmarkName("");

                setSelectedBookmarks([]);

                setBookmarkSearch("");

                setBookmarkDropdownOpen(
                    false
                );


                /*
                 * Reload first page.
                 */

                await loadBookmarks(
                    "",
                    0
                );

            } catch (error) {

                console.error(
                    "Failed to save bookmark:",
                    error
                );

                toast.error(
                    "Failed to save bookmark"
                );
            }
        };


    // ========================================================
    // PREVIOUS PAGE
    // ========================================================

    const handlePreviousPage =
        async () => {

            if (
                bookmarkLoading ||
                bookmarkPage <= 0
            ) {
                return;
            }


            const previousPage =
                bookmarkPage - 1;


            await loadBookmarks(
                bookmarkSearch,
                previousPage
            );
        };


    // ========================================================
    // NEXT PAGE
    // ========================================================

    const handleNextPage =
        async () => {

            if (
                bookmarkLoading ||
                bookmarkPage >=
                    bookmarkTotalPages - 1
            ) {
                return;
            }


            const nextPage =
                bookmarkPage + 1;


            await loadBookmarks(
                bookmarkSearch,
                nextPage
            );
        };


    // ========================================================
    // SELECTION STATUS
    // ========================================================

    const isSingleSelection =
        selectedBookmarks.length === 1;


    const isMultiSelection =
        selectedBookmarks.length >= 2;


    const isOwner =
        isSingleSelection &&
        selectedBookmarks[0].doctorId ===
            user?.id;


    const canEditSelected =
        isSingleSelection &&
        isOwner;


    // ========================================================
    // AVAILABLE BOOKMARKS
    // ========================================================

    const availableBookmarks =
        bookmarks.filter(
            (bookmark) =>
                !selectedBookmarks.some(
                    (selected) =>
                        selected.id ===
                        bookmark.id
                )
        );


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="mb-3 flex items-center justify-between"
            >

                <h2
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >

                    <Bookmark
                        className="h-3.5 w-3.5"
                    />

                    Bookmark Template

                </h2>


                {/* EDITING */}

                {canEditSelected && (

                    <span
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                    >
                        Editing
                    </span>

                )}


                {/* SHARED */}

                {isSingleSelection &&
                    !isOwner && (

                    <span
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                    >

                        Shared by Dr.{" "}

                        {
                            selectedBookmarks[0]
                                .doctorName
                        }

                    </span>

                )}


                {/* MERGED */}

                {isMultiSelection && (

                    <span
                        className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                    >

                        {
                            selectedBookmarks.length
                        }{" "}

                        merged

                    </span>

                )}

            </div>


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div
                className="flex flex-col gap-3"
            >


                {/* ==================================================
                    SINGLE SEARCHABLE DROPDOWN
                ================================================== */}

                <div
                    ref={
                        bookmarkDropdownRef
                    }
                    className="relative"
                >

                    {/* SEARCH INPUT */}

                    <div
                        className="relative"
                    >

                        <Search
                            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                        />


                        <input
                            type="text"
                            value={
                                bookmarkSearch
                            }
                            placeholder="Search bookmark..."
                            onFocus={
                                handleOpenBookmarkDropdown
                            }
                            onChange={(e) =>
                                handleBookmarkSearch(
                                    e.target.value
                                )
                            }
                            className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-8 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />


                        {/* CLEAR */}

                        {bookmarkSearch && (

                            <button
                                type="button"
                                onMouseDown={(e) =>
                                    e.preventDefault()
                                }
                                onClick={() => {

                                    if (
                                        searchTimerRef.current
                                    ) {

                                        clearTimeout(
                                            searchTimerRef.current
                                        );

                                        searchTimerRef.current =
                                            null;
                                    }


                                    setBookmarkSearch(
                                        ""
                                    );

                                    setBookmarkPage(
                                        0
                                    );

                                    setBookmarkDropdownOpen(
                                        true
                                    );


                                    loadBookmarks(
                                        "",
                                        0
                                    );
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                aria-label="Clear bookmark search"
                            >

                                <X
                                    className="h-3.5 w-3.5"
                                />

                            </button>

                        )}

                    </div>


                    {/* ==================================================
                        DROPDOWN
                    ================================================== */}

                    {bookmarkDropdownOpen && (

                        <div
                            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
                            onMouseDown={(e) =>
                                e.preventDefault()
                            }
                        >

                            {/* LOADING */}

                            {bookmarkLoading && (

                                <div
                                    className="flex items-center gap-2 px-3 py-2.5 text-xs text-slate-500"
                                >

                                    <Loader2
                                        className="h-3.5 w-3.5 animate-spin"
                                    />

                                    Loading bookmarks...

                                </div>

                            )}


                            {/* RESULTS */}

                            {!bookmarkLoading &&
                                availableBookmarks.length >
                                    0 && (

                                <div
                                    className="py-1"
                                >

                                    {availableBookmarks.map(
                                        (bookmark) => (

                                            <button
                                                key={
                                                    bookmark.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSelectBookmark(
                                                        String(
                                                            bookmark.id
                                                        )
                                                    )
                                                }
                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50"
                                            >

                                                <span
                                                    className="truncate"
                                                >

                                                    {
                                                        bookmark.bookmarkName
                                                    }

                                                </span>


                                                {bookmark.doctorId !==
                                                    user?.id && (

                                                    <span
                                                        className="ml-2 shrink-0 text-[11px] text-slate-400"
                                                    >

                                                        Dr.{" "}

                                                        {
                                                            bookmark.doctorName
                                                        }

                                                    </span>

                                                )}

                                            </button>

                                        )
                                    )}

                                </div>

                            )}


                            {/* NO RESULTS */}

                            {!bookmarkLoading &&
                                availableBookmarks.length ===
                                    0 && (

                                <div
                                    className="px-3 py-3 text-center text-xs text-slate-400"
                                >

                                    {bookmarkSearch.trim()
                                        ? `No bookmarks found for "${bookmarkSearch.trim()}".`
                                        : "No bookmarks found."
                                    }

                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* ==================================================
                    SELECTED BOOKMARKS
                ================================================== */}

                {selectedBookmarks.length >
                    0 && (

                    <div
                        className="flex flex-wrap gap-1.5"
                    >

                        {selectedBookmarks.map(
                            (bookmark) => (

                                <div
                                    key={
                                        bookmark.id
                                    }
                                    className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                                >

                                    <span>

                                        {
                                            bookmark.bookmarkName
                                        }


                                        {bookmark.doctorId !==
                                            user?.id && (

                                            <span
                                                className="text-blue-500"
                                            >

                                                {" "}
                                                · Dr.{" "}

                                                {
                                                    bookmark.doctorName
                                                }

                                            </span>

                                        )}

                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveSelectedBookmark(
                                                bookmark
                                            )
                                        }
                                        className="font-bold text-red-500 hover:text-red-700"
                                        aria-label={`Remove ${bookmark.bookmarkName}`}
                                    >

                                        ×

                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* ==================================================
                    PAGINATION
                ================================================== */}

                {bookmarkTotalPages >
                    1 && (

                    <div
                        className="flex items-center justify-between border-t border-slate-100 pt-2"
                    >

                        {/* PREVIOUS */}

                        <button
                            type="button"
                            disabled={
                                bookmarkLoading ||
                                bookmarkPage <= 0
                            }
                            onClick={
                                handlePreviousPage
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            <ChevronLeft
                                className="h-3.5 w-3.5"
                            />

                            Previous

                        </button>


                        {/* PAGE */}

                        <span
                            className="text-xs text-slate-500"
                        >

                            Page{" "}

                            {
                                bookmarkPage + 1
                            }

                            {" "}of{" "}

                            {
                                bookmarkTotalPages
                            }


                            {bookmarkTotalElements >
                                0 && (

                                <span
                                    className="ml-1 text-slate-400"
                                >

                                    (
                                    {
                                        bookmarkTotalElements
                                    }
                                    )

                                </span>

                            )}

                        </span>


                        {/* NEXT */}

                        <button
                            type="button"
                            disabled={
                                bookmarkLoading ||
                                bookmarkPage >=
                                    bookmarkTotalPages - 1
                            }
                            onClick={
                                handleNextPage
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            Next

                            <ChevronRight
                                className="h-3.5 w-3.5"
                            />

                        </button>

                    </div>

                )}


                {/* ==================================================
                    BOOKMARK NAME
                ================================================== */}

                <input
                    type="text"
                    placeholder="Bookmark Name"
                    value={
                        bookmarkName
                    }
                    disabled={
                        canEditSelected
                    }
                    onChange={(e) =>
                        setBookmarkName(
                            e.target.value
                        )
                    }
                    className="h-9 rounded-md border border-slate-300 px-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                />


                {/* ==================================================
                    BUTTONS
                ================================================== */}

                {canEditSelected ? (

                    <div
                        className="flex gap-2"
                    >

                        {/* UPDATE */}

                        <button
                            type="button"
                            onClick={
                                handleUpdateBookmark
                            }
                            disabled={
                                bookmarkLoading
                            }
                            className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <RefreshCw
                                className="h-3.5 w-3.5"
                            />

                            Update

                        </button>


                        {/* DELETE */}

                        <button
                            type="button"
                            onClick={
                                handleDeleteBookmark
                            }
                            disabled={
                                bookmarkLoading
                            }
                            className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <Trash2
                                className="h-3.5 w-3.5"
                            />

                            Delete

                        </button>

                    </div>

                ) : (

                    <button
                        type="button"
                        onClick={
                            handleSaveBookmark
                        }
                        disabled={
                            bookmarkLoading
                        }
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <Save
                            className="h-3.5 w-3.5"
                        />

                        {
                            selectedBookmarks.length >
                                0
                                ? "Save as New Bookmark"
                                : "Save Bookmark"
                        }

                    </button>

                )}

            </div>

        </div>
    );
};


export default BookmarkTemplatePanel;