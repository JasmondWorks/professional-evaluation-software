"use client";
import { useEffect, useState } from "react";

export function useAppraisalSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("session");
    const stored = localStorage.getItem("appraisal_session_id");

    if (fromUrl) {
      localStorage.setItem("appraisal_session_id", fromUrl);
      setSessionId(fromUrl);
      return;
    }
    if (stored) {
      setSessionId(stored);
      return;
    }
    const created = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    localStorage.setItem("appraisal_session_id", created);
    setSessionId(created);
  }, []);

  return sessionId;
}

