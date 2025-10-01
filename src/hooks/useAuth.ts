'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  role: string | null;
  date_of_birth: string | null;
  education: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // ดึงข้อมูล user ปัจจุบัน
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // ดึงข้อมูล profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, photo_url, role, date_of_birth, education')
            .eq('id', user.id)
            .single();
          
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // ติดตาม auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, photo_url, role, date_of_birth, education')
            .eq('id', session.user.id)
            .single();
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, profile, loading };
}

