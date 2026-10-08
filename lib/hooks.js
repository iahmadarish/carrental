"use client";

import { useSyncExternalStore } from "react";
import { addDays } from "@/lib/format";

const noop = () => () => {};

/**
 * Browser-only values (today's date, URL hash/query) read without setState-in-effect
 * and without touching the clock during prerender (Cache Components forbids that).
 * On the server they return "" and resolve on the client after hydration.
 */
export function useDay(offset = 0) {
  return useSyncExternalStore(noop, () => addDays(offset), () => "");
}

const subscribeHash = (cb) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
export function useHash() {
  return useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
}

export function useQueryParam(key) {
  return useSyncExternalStore(noop, () => new URLSearchParams(window.location.search).get(key) || "", () => "");
}
