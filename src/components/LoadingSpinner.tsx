    "use client";

    interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
    }

    const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
    };

    export default function LoadingSpinner({
    size = "md",
    text = "Loading...",
    fullScreen = false,
    }: LoadingSpinnerProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
        <div
            className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}
        />
        {text && <p className="text-sm text-gray-600">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            {content}
        </div>
        );
    }

    return content;
    }