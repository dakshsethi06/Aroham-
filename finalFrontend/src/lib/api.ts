import { supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function api(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...options.headers,
    },
  });
  
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || (body.errors || []).join(", ") || "Request failed");
  return body;
}

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}
