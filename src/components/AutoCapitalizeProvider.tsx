"use client";

import { useEffect } from "react";

/**
 * Capitalises the first letter of every word the user types, app-wide.
 *
 * Mounted once in the root layout. It listens for `input` events during the
 * capture phase — i.e. before React's own listener on the root container sees
 * them — rewrites the field's value, and lets React's `onChange` receive the
 * corrected text. That way every existing screen gets the behaviour without
 * touching its `onChange` handler, and any input added later is covered too.
 *
 * Fields where changing case would break the value (passwords, email, URLs,
 * search boxes) are skipped — see `shouldSkip`. Individual fields can opt out
 * with `data-no-capitalize`.
 */

// Input types that hold non-prose values. Capitalising these either does
// nothing or corrupts them.
const SKIPPED_TYPES = new Set([
    "password",
    "email",
    "url",
    "tel",
    "number",
    "search",
    "date",
    "datetime-local",
    "month",
    "week",
    "time",
    "color",
    "range",
    "file",
    "checkbox",
    "radio",
    "button",
    "submit",
    "reset",
    "hidden",
    "image",
]);

// The login and set-password screens render password fields as
// `type={showPassword ? "text" : "password"}`, so the type alone stops
// identifying them the moment the doctor clicks the eye icon. Match on the
// field's identity as well, which does not change.
//
// Deliberately matched against name/id/autocomplete only — never the
// placeholder. Placeholder text is user-facing prose: "Search or enter
// diagnosis" is a diagnosis field, not a search box, and matching on it
// silently skipped the field.
const SKIPPED_NAME_PATTERN = /pass|pwd|email|mail|url|link|youtube|otp|token|username|user_?name/i;

/** "ear pain" -> "Ear Pain". Only raises case; never lowers it, so acronyms
 *  the doctor types (USG, ENT, CT) survive untouched. */
function toTitleCase(value: string) {
    return value.replace(
        /(^|\s)(\p{L})/gu,
        (_match, boundary: string, letter: string) =>
            boundary + letter.toUpperCase()
    );
}

function shouldSkip(el: HTMLInputElement | HTMLTextAreaElement) {
    if (el.dataset.noCapitalize !== undefined) return true;
    if (el.readOnly || el.disabled) return true;

    if (el instanceof HTMLInputElement && SKIPPED_TYPES.has(el.type)) {
        return true;
    }

    const identity = `${el.name} ${el.id} ${el.autocomplete}`;
    return SKIPPED_NAME_PATTERN.test(identity);
}

export default function AutoCapitalizeProvider() {
    useEffect(() => {
        // Resolved here rather than at module scope: this file is still
        // evaluated on the server during SSR, where the DOM globals below do
        // not exist.
        const nativeInputValue = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        );
        const nativeTextAreaValue = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value"
        );

        function handleInput(event: Event) {
            const el = event.target;

            if (
                !(el instanceof HTMLInputElement) &&
                !(el instanceof HTMLTextAreaElement)
            ) {
                return;
            }

            // Mid-composition (IME) text is not final yet; rewriting it here
            // would fight the input method.
            if ((event as InputEvent).isComposing) return;

            if (shouldSkip(el)) return;

            const current = el.value;
            const next = toTitleCase(current);
            if (next === current) return;

            // Assigning through the prototype setter bypasses the value
            // tracker React installs on the element. If we assigned with a
            // plain `el.value = next`, the tracker would record the new value
            // and React would conclude nothing had changed, suppressing the
            // onChange this field's state depends on.
            const setter =
                el instanceof HTMLInputElement
                    ? nativeInputValue?.set
                    : nativeTextAreaValue?.set;

            // Writing to `value` collapses the caret to the end of the field,
            // so restore it. The replacement only changes case, never length,
            // meaning the offsets stay valid.
            const { selectionStart, selectionEnd } = el;

            if (setter) {
                setter.call(el, next);
            } else {
                el.value = next;
            }

            if (selectionStart !== null && selectionEnd !== null) {
                el.setSelectionRange(selectionStart, selectionEnd);
            }
        }

        document.addEventListener("input", handleInput, true);
        return () => document.removeEventListener("input", handleInput, true);
    }, []);

    return null;
}
