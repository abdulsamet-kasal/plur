"use client";

import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const HEARTBEAT_INTERVAL = 30_000;

export default function PresenceTracker() {
  const supabase = useMemo(() => createClient(), []);
  const userIdRef = useRef<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function updatePresence(
      online: boolean,
      userId = userIdRef.current
    ) {
      if (!userId) {
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update({
          online,
          last_active: now,
        })
        .eq("id", userId);

      if (error) {
        console.error("Presence güncellenemedi:", error.message);
      }
    }

    function stopHeartbeat() {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }

    function startHeartbeat() {
      stopHeartbeat();

      heartbeatRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          void updatePresence(true);
        }
      }, HEARTBEAT_INTERVAL);
    }

    async function initializePresence() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error || !user) {
        userIdRef.current = null;
        stopHeartbeat();
        return;
      }

      userIdRef.current = user.id;

      await updatePresence(true, user.id);
      startHeartbeat();
    }

    function handleVisibilityChange() {
      if (!userIdRef.current) {
        return;
      }

      if (document.visibilityState === "visible") {
        void updatePresence(true);
        startHeartbeat();
      } else {
        stopHeartbeat();
        void updatePresence(false);
      }
    }

    function handlePageHide() {
      stopHeartbeat();
      void updatePresence(false);
    }

    function handleFocus() {
      if (!userIdRef.current) {
        return;
      }

      void updatePresence(true);
      startHeartbeat();
    }

    function handleBlur() {
      if (!userIdRef.current) {
        return;
      }

      void updatePresence(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        return;
      }

      if (event === "SIGNED_OUT") {
        const previousUserId = userIdRef.current;

        stopHeartbeat();

        if (previousUserId) {
          await updatePresence(false, previousUserId);
        }

        userIdRef.current = null;
        return;
      }

      if (session?.user) {
        userIdRef.current = session.user.id;
        await updatePresence(true, session.user.id);
        startHeartbeat();
      }
    });

    void initializePresence();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      mounted = false;
      stopHeartbeat();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);

      subscription.unsubscribe();

      void updatePresence(false);
    };
  }, [supabase]);

  return null;
}