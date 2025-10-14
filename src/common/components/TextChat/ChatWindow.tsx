import React, { useEffect, useMemo, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TextChatService } from "@/communication/textChat/textChat";
import type { Message } from "@/communication/textChat/_types";
import MessageItem from "./MessageItem";
import { X, Send } from "lucide-react";

interface ChatWindowProps {
    isChatWindowOpen: boolean;
    onClose: () => void;
}

function ChatWindow({ isChatWindowOpen, onClose }: ChatWindowProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const textChatService = useMemo(() => {
        return TextChatService.getInstance();
    }, []);

    useEffect(() => {
        textChatService.uiUpdater = (newMessage: Message) => {
            setMessages((prev) => [...prev, newMessage]);
        };
    }, [textChatService]);

    useEffect(() => {
        if (!isChatWindowOpen) return;
        const chatInput = document.getElementById("chat-input");
        if (chatInput) {
            chatInput.focus();
        }
    }, [isChatWindowOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function sendMessage() {
        if (!message.trim()) return;

        textChatService.sendMessage(message);
        setMessage("");
    }

    const shouldShowAvatar = (index: number) => {
        if (index === 0) return true;

        const currentMsg = messages[index];
        const prevMsg = messages[index - 1];

        if (currentMsg.senderSocketId !== prevMsg.senderSocketId) return true;

        const currentTime = new Date(currentMsg.createdAt).getTime();
        const prevTime = new Date(prevMsg.createdAt).getTime();
        const timeDiff = currentTime - prevTime;

        return timeDiff > 5 * 60 * 1000;
    };

    if (!isChatWindowOpen) {
        return null;
    }

    return (
        <div
            className={`text-white h-[calc(100vh-var(--ui-controls-height)+5px)] w-100 bg-primary backdrop-blur-sm absolute right-0 top-0 border-l border-neutral-700
              ${isChatWindowOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out flex flex-col shadow-2xl`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                <div className="flex flex-col">
                    <span className="font-bold text-lg">Team Chat</span>
                    <span className="text-xs text-neutral-400">
                        {messages.length} message
                        {messages.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <MessageItem
                                key={`${msg.senderSocketId}-${msg.createdAt}-${index}`}
                                message={msg}
                                showAvatar={shouldShowAvatar(index)}
                            />
                        ))
                    ) : (
                        <div className="text-center text-neutral-500 py-8">
                            No messages yet. Start the conversation!
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-700">
                <div className="flex gap-2">
                    <Textarea
                        id="chat-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Message the team"
                        rows={1}
                        className="flex-1 bg-neutral-800 border-neutral-700 focus:border-blue-500 text-white placeholder:text-neutral-500 resize-none"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        size="icon"
                        className="h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-500"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
