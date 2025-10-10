import Image from "next/image";

interface BackgroundImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function BackgroundImage({
  src,
  alt,
  width = 1240,
  height = 300,
  className = "absolute object-cover -z-10",
}: BackgroundImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}
