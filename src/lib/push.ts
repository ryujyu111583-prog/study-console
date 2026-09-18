"use client";

import { addDoc, collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "./firebase";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

export type PushResult = "subscribed" | "denied" | "unsupported";

export async function subscribeToPush(): Promise<PushResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  const json = subscription.toJSON();
  const existing = await getDocs(
    query(collection(db, "pushSubscriptions"), where("endpoint", "==", json.endpoint)),
  );
  if (existing.empty) {
    await addDoc(collection(db, "pushSubscriptions"), {
      endpoint: json.endpoint,
      keys: json.keys,
      createdAt: Timestamp.now(),
    });
  }

  return "subscribed";
}

export async function currentPushState(): Promise<"on" | "off" | "unsupported"> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return "off";
  const sub = await registration.pushManager.getSubscription();
  return sub ? "on" : "off";
}
