// components/AuthHydrator.tsx (클라이언트 컴포넌트)
'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // createClient(브라우저)
import { useAuthStore } from '@/stores/authStore';

export default function AuthHydrator({
  initialUser,
}: {
  initialUser: any | null;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    // 서버 초기값 반영
    setUser(initialUser ?? null);
    setLoading(false);

    // 런타임 상태 동기화
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [initialUser, setUser, setLoading]);

  return null; // UI 없음
}
