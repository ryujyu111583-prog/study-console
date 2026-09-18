"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ALLOWED_EMAIL, auth, googleProvider } from "./firebase";

export type AuthStatus = "loading" | "signed-out" | "not-allowed" | "signed-in";

/** 認証の初回応答をこれ以上待たない。超えたらログイン画面を出す。 */
const AUTH_TIMEOUT_MS = 8000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [loginError, setLoginError] = useState<string | null>(null);
  /** 認証サーバーに届かないまま時間切れになったか。無限スピナーを防ぐ。 */
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setStalled(true), AUTH_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setStalled(false);
      setUser(nextUser);
      if (!nextUser) {
        setStatus("signed-out");
        return;
      }
      // 許可アドレスを設定していない場合は、誤って誰でも入れる状態にしない。
      const allowed = ALLOWED_EMAIL !== "" && nextUser.email === ALLOWED_EMAIL;
      setStatus(allowed ? "signed-in" : "not-allowed");
    });
  }, []);

  const login = () => {
    setLoginError(null);
    signInWithPopup(auth, googleProvider).catch((err) => {
      setLoginError(`${err.code ?? ""} ${err.message ?? err}`);
    });
  };

  const logout = () => signOut(auth);

  return { user, status, login, logout, loginError, stalled };
}
