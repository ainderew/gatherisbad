import React from "react";

function MemberItem({ name }: { name: string }) {
    return (
        <div className="member-item flex items-center gap-2 text-white">
            <div className="online-indicator w-2 h-2 bg-green-600 rounded-full" />
            {name}
        </div>
    );
}
export default MemberItem;
