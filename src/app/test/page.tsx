// 임시 디버깅 컴포넌트 - page.tsx에 추가해서 사용
'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

// zustand 스토어 import 시도 (경로는 실제 경로로 수정)
// import { useAuthStore } from '../../../stores/auth';
// import { useAuthStore } from '../../../../stores/auth';

export default function Page() {
  useEffect(() => {
    console.log('=== AUTH STORE DEBUG ===');

    // 방법 1: 직접 import해서 확인 (위의 import 주석 해제 후)
    const authState = useAuthStore.getState();
    console.log('Auth Store State:', authState);

    // 방법 2: localStorage 확인
    console.log('LocalStorage keys:', Object.keys(localStorage));
    Object.keys(localStorage).forEach((key) => {
      if (
        key.includes('auth') ||
        key.includes('user') ||
        key.includes('supabase')
      ) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    });

    // 방법 3: sessionStorage 확인
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    Object.keys(sessionStorage).forEach((key) => {
      if (
        key.includes('auth') ||
        key.includes('user') ||
        key.includes('supabase')
      ) {
        console.log(`${key}:`, sessionStorage.getItem(key));
      }
    });

    // 방법 4: 쿠키 확인
    console.log('Document cookies:', document.cookie);

    // 방법 5: 전역 변수 확인
    console.log('Window object check:');
    console.log('window.user:', (window as any).user);
    console.log('window.auth:', (window as any).auth);
    console.log('window.__NEXT_DATA__:', (window as any).__NEXT_DATA__);
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded mb-4">
      <h3 className="font-bold">🔍 인증 상태 디버깅</h3>
      <p className="text-sm">브라우저 콘솔을 확인하세요!</p>

      {/* zustand 스토어 사용 예시 */}
      {/*
      <div>
        <p>사용자: {user?.email || '없음'}</p>
        <p>로딩: {loading ? '예' : '아니오'}</p>
        <p>사용자 ID: {user?.id || '없음'}</p>
      </div>
      */}
    </div>
  );
}
