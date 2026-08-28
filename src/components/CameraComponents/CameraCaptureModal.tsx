    // CameraCaptureModal.tsx

    "use client";

    import React, { useCallback, useEffect, useRef, useState } from "react";

    interface CameraCaptureModalProps {
    open: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
    }

    const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
    open,
    onClose,
    onCapture,
    }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState<boolean>(false);
    const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
    const [isFlashing, setIsFlashing] = useState<boolean>(false);

    const isCameraReadyRef = useRef<boolean>(false);
    useEffect(() => {
        isCameraReadyRef.current = isCameraReady;
    }, [isCameraReady]);

    const stopCurrentStream = useCallback(() => {
        if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
            track.stop();
        });
        streamRef.current = null;
        }
        if (videoRef.current) {
        videoRef.current.srcObject = null;
        }
        setIsCameraReady(false);
    }, []);

    const startCamera = useCallback(
        async (deviceId?: string) => {
        setError(null);
        setIsStarting(true);
        setIsCameraReady(false);

        stopCurrentStream();

        try {
            const constraints: MediaStreamConstraints = {
            video: deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: "environment" },
            audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            }

            setIsCameraReady(true);

            const activeTrack = stream.getVideoTracks()[0];
            const settings = activeTrack?.getSettings();
            if (settings?.deviceId) {
            setSelectedDeviceId(settings.deviceId);
            }

            const updatedDevices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = updatedDevices.filter(
            (device) => device.kind === "videoinput"
            );
            setDevices(videoInputs);
        } catch (err) {
            console.error("Failed to start camera:", err);
            setError(
            "Unable to access camera. Please check permissions and try again."
            );
        } finally {
            setIsStarting(false);
        }
        },
        [stopCurrentStream]
    );

    const initializeCamera = useCallback(async () => {
        setError(null);
        setIsStarting(true);

        try {
        const initialStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        initialStream.getTracks().forEach((track) => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(
            (device) => device.kind === "videoinput"
        );
        setDevices(videoInputs);

        if (videoInputs.length === 0) {
            setError("No camera devices found.");
            setIsStarting(false);
            return;
        }

        const usbDevice = videoInputs.find((device) =>
            device.label.toLowerCase().includes("usb")
        );
        const deviceToUse = usbDevice ?? videoInputs[0];

        setSelectedDeviceId(deviceToUse.deviceId);
        await startCamera(deviceToUse.deviceId);
        } catch (err) {
        console.error("Failed to initialize camera:", err);
        setError(
            "Unable to access camera. Please check permissions and try again."
        );
        setIsStarting(false);
        }
    }, [startCamera]);

    useEffect(() => {
        if (open) {
        initializeCamera();
        } else {
        stopCurrentStream();
        setDevices([]);
        setSelectedDeviceId("");
        setError(null);
        }

        return () => {
        stopCurrentStream();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    

    const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
        startCamera(deviceId);
    };

    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !isCameraReadyRef.current) {
        return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
        return;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
        return;
        }

        ctx.drawImage(video, 0, 0, width, height);

        setIsFlashing(true);
        window.setTimeout(() => setIsFlashing(false), 150);

        canvas.toBlob(
        (blob) => {
            if (!blob) {
            setError("Failed to capture image. Please try again.");
            return;
            }

            const timestamp = Date.now();
            const file = new File([blob], `endoscopy-${timestamp}.png`, {
            type: "image/png",
            });

            onCapture(file);
        },
        "image/png",
        1
        );
    }, [onCapture]);

    const handleClose = useCallback(() => {
        stopCurrentStream();
        onClose();
    }, [onClose, stopCurrentStream]);
    useEffect(() => {
    if (!open) return;

    // Add a history entry
    window.history.pushState({ cameraModal: true }, "");

    const handlePopState = () => {
        handleClose();

        // Keep the user on the same page
        window.history.pushState({ cameraModal: true }, "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
        window.removeEventListener("popstate", handlePopState);
    };
}, [open, handleClose]);

    useEffect(() => {
        if (!open) {
        return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
        const activeTag = (document.activeElement?.tagName || "").toLowerCase();
        if (activeTag === "select" || activeTag === "input" || activeTag === "textarea") {
            return;
        }

        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            handleCapture();
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            handleClose();
        }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
        window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, handleCapture, handleClose]);

    if (!open) {
        return null;
    }
    

    return (
        <div className="fixed inset-0 z-[100] bg-white">
        {/* Full-bleed video */}
        <div className="absolute inset-0 bg-slate-100">
            {isStarting && !isCameraReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="text-sm font-medium text-slate-500">
                    Starting camera...
                </p>
                </div>
            </div>
            )}

            <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain bg-white"
            />

            {isFlashing && (
            <div className="pointer-events-none absolute inset-0 bg-white animate-pulse" />
            )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div>
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                Capture Endoscopy Image
            </h2>
            <p className="hidden text-xs text-slate-500 sm:block">
                Press <span className="font-semibold text-slate-700">Space</span>{" "}
                or click the capture button to take a photo
            </p>
            </div>
            <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 max-lg:h-10 max-lg:w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close camera"
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
                d="M6 18L18 6M6 6l12 12"
                />
            </svg>
            </button>
        </div>

        {/* Error banner */}
        {error && (
            <div className="absolute inset-x-0 top-20 z-20 flex justify-center px-4">
            <div className="w-full max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
            </div>
            </div>
        )}

        {/* Bottom control bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
            <div className="flex w-32 sm:w-48">
                {devices.length > 1 && (
                <select
                    id="camera-select"
                    value={selectedDeviceId}
                    onChange={handleDeviceChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none sm:text-sm max-lg:min-h-[40px]"
                >
                    {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                    </option>
                    ))}
                </select>
                )}
            </div>

            <button
                type="button"
                onClick={handleCapture}
                disabled={!isCameraReady}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-300 sm:h-20 sm:w-20"
                aria-label="Capture image"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-10 sm:w-10"
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
            </button>

            <div className="hidden w-32 sm:block sm:w-48" />
            </div>
        </div>
        </div>
    );
    };

    export default CameraCaptureModal;