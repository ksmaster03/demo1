"use client";

import { useEffect } from "react";

/**
 * Injects the TH/EN language toggle script
 * Ports the static JS from legacy-static/index.html
 */
export default function LangScript() {
  useEffect(() => {
    const langEl = document.getElementById("lang");
    if (!langEl) return;

    function setLang(lang: "th" | "en") {
      document.querySelectorAll("[data-en]").forEach((el) => {
        const enText = el.getAttribute("data-en");
        if (lang === "en" && enText) {
          el.innerHTML = enText;
        } else {
          // Restore original content from data-th or original HTML
          const th = el.getAttribute("data-th");
          if (th) el.innerHTML = th;
        }
      });
      langEl?.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("on", btn.getAttribute("data-l") === lang);
      });
      document.documentElement.lang = lang;
    }

    // Save original TH content on first load
    document.querySelectorAll("[data-en]").forEach((el) => {
      if (!el.getAttribute("data-th")) {
        el.setAttribute("data-th", el.innerHTML);
      }
    });

    langEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const l = btn.getAttribute("data-l") as "th" | "en";
        setLang(l);
      });
    });
  }, []);

  return null;
}
