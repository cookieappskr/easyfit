import { useState, useEffect } from "react";
import { browserClient } from "~/supa-client";
import type { User } from "@supabase/supabase-js";
import { Button } from "~/common/components/core/button";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 현재 세션 확인 및 구독
    browserClient.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: authListener } = browserClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Google 로그인 함수
  const signInWithGoogle = async () => {
    const { error } = await browserClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 인증 후 돌아올 URL 설정 (Supabase 대시보드에도 등록 필수)
        redirectTo: window.location.origin + "/auth/callback",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) console.error("Error logging in:", error.message);
  };

  // 이미 로그인된 경우는 callback-page에서 처리하므로 여기서는 표시하지 않음
  if (user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
        <h1 className="title1">어드민 로그인</h1>

        <p className="text-center text-muted-foreground leading-relaxed">
          이지핏 관리자용 화면입니다. 구글로그인 후 정보를 업데이트 하면
          수퍼관리자가 관리자로 설정 후 시스템을 이용할 수 있습니다.
        </p>

        <Button
          onClick={signInWithGoogle}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <GoogleIcon />
          구글 로그인
        </Button>
      </div>
    </div>
  );
}

// Google 아이콘 컴포넌트
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
