"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "sdm_cookie_consent";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 sm:px-6">
      <div className="container-main flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="text-sm text-gray-300 flex-1 leading-relaxed">
          Usamos cookies e ferramentas de análise (Google Analytics, Microsoft Clarity) para melhorar sua experiência.{" "}
          <Link href="/politica-de-privacidade" className="underline text-white hover:text-gray-200">
            Política de Privacidade
          </Link>
          .
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 bg-white text-gray-900 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
