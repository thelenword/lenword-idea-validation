import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createElement } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (params: { email: string; password: string; fullName: string; role: string }) => Promise<any>;
  signIn: (params: { email: string; password: string }) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  updateProfile: (updates: Database["public"]["Tables"]["profiles"]["Update"]) => Promise<Profile | null>;
  uploadAvatar: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(async ({ email, password, fullName, role }: any) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    });
    setLoading(false);
    if (error) throw error;
    return data;
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async ({ email, password }: any) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) throw error;
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) throw error;
    return data;
  }, []);

  const updateProfile = useCallback(async (updates: Database["public"]["Tables"]["profiles"]["Update"]) => {
    if (!user) throw new Error("You must be logged in to update your profile");
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      // @ts-expect-error Supabase types infer never for update params sometimes
      .upsert({ id: user.id, email: user.email, ...updates })
      .select()
      .maybeSingle();
    
    setLoading(false);
    if (error) throw error;
    const profileData = data as Profile | null;
    setProfile(profileData);
    return profileData;
  }, [user]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB.");
    }

    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting param so the browser reloads the image
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      
      const { data, error } = await supabase
        .from("profiles")
        // @ts-expect-error Supabase types infer never for update params sometimes
        .upsert({ id: user.id, email: user.email, avatar_url: avatarUrl })
        .select()
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      return avatarUrl;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendVerification,
    updateProfile,
    uploadAvatar,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
