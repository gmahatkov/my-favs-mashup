import { ImageResponse } from "next/og";
import IconBrand from "@/components/icons/IconBrand";

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <IconBrand size={32} />
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}