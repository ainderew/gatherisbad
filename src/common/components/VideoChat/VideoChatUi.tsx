import React, { useEffect, useState } from "react";
import VideoChatContainer from "./VideoChatContainer";
import { VideoChatViewer } from "@/communication/videoChat/videoChatViewer";

type VideoState = {
    producerId: string;
    isExpanded: boolean;
};

function VideoChatUi() {
    const [videosTracked, setVideosTracked] = useState<VideoState[]>([]);

    useEffect(() => {
        const service = VideoChatViewer.getInstance();

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
                console.log(newVideos);
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

        const service = VideoChatViewer.getInstance();

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
        return null;
    }

    return (
        <>
            {expandedVideo && (
                <VideoChatContainer
                    key={`expanded-${expandedVideo.producerId}`}
                    producerId={expandedVideo.producerId}
                    isExpanded={true}
                    handleExpand={handleExpand}
                    hasMoreThanOneSharing={videosTracked.length > 1}
                />
            )}

            <div
                className={`
                    fixed flex gap-4 transition-all duration-300 ease-in-out z-90
                    ${
                        hasExpandedVideo
                            ? "left-10 top-1/2 -translate-y-1/2 flex-col"
                            : "top-5 left-1/2 -translate-x-1/2 flex"
                    }
                    ${hasExpandedVideo && collapsedVideos.length > 3 ? "overflow-x-auto max-w-[90vw]" : ""}
                `}
            >
                {collapsedVideos.map((video) => (
                    <VideoChatContainer
                        key={`collapsed-${video.producerId}`}
                        producerId={video.producerId}
                        isExpanded={false}
                        handleExpand={handleExpand}
                        hasMoreThanOneSharing={videosTracked.length > 1}
                    />
                ))}
            </div>

            {hasExpandedVideo && collapsedVideos.length > 0 && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium z-90 border border-white/20">
                    {collapsedVideos.length} more{" "}
                    {collapsedVideos.length === 1 ? "share" : "shares"}
                </div>
            )}
        </>
    );
}

export default VideoChatUi;
