"use client"

import Image, { ImageProps } from "next/image"
import { useState, useEffect } from "react"

interface ImageWithFallbackProps extends ImageProps {
    fallbackSrc?: string
}

const ImageWithFallback = (props: ImageWithFallbackProps) => {
    const { src, fallbackSrc = "/placeholder.svg", alt, ...rest } = props
    const [imgSrc, setImgSrc] = useState(src)

    // Reset image source if the src prop changes
    useEffect(() => {
        setImgSrc(src)
    }, [src])

    return (
        <Image
            {...rest}
            alt={alt} // Ensure alt is passed
            src={imgSrc || fallbackSrc} // Use imgSrc state or fallback
            onError={() => {
                setImgSrc(fallbackSrc) // Set fallback source on error
            }}
        />
    )
}

export default ImageWithFallback
