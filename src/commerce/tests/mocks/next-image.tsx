import type { ImgHTMLAttributes } from "react";

export default function Image({
  src,
  alt,
  fill: _fill,
  priority: _priority,
  sizes: _sizes,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={typeof src === "string" ? src : undefined} alt={alt} {...rest} />;
}
