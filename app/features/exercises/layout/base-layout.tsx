import { Outlet } from "react-router";

export default function BaseLayout() {
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col">
      <header className="border-b bg-background px-6 py-5">
        <h1 className="title2">운동관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          사용자가 선택할 운동상세정보를 관리합니다
        </p>
      </header>
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
