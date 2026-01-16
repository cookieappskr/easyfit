"use client";

import * as React from "react";
import { useParams, Link } from "react-router";
import type { Route } from "./+types/detail-page";

// Hooks
import { useUser } from "../hooks";

// Loader: 빈 loader (React Router 7 필수)
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

// Components
import { Button } from "~/common/components/core/button";
import { Skeleton } from "~/common/components/core/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/core/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "사용자 상세" },
    { name: "description", content: "Easy Fit 사용자 상세정보" },
  ];
}

/**
 * 사용자 상세 페이지
 * 
 * TanStack Query를 사용하여 사용자 정보를 조회합니다.
 */
export default function DetailPage() {
  const params = useParams();
  const userId = params.id || null;

  // Query
  const { data: user, isLoading, error } = useUser(userId);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">사용자 상세</h2>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">사용자 상세</h2>
        </div>
        <div className="rounded-lg border bg-card p-10 text-center">
          <p className="text-sm text-destructive">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
          <Button className="mt-4" asChild>
            <Link to="/users">목록으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 사용자 없음
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">사용자 상세</h2>
        </div>
        <div className="rounded-lg border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            사용자를 찾을 수 없습니다.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/users">목록으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="title4">사용자 상세</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          사용자 정보를 확인하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-sm font-medium text-muted-foreground">ID</span>
            <span className="text-sm">{user.id}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-sm font-medium text-muted-foreground">닉네임</span>
            <span className="text-sm">{user.nickname}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-sm font-medium text-muted-foreground">역할</span>
            <span className="text-sm">{user.role}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link to="/users">목록으로</Link>
        </Button>
      </div>
    </div>
  );
}
