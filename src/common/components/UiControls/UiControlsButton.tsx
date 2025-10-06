import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface UiControlsButtonProps {
    icon: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    label: string;
    color?: string;
    round?: boolean;
    size?: string;
    onClick?: () => void;
}

const sizeMap: { [key: string]: string } = {
    large: "h-10 w-10",
    small: "h-8 w-8",
};

function UiControlsButton({
    icon: Icon,
    label,
    color,
    round = false,
    size = "regular",
    onClick,
}: UiControlsButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger className="cursor-pointer">
                <Button
                    onClick={onClick}
                    variant="outline"
                    size="icon"
                    className={`cursor-pointer dark text-white hover:bg-blue-600 ${color ?? color} ${round ? "rounded-full" : null} ${sizeMap[size]}`}
                >
                    {<Icon />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <span className="">{label}</span>
            </TooltipContent>
        </Tooltip>
    );
}

export default UiControlsButton;
