"use client";

import * as React from "react";
import type { Route } from "./+types/index-page";

// Loader: 빈 loader (React Router 7 필수)
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "사용자 목록" },
    { name: "description", content: "Easy Fit 사용자 목록" },
  ];
}

/**
 * 사용자 목록 페이지
 * 
 * TODO: 실제 사용자 목록 기능 구현 필요
 * - 사용자 검색 및 필터링
 * - 페이지네이션
 * - 사용자 상세 보기
 */
export default function IndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="title4">사용자 목록</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Easy Fit 사용자를 관리하세요.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-10 text-center shadow-xs">
        <p className="text-sm text-muted-foreground">
          사용자 목록 기능은 곧 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}
