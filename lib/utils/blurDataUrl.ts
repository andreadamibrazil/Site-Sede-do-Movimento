// Base64-encoded 10×10 gray pixel used as placeholder blur before images load.
// Usage: <Image placeholder="blur" blurDataURL={BLUR_DATA_URL} ... />
export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAG0lEQVQI12P4z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";

// For Sanity images: pass the low-res URL from urlFor().width(10).blur(10).url()
export function sanityBlur(lowResUrl: string): string {
  return lowResUrl;
}
