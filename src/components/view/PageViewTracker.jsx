// src/components/analytics/PageViewTracker.jsx
"use client";

import { useEffect } from "react";
import { recordPageViewAction } from "@/app/actions/analytics";

export default function PageViewTracker({ path = "/" }) {
  useEffect(() => {
    const storageKey = `viewed_${path}`;

    // Skip if already counted in this browser tab session
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "true");

    const isMobile = window.innerWidth < 768;
    const rawReferrer = document.referrer || "";

    // Ignore internal navigation from your own domain
    const isSelfReferral =
      rawReferrer && rawReferrer.includes(window.location.host);

    recordPageViewAction({
      page_path: path,
      referrer: isSelfReferral ? "" : rawReferrer,
      device_type: isMobile ? "mobile" : "desktop",
    });
  }, [path]);

  return null;
}
