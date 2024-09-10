import React from "react";
import {IconProps} from "@/components/icons/types";

const IconPause: React.FC<IconProps> = ({ color='black', size=100 }) =>
    (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="20" width="15" height="60" fill={color} />
            <rect x="55" y="20" width="15" height="60" fill={color} />
        </svg>
    )

export default React.memo(IconPause);