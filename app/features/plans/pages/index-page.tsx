"use client";

import * as React from "react";
import { Link } from "react-router";
import type { Route } from "./+types/index-page";

// Hooks
import { usePrompts, useActivatePrompt } from "../hooks";

// Components
import { Button } from "~/common/components/core/button";
import { Skeleton } from "~/common/components/core/skeleton";
import { Input } from "~/common/components/core/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/core/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "~/common/components/core/pagination";
import PromptListItem from "../components/list-item";

// Constants
import { SORT_OPTIONS } from "../constants";
import { cn } from "~/lib/utils";

const PAGE_SIZE = 20;
const PAGE_GROUP_SIZE = 10;

// Loader
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "운동계획 프롬프트 관리 - Easy Fit" },
    {
      name: "description",
      content: "AI 기반 운동계획 생성을 위한 프롬프트를 관리합니다.",
    },
  ];
}

export default function IndexPage() {
  // 로컬 상태로 필터 관리
  const [page, setPage] = React.useState(1);
  const [searchPrompt, setSearchPrompt] = React.useState("");
  const [sort, setSort] = React.useState("created_desc");

  // TanStack Query로 데이터 가져오기
  const { data, isLoading, error } = usePrompts({
    page,
    pageSize: PAGE_SIZE,
    searchPrompt: searchPrompt || undefined,
    sort,
  });

  // 활성화 Mutation
  const activateMutation = useActivatePrompt();

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 활성화 토글 핸들러
  const handleToggleActive = (id: number) => {
    const confirmed = window.confirm("이 프롬프트를 선택하시겠습니까?");
    if (!confirmed) return;

    activateMutation.mutate(id);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">프롬프트 목록</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            등록된 프롬프트를 관리하세요.
          </p>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">프롬프트 목록</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            등록된 프롬프트를 관리하세요.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-10 text-center">
          <p className="text-sm text-destructive">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const groupStart =
    Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="title4">프롬프트 목록</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          등록된 프롬프트를 관리하세요.
        </p>
      </div>

      {/* 검색부 + 정렬부 */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 검색부 */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              placeholder="기본프롬프트 검색"
              className="min-w-[300px]"
            />
            <Button type="submit">검색</Button>
          </div>

          {/* 정렬부 */}
          <div className="flex items-center gap-3">
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="min-w-[160px]">
                <SelectValue placeholder="정렬 선택" />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>

      {/* 목록 */}
      <div className="rounded-lg border bg-card shadow-xs">
        <div className="grid grid-cols-[80px_200px_150px_1fr_120px_100px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>NO</span>
          <span>제목</span>
          <span>LLM 모델</span>
          <span>기본프롬프트</span>
          <span>등록일</span>
          <span className="text-center">활성화</span>
        </div>
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            등록된 프롬프트가 없습니다.
          </div>
        ) : (
          <div>
            {items.map((prompt, index) => (
              <PromptListItem
                key={prompt.id}
                prompt={prompt}
                index={(page - 1) * PAGE_SIZE + index + 1}
                isLast={index === items.length - 1}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* 페이징부 + 버튼 그룹 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Pagination className={cn(items.length === 0 && "opacity-50")}>
          <PaginationContent>
            {groupStart > 1 && (
              <PaginationItem>
                <PaginationLink
                  size="default"
                  onClick={() => handlePageChange(groupStart - 1)}
                  className="cursor-pointer"
                >
                  이전 10페이지
                </PaginationLink>
              </PaginationItem>
            )}
            {Array.from({ length: groupEnd - groupStart + 1 }).map((_, idx) => {
              const pageNumber = groupStart + idx;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNumber)}
                    isActive={page === pageNumber}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {groupEnd < totalPages && (
              <PaginationItem>
                <PaginationLink
                  size="default"
                  onClick={() => handlePageChange(groupEnd + 1)}
                  className="cursor-pointer"
                >
                  다음 10페이지
                </PaginationLink>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>

        {/* 버튼 그룹 */}
        <div className="flex justify-end">
          <Button asChild>
            <Link to="/plans/new">추가</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
