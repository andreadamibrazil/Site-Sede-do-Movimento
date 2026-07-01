"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface MetaPixelProps {
  pixelId: string;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();
  const mounted = useRef(false);

  // PageView em navegações SPA (o PageView inicial é feito no script inline).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (!pixelId || typeof w.fbq !== "function") return;
    w.fbq("track", "PageView");
  }, [pathname, pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- beacon do Meta Pixel exige <img> puro */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
