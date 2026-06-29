import { useCallback, useEffect, useState } from "react";

export type GeoState = {
  status: "idle" | "prompting" | "granted" | "denied" | "unavailable" | "error";
  coords: { latitude: number; longitude: number } | null;
  error: string | null;
};

const STORAGE_KEY = "egor-phc-geo-consent";

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle", coords: null, error: null });

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ status: "unavailable", coords: null, error: "Geolocation not supported on this device." });
      return;
    }
    setState((s) => ({ ...s, status: "prompting", error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try { localStorage.setItem(STORAGE_KEY, "granted"); } catch {}
        setState({
          status: "granted",
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        try { if (denied) localStorage.setItem(STORAGE_KEY, "denied"); } catch {}
        setState({
          status: denied ? "denied" : "error",
          coords: null,
          error: denied ? "Location permission denied." : err.message || "Couldn't get your location.",
        });
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60_000, timeout: 10_000 },
    );
  }, []);

  // Auto-restore on mount if user previously granted.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "granted") request();
    } catch {}
  }, [request]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setState({ status: "idle", coords: null, error: null });
  }, []);

  return { ...state, request, reset };
}
