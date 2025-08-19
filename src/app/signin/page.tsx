// // app/signin/page.tsx
// 'use client';
// import { useMemo } from 'react';
// import { supabase } from '@/lib/supabase';

// export default function Page() {
//   const next = useMemo(() => {
//     if (typeof window === 'undefined') return '/mypage';
//     return new URLSearchParams(window.location.search).get('next') ?? '/mypage';
//   }, []);

//   async function signInWithKakao() {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: 'kakao',
//       options: {
//         redirectTo: `${window.location.origin}${next}`, // 로그인 완료 후 이동할 경로
//       },
//     });
//     if (error) {
//       // TODO: 에러 토스트 등
//       console.error(error.message);
//     }
//   }

//   return (
//     <div>
//       <button onClick={signInWithKakao}>로그인</button>
//     </div>
//   );
// }
// 'use client';
// import { supabase } from '@/lib/supabase';

// export default function Page() {
//   async function signInWithKakao() {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'kakao',
//     });
//   }
//   return (
//     <div>
//       <button onClick={signInWithKakao}>로그인</button>
//     </div>
//   );
// }
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { browserClient } from '../utils/supabase/client';

const Login = () => {
  const signInWithKakao = async () => {
    const supabase = browserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    });
  };

  return (
    <div>
      <button type="button" onClick={signInWithKakao}>
        <Image
          src={'/kakao_login_medium_wide.png'}
          alt="카카오 로그인 이미지"
          width={300}
          height={45}
        />
      </button>
    </div>
  );
};

export default Login;
