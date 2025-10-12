import React, { useEffect, useState } from "react";
import { ScreenShareViewer } from "@/communication/screenShare/screenShareViewer";
import VideoContainer from "./VideoContainer";

type VideoState = {
    producerId: string;
    isExpanded: boolean;
};

function ScreenShareUi() {
    const [videosTracked, setVideosTracked] = useState<VideoState[]>([]);

    useEffect(() => {
        const service = ScreenShareViewer.getInstance();

        function updateScreenState() {
            const vidArray = Array.from(service.videoElements.keys());

            setVideosTracked((prev) => {
                const newVideos = vidArray.map((vid) => {
                    const existing = prev.find((v) => v.producerId === vid);
                    return {
                        producerId: vid,
                        isExpanded: existing?.isExpanded ?? false,
                    };
                });
                return newVideos;
            });
        }

        service.updateComponentStateCallback = updateScreenState;
        updateScreenState();
        service.loadExistingProducers();

        return () => {
            service.updateComponentStateCallback = null;
        };
    }, []);

    useEffect(() => {
        if (!videosTracked.length) return;

        const service = ScreenShareViewer.getInstance();

        videosTracked.forEach((video) => {
            const container = document.getElementById(video.producerId);
            const videoEl = service.videoElements.get(video.producerId);

            if (container && videoEl && !container.contains(videoEl)) {
                container.innerHTML = "";
                container.appendChild(videoEl);

                videoEl.style.width = "100%";
                videoEl.style.height = "100%";
                videoEl.style.objectFit = "contain";
            }
        });
    }, [videosTracked]);

    function handleExpand(producerId: string) {
        setVideosTracked((prev) => {
            return prev.map((video) => ({
                ...video,
                isExpanded:
                    video.producerId === producerId ? !video.isExpanded : false,
            }));
        });
    }

    const expandedVideo = videosTracked.find((v) => v.isExpanded);
    const collapsedVideos = videosTracked.filter((v) => !v.isExpanded);
    const hasExpandedVideo = !!expandedVideo;

    if (videosTracked.length === 0) {
        return (
            <div className="fixed top-5 left-5 p-4 bg-black/50 rounded text-white text-sm">
                No screen shares active
            </div>
        );
    }

    return (
        <>
            {expandedVideo && (
                <VideoContainer
                    key={`expanded-${expandedVideo.producerId}`}
                    producerId={expandedVideo.producerId}
                    isExpanded={true}
                    handleExpand={handleExpand}
                />
            )}

            <div
                className={`
                    fixed flex gap-4 z-20 transition-all duration-300 ease-in-out
                    ${
                        hasExpandedVideo
                            ? "bottom-6 left-1/2 -translate-x-1/2 flex-row"
                            : "top-5 left-5 flex-col"
                    }
                    ${hasExpandedVideo && collapsedVideos.length > 3 ? "overflow-x-auto max-w-[90vw]" : ""}
                `}
            >
                {collapsedVideos.map((video) => (
                    <VideoContainer
                        key={`collapsed-${video.producerId}`}
                        producerId={video.producerId}
                        isExpanded={false}
                        handleExpand={handleExpand}
                    />
                ))}
            </div>

            {hasExpandedVideo && collapsedVideos.length > 0 && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium z-20 border border-white/20">
                    {collapsedVideos.length} more{" "}
                    {collapsedVideos.length === 1 ? "share" : "shares"}
                </div>
            )}
        </>
    );
}

export default ScreenShareUi;
