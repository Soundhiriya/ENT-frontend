// YoutubeDetailsScreen.tsx

"use client";

import { YoutubeVideoDto } from "@/src/types/consultationtypes";
import { FaYoutube } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ExternalLink, Plus, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getYoutubeLinkMasterData,
  YoutubeLinkDropdown,
} from "@/src/services/masterservices";

interface YoutubeDetailsScreenProps {
  youtubeVideos: YoutubeVideoDto[];
  setYoutubeVideos: React.Dispatch<React.SetStateAction<YoutubeVideoDto[]>>;
}

const YoutubeDetailsScreen = ({ youtubeVideos, setYoutubeVideos }: YoutubeDetailsScreenProps) => {
  const [recommendedVideos, setRecommendedVideos] = useState<YoutubeLinkDropdown[]>([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    async function loadRecommendedVideos() {
      try {
        const response = await getYoutubeLinkMasterData();
        setRecommendedVideos(response);
      } catch (error: any) {
        toast.error(error?.message ?? "Failed to load recommended videos");
      }
    }

    loadRecommendedVideos();
  }, []);

  const addVideo = (video: YoutubeVideoDto) => {
    if (youtubeVideos.some((v) => v.youtubeUrl === video.youtubeUrl)) {
      return;
    }
    setYoutubeVideos((prev) => [...prev, video]);
  };

  // Fires on both mouse selection and keyboard selection (arrow keys + Enter,
  // or type-ahead) since a native <select> emits the same onChange either way.
  const handleSelectVideo = (url: string) => {
    if (!url) return;

    const video = recommendedVideos.find((v) => v.youtubeUrl === url);
    if (video) addVideo({ title: video.title, youtubeUrl: video.youtubeUrl });

    setSelectedVideo("");
  };

  const handleAddCustom = () => {
    if (!customUrl.trim()) return;

    addVideo({ title: "Custom YouTube Video", youtubeUrl: customUrl.trim() });
    setCustomUrl("");
  };

  const removeVideo = (url: string) => {
    setYoutubeVideos((prev) => prev.filter((v) => v.youtubeUrl !== url));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <FaYoutube className="h-3.5 w-3.5 text-red-600" />
          Patient Education Videos
        </h2>

        {youtubeVideos.length > 0 && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-sm font-medium text-red-600 sm:text-[11px]">
            {youtubeVideos.length} added
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="relative">
          <PlayCircle className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedVideo}
            onChange={(e) => handleSelectVideo(e.target.value)}
            className="h-9 max-lg:h-10 w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white pl-7 pr-2 text-sm text-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">
              {recommendedVideos.length === 0
                ? "No recommended videos yet"
                : "Select recommended video…"}
            </option>
            {recommendedVideos.map((video) => (
              <option key={video.id} value={video.youtubeUrl}>
                {video.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            data-no-capitalize
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste custom YouTube link"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            // Commit the pasted link on focus loss so it is not lost when
            // Enter is never pressed.
            onBlur={handleAddCustom}
            className="h-9 max-lg:h-10 flex-1 rounded-md border border-slate-300 px-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <button
            type="button"
            onClick={handleAddCustom}
            className="inline-flex h-9 max-lg:h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-blue-600 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {youtubeVideos.length === 0 ? (
        <div className="mt-3 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center">
          <FaYoutube className="mb-1.5 h-6 w-6 text-slate-300" />
          <p className="text-xs font-medium text-slate-500">
            No videos added yet
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {youtubeVideos.map((video) => (
            <div
              key={video.youtubeUrl}
              className="group flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 transition-colors hover:border-red-200 hover:bg-red-50/40"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FaYoutube className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">
                  {video.title}
                </p>

                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline sm:text-[11px]"
                >
                  Open <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => removeVideo(video.youtubeUrl)}
                className="flex shrink-0 items-center justify-center rounded-md p-1.5 max-lg:min-h-[40px] max-lg:min-w-[40px] text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                aria-label={`Remove ${video.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YoutubeDetailsScreen;
