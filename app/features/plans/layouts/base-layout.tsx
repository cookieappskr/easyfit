import { Outlet } from "react-router";

export default function BaseLayout() {
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col">
      <header className="border-b bg-background px-6 py-5">
        <h1 className="title2">운동계획생성 프롬프트 관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          사용자상황에 맞는 AI기반 점진적부하플랜을 수립하기 위한 프롬프트를 관리합니다.
        </p>
      </header>
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
