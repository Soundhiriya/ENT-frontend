import {
    BookmarkDetailDto,
    BookmarkResponse,
    CreateBookmarkDto
} from "../types/bookmark";
import { request } from "./api";

export function createBookmark(dto: CreateBookmarkDto) {
    return request<{ message: string }>("/bookmark", {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export function getBookmarks() {
    return request<BookmarkResponse[]>("/bookmark");
}

export function getBookmark(id: number) {
    return request<BookmarkDetailDto>(`/bookmark/${id}`);
}

export function updateBookmark(
    id: number,
    dto: CreateBookmarkDto
) {
    return request<{ message: string }>(`/bookmark/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

export function deleteBookmark(id: number) {
    return request<{ message: string }>(`/bookmark/${id}`, {
        method: "DELETE",
    });
}