// Event tracking utility
// Works with GA4 (window.gtag) and GTM (window.dataLayer)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface TrackEventParams {
  name: string;    // event name, e.g. "contact_click"
  source?: string; // e.g. "hero", "header", "footer", "gallery"
  page?: string;   // e.g. "home", "ensino"
  label?: string;  // human-readable label
  value?: number;
}

export function trackEvent({ name, source, page, label, value }: TrackEventParams): void {
  if (typeof window === "undefined") return;

  const eventData = {
    event: name,
    event_source: source,
    event_page: page,
    event_label: label,
    value,
  };

  // GTM dataLayer push
  if (window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  // GA4 gtag
  if (window.gtag) {
    window.gtag("event", name, {
      event_source: source,
      event_page: page,
      event_label: label,
      value,
    });
  }
}

// Convenience wrappers
export const trackWhatsAppClick = (source: string, page = "unknown") =>
  trackEvent({ name: "whatsapp_click", source, page, label: "Fale conosco" });

export const trackHeroClick = (slideAlt: string) =>
  trackEvent({ name: "hero_click", source: "hero", page: "home", label: slideAlt });

export const trackGalleryOpen = (imageName: string) =>
  trackEvent({ name: "gallery_open", source: "gallery", label: imageName });

export const trackCTAClick = (label: string, source: string, page: string) =>
  trackEvent({ name: "cta_click", source, page, label });
