import * as React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  useLocation,
  useNavigation,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";

// TanStack Query
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";

// Navigation & Auth
import { getUserById } from "./features/users/queries";
import { makeSSRClient } from "./supa-client";
import { useAuthStore, initializeAuth } from "./stores/use-auth-store";

// components
import Navigation from "./common/components/naviagation";
import { Settings } from "luxon";

// Styles
import "./app.css";
import { createFontLinks } from "./common/config/fonts";
import { cn } from "./lib/utils";

// Layout 및 기본설정
export function Layout({ children }: { children: React.ReactNode }) {
  // 국가설정 (META 설정은 각 페이지마다 해 주어야 함)
  Settings.defaultLocale = "ko";
  Settings.defaultZone = "Asia/Seoul";
  // 폰트 설정
  const fontLinks = createFontLinks();
  // 메타 태그 설정
  const metaTags = [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "description", content: "Easy Fit Admin" },
  ];
  // 레이아웃 영역
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 인증설정
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user) {
    try {
      const profile = await getUserById(client, user.id);
      return { user, profile };
    } catch (error) {
      // 프로필이 없는 경우 null 반환
      console.error("Failed to get user profile:", error);
      return { user, profile: null };
    }
  }
  return { user: null, profile: null };
};

// App
export default function App({ loaderData }: Route.ComponentProps) {
  // 인증처리부
  const { user, profile } = loaderData;
  const { pathname } = useLocation();

  // Zustand store 초기화
  React.useEffect(() => {
    initializeAuth(user, profile);
  }, [user, profile]);

  // Store에서 인증 상태 가져오기
  const { isAuthenticated, isAdmin } = useAuthStore();

  // 로딩처리부
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // 레이아웃 영역
  const isAuthPage = pathname.includes("/auth");

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn("bg-amber-50 h-screen", {
          "opacity-50": isLoading,
        })}
      >
        {!isAuthPage && (
          <Navigation
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            profile={profile}
          />
        )}
        <div
          className={cn({
            "pt-28 px-20": !isAuthPage,
          })}
        >
          <Outlet context={{ isAuthenticated, isAdmin, profile }} />
        </div>
      </div>
      {/* React Query DevTools - 개발 환경에서만 표시 */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

// ErrorBoundary (Fallback UI)
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "알수 없는 에러가 발생하였습니다. 관리자에게 문의해주세요.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "요청하신 페이지를 찾을 수 없습니다. 관리자에게 문의해주세요."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
