import {
    BookmarkDetailDto,
    BookmarkPageResponse,
    CreateBookmarkDto,
} from "../types/bookmark";

import { request } from "./api";


// ============================================================
// CREATE BOOKMARK
// ============================================================

export function createBookmark(
    dto: CreateBookmarkDto
) {
    return request<{ message: string }>(
        "/bookmark",
        {
            method: "POST",
            body: JSON.stringify(dto),
        }
    );
}


// ============================================================
// GET BOOKMARKS
//
// Backend:
//
// GET /bookmark?search=Ram&page=0&size=10
//
// page = 0 -> first page
// page = 1 -> second page
// ============================================================

export function getBookmarks(
    search: string = "",
    page: number = 0,
    size: number = 10
) {

    const params = new URLSearchParams();

    params.set(
        "search",
        search
    );

    params.set(
        "page",
        String(page)
    );

    params.set(
        "size",
        String(size)
    );


    return request<BookmarkPageResponse>(
        `/bookmark?${params.toString()}`
    );
}


// ============================================================
// GET SINGLE BOOKMARK DETAIL
// ============================================================

export function getBookmark(
    id: number
) {

    return request<BookmarkDetailDto>(
        `/bookmark/${id}`
    );
}


// ============================================================
// UPDATE BOOKMARK
// ============================================================

export function updateBookmark(
    id: number,
    dto: CreateBookmarkDto
) {

    return request<{ message: string }>(
        `/bookmark/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(dto),
        }
    );
}


// ============================================================
// DELETE BOOKMARK
// ============================================================

export function deleteBookmark(
    id: number
) {

    return request<{ message: string }>(
        `/bookmark/${id}`,
        {
            method: "DELETE",
        }
    );
}