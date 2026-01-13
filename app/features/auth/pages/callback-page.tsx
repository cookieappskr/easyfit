import { useEffect } from "react";
import { useNavigate } from "react-router";
import { browserClient } from "~/supa-client";

/**
 * Supabase OAuth 콜백 처리 페이지
 * 인증 후 프로필 업데이트 페이지로 리디렉션
 */
export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL의 해시에서 인증 정보 추출
        const { data, error } = await browserClient.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/auth/login");
          return;
        }

        if (data.session) {
          // 프로필이 있는지 확인
          const { data: profile, error: profileError } = await browserClient
            .from("profiles")
            .select("nickname, gender, birth_year, height, weight")
            .eq("id", data.session.user.id)
            .maybeSingle();

          // 프로필이 없거나 필수 정보가 없으면 업데이트 페이지로
          if (
            profileError ||
            !profile ||
            !profile.nickname ||
            !profile.gender ||
            !profile.birth_year ||
            !profile.height ||
            !profile.weight
          ) {
            navigate("/auth/update-profile");
          } else {
            // 프로필이 완전하면 홈으로
            navigate("/");
          }
        } else {
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Callback error:", error);
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>인증 처리 중...</p>
    </div>
  );
}
