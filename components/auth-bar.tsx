"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase-browser";

export default function AuthBar() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    // Redirect back to site origin to avoid mismatched callback URLs
    const redirectTo = window.location.origin; // e.g., http://localhost:3000
    await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {loading ? (
        <small>Loading auth…</small>
      ) : userEmail ? (
        <>
          <small>Signed in as {userEmail}</small>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <button onClick={signIn}>Sign in</button>
      )}
    </div>
  );
}