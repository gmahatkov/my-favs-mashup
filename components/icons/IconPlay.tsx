import React from "react";
import {IconProps} from "@/components/icons/types";

const IconPlay: React.FC<IconProps> = ({ color='black', size=100 }) =>
    (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,20 80,50 30,80" fill={color}/>
        </svg>
    )

export default React.memo(IconPlay);