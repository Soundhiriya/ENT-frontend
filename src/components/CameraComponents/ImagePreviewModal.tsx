    // ImagePreviewModal.tsx

    "use client";

    import React, { useEffect, useState } from "react";

    interface ImagePreviewModalProps {
    image: File | null;
    open: boolean;
    onClose: () => void;
    }

    const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    image,
    open,
    onClose,
    }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!image) {
        setPreviewUrl(null);
        return;
        }

        const url = URL.createObjectURL(image);
        setPreviewUrl(url);

        return () => {
        URL.revokeObjectURL(url);
        };
    }, [image]);

    if (!open || !image || !previewUrl) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4">
        <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close preview"
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
            </svg>
        </button>

        <div className="flex max-h-full max-w-full flex-col items-center gap-3">
            <img
            src={previewUrl}
            alt={image.name}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
            <p className="text-sm text-white/70">{image.name}</p>
        </div>
        </div>
    );
    };

    export default ImagePreviewModal;