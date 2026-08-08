    // EndoscopyImageDetailScreen.tsx

    "use client";

    import React, { useEffect, useState } from "react";
    import CameraCaptureModal from "./CameraCaptureModal";
    import ImagePreviewModal from "./ImagePreviewModal";

    interface EndoscopyImageDetailScreenProps {
    endoscopyImages: File[];
    setEndoscopyImages: React.Dispatch<React.SetStateAction<File[]>>;
    }

    const EndoscopyImageDetailScreen: React.FC<EndoscopyImageDetailScreenProps> = ({
    endoscopyImages,
    setEndoscopyImages,
    }) => {
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<File | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);

    useEffect(() => {
        const urls = endoscopyImages.map((file) => URL.createObjectURL(file));
        setThumbnailUrls(urls);

        return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [endoscopyImages]);

    const handleCapture = (file: File) => {
        setEndoscopyImages((prev) => [...prev, file]);
        setIsCameraOpen(false);
    };

    const handleDelete = (index: number) => {
        setEndoscopyImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleThumbnailClick = (file: File) => {
        setPreviewImage(file);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setPreviewImage(null);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
                Endoscopy Images
            </h3>
            <p className="text-sm text-slate-500">
                Capture endoscopy findings using a connected camera.
            </p>
            </div>

            <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
            Capture Image
            </button>
        </div>

        {endoscopyImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 h-10 w-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
            <p className="text-sm font-medium text-slate-500">
                No images captured yet
            </p>
            <p className="text-xs text-slate-400">
                Click &quot;Capture Image&quot; to begin
            </p>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {endoscopyImages.map((file, index) => (
                <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                <button
                    type="button"
                    onClick={() => handleThumbnailClick(file)}
                    className="block h-32 w-full sm:h-36"
                >
                    {thumbnailUrls[index] && (
                    <img
                        src={thumbnailUrls[index]}
                        alt={`Endoscopy capture ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition-colors hover:bg-red-600 hover:text-white"
                    aria-label={`Delete image ${index + 1}`}
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                    </svg>
                </button>

                <div className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-[10px] text-white">
                    {file.name}
                </div>
                </div>
            ))}
            </div>
        )}

        <CameraCaptureModal
            open={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleCapture}
        />

        <ImagePreviewModal
            image={previewImage}
            open={isPreviewOpen}
            onClose={handleClosePreview}
        />
        </div>
    );
    };

    export default EndoscopyImageDetailScreen;