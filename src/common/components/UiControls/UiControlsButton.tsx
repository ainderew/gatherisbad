import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonSizeEnum, ColorEnum } from "./_enums";

interface UiControlsButtonProps {
    icon: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    label: string;
    color?: string;
    textColor?: string;
    round?: boolean;
    size?: string;
    onClick?: () => void;
}

const sizeMap: Record<ButtonSizeEnum, string> = {
    large: "h-10 w-10",
    regular: "h-9 w-9",
    small: "h-8 w-8",
};

const textColorMap: Record<ColorEnum, string> = {
    darkRed: "text-red-900",
    red: "text-red-600",
    normal: "text-white",
};

const buttonColorMap: Record<ColorEnum, string> = {
    darkRed: "bg-red-950",
    red: "bg-red-600",
    normal: "bg-neutral-700",
};

function UiControlsButton({
    icon: Icon,
    label,
    color = ColorEnum.normal,
    textColor = ColorEnum.normal,
    round = false,
    size = ButtonSizeEnum.regular,
    onClick,
}: UiControlsButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger className="cursor-pointer">
                <Button
                    onClick={onClick}
                    variant="default"
                    size="icon"
                    className={`cursor-pointer dark bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 
                        ${buttonColorMap[color as ColorEnum]} 
                        ${sizeMap[size as ButtonSizeEnum]} 
                        ${textColorMap[textColor as ColorEnum]}
                        ${round ? "rounded-full" : null} 
                        `}
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
