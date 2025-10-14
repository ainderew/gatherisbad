import React from "react";
import type { Message } from "@/communication/textChat/_types";

interface MessageItemProps {
    message: Message;
    showAvatar: boolean;
}

function MessageItem({ message, showAvatar }: MessageItemProps) {
    const formatTime = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (id: string) => {
        const colors = [
            "bg-blue-600",
            "bg-green-600",
            "bg-purple-600",
            "bg-pink-600",
            "bg-orange-600",
            "bg-cyan-600",
        ];
        const index = id
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    return (
        <div
            className={`flex gap-3 hover:bg-neutral-800/30 -mx-2 px-2 rounded ${showAvatar ? "py-3 mt-2" : "py-1"}`}
        >
            <div className="flex-shrink-0 flex items-start pt-1 w-8">
                {showAvatar ? (
                    <div
                        className={`w-8 h-8 outline-2 outline-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(message.senderSocketId)}`}
                    >
                        {getInitials(message.name)}
                    </div>
                ) : null}
            </div>

            <div className="flex-1 min-w-0">
                {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                            {message.name}
                        </span>
                        <span className="text-xs text-neutral-400">
                            {formatTime(message.createdAt)}
                        </span>
                    </div>
                )}
                <p className="text-neutral-200 text-sm break-words leading-relaxed">
                    {message.content}
                </p>
            </div>
        </div>
    );
}

export default MessageItem;
