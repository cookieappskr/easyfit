"use client";

import * as React from "react";
import { Link } from "react-router";
import type { Route } from "./+types/index-page";

// Hooks
import { useExercises, useExerciseTypeOptions } from "../hooks";

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
import ExerciseListItem from "../components/list-item";

// Constants
import { SORT_OPTIONS, EXERCISE_TYPE_OPTIONS } from "../constants";
import { cn } from "~/lib/utils";

const PAGE_SIZE = 20;
const PAGE_GROUP_SIZE = 10;

// Loader (React Router 7 필수)
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "운동목록 - Easy Fit" },
    {
      name: "description",
      content: "사용자가 선택하는 운동정보를 관리하세요.",
    },
  ];
}

export default function IndexPage() {
  // 로컬 상태로 필터 관리
  const [page, setPage] = React.useState(1);
  const [exerciseType, setExerciseType] = React.useState<string>("");
  const [searchName, setSearchName] = React.useState<string>("");
  const [sort, setSort] = React.useState("created_desc");

  // TanStack Query로 데이터 가져오기
  const { data, isLoading, error } = useExercises({
    page,
    pageSize: PAGE_SIZE,
    exerciseType: exerciseType || undefined,
    searchName: searchName || undefined,
    sort,
  });

  // 동적 카테고리 옵션 조회
  const { data: exerciseTypeOptionsData } = useExerciseTypeOptions();

  const currentExerciseTypeOptions =
    exerciseTypeOptionsData && exerciseTypeOptionsData.length > 0
      ? exerciseTypeOptionsData
      : EXERCISE_TYPE_OPTIONS;

  // 운동 타입 변경 핸들러
  const handleExerciseTypeChange = (value: string) => {
    setExerciseType(value === "all" ? "" : value);
    setPage(1);
  };

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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">운동목록</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            사용자가 선택하는 운동정보를 관리하세요.
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
          <h2 className="title4">운동목록</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            사용자가 선택하는 운동정보를 관리하세요.
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
        <h2 className="title4">운동목록</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          사용자가 선택하는 운동정보를 관리하세요.
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
            <Select
              value={exerciseType || "all"}
              onValueChange={handleExerciseTypeChange}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="운동분류 선택" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">전체</SelectItem>
                {currentExerciseTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="운동명을 입력하세요"
              className="min-w-[240px]"
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
        <div className="grid grid-cols-[80px_160px_160px_minmax(160px,1fr)_minmax(240px,2fr)] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>NO</span>
          <span>운동부위</span>
          <span>운동유형</span>
          <span>운동명</span>
          <span>운동설명</span>
        </div>
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            등록된 운동이 없습니다.
          </div>
        ) : (
          <div>
            {items.map((exercise, index) => (
              <ExerciseListItem
                key={exercise.id}
                exercise={exercise}
                index={(page - 1) * PAGE_SIZE + index + 1}
                isLast={index === items.length - 1}
                exerciseTypeOptions={currentExerciseTypeOptions}
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
            <Link to="/exercises/new">추가</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
