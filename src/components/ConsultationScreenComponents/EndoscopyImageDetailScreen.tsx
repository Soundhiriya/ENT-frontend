    // EndoscopyImageDetailScreen.tsx

    "use client";

    import { Camera } from "lucide-react";
    import React, { useEffect, useState } from "react";
    import CameraCaptureModal from "../CameraComponents/CameraCaptureModal";
    import ImagePreviewModal from "../CameraComponents/ImagePreviewModal";

    interface EndoscopyImageDetailScreenProps {
    endoscopyImages: File[];
    setEndoscopyImages: React.Dispatch<React.SetStateAction<File[]>>;
    }

    const EndoscopyImageDetailScreen = ({
    endoscopyImages,
    setEndoscopyImages,
    }: EndoscopyImageDetailScreenProps) => {
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
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Camera className="h-3.5 w-3.5" />
            Endoscopy Images
            </h2>

            <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 max-lg:min-h-[40px]"
            >
            <Camera className="h-3.5 w-3.5" />
            Capture
            </button>
        </div>

        {endoscopyImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
            <Camera className="mb-1.5 h-6 w-6 text-slate-300" />
            <p className="text-xs font-medium text-slate-500">No images captured yet</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {endoscopyImages.map((file, index) => (
                <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="group relative overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                >
                <button
                    type="button"
                    onClick={() => handleThumbnailClick(file)}
                    className="block h-20 w-full"
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
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition-colors hover:bg-red-600 hover:text-white"
                    aria-label={`Delete image ${index + 1}`}
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
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