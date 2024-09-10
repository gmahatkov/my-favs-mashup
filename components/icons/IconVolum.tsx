import React from "react";
import {IconProps} from "@/components/icons/types";

const IconVolume: React.FC<IconProps> = ({ color='black', size=100 }) =>
    (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="25,35 45,35 65,20 65,80 45,65 25,65" fill={color} />
            <path d="M70,40 Q85,50 70,60" stroke="black" stroke-width="5" fill={color} />
            <path d="M75,30 Q95,50 75,70" stroke="black" stroke-width="5" fill={color} />
        </svg>
    )

export default React.memo(IconVolume);