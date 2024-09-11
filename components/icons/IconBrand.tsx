import React from "react";
import {IconProps} from "@/components/icons/types";

const IconBrand: React.FC<IconProps> = ({ color='black', size=100 }) =>
    (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" stroke="url(#neonGradient)" strokeWidth="5" fill="none"/>
            <path d="M 35 50 C 40 40, 60 40, 65 50 S 90 60, 65 70 Q 60 80, 35 70 Z" fill="url(#neonGradient)"/>
            <defs>
                <linearGradient id="neonGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#00f9ff"/>
                    <stop offset="100%" stopColor="#ff00ff"/>
                </linearGradient>
            </defs>
        </svg>
    )

export default IconBrand;