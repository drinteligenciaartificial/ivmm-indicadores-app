"use client";

import { useEffect } from "react";

function markLoading(button: HTMLButtonElement, autoClear = false) {
  if (button.disabled || button.dataset.loading === "true") return;
  button.dataset.loading = "true";
  button.setAttribute("aria-busy", "true");
  button.disabled = true;

  if (autoClear) {
    window.setTimeout(() => {
      button.dataset.loading = "false";
      button.setAttribute("aria-busy", "false");
      button.disabled = false;
    }, 1200);
  }
}

export function GlobalButtonLoading() {
  useEffect(() => {
    function onSubmit(event: SubmitEvent) {
      const submitter = event.submitter;
      if (submitter instanceof HTMLButtonElement) markLoading(submitter);
    }

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement)) return;
      if (button.type !== "submit") markLoading(button, true);
    }

    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
