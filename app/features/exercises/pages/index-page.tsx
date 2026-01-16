"use client";

import * as React from "react";
import { Form, Link, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/index-page";
import { makeSSRClient } from "~/supa-client";
import { getExercises } from "../queries";
import ExerciseListItem from "../components/list-item";
import { Input } from "~/common/components/core/input";
import { Button } from "~/common/components/core/button";
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
import { EXERCISE_TYPE_OPTIONS, SORT_OPTIONS } from "../constants";
import { cn } from "~/lib/utils";

const PAGE_SIZE = 20;
const PAGE_GROUP_SIZE = 10;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);

  const pageParam = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const exerciseTypeParam = url.searchParams.get("exerciseType") ?? "";
  const exerciseType =
    exerciseTypeParam === "all" ? "" : exerciseTypeParam;
  const searchName = url.searchParams.get("searchName") ?? "";
  const sort = url.searchParams.get("sort") ?? "created_desc";

  const { items, total } = await getExercises(client, {
    page,
    pageSize: PAGE_SIZE,
    exerciseType: exerciseType || undefined,
    searchName: searchName || undefined,
    sort,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    items,
    pagination: { page, totalPages, total },
    filters: { exerciseType: exerciseType || "all", searchName, sort },
  };
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "운동목록" },
    { name: "description", content: "Easy Fit 운동목록 관리" },
  ];
}

export default function IndexPage({ loaderData }: Route.ComponentProps) {
  const { items, pagination, filters } = loaderData;
  const navigation = useNavigation();
  const formRef = React.useRef<HTMLFormElement>(null);

  const [exerciseType, setExerciseType] = React.useState(filters.exerciseType);
  const [sort, setSort] = React.useState(filters.sort);

  const isSearching = navigation.state === "submitting";

  React.useEffect(() => {
    setExerciseType(filters.exerciseType);
    setSort(filters.sort);
  }, [filters.exerciseType, filters.sort]);

  const handleExerciseTypeChange = (value: string) => {
    setExerciseType(value);
    formRef.current?.requestSubmit();
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    formRef.current?.requestSubmit();
  };

  const groupStart =
    Math.floor((pagination.page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(
    groupStart + PAGE_GROUP_SIZE - 1,
    pagination.totalPages
  );

  const createPageLink = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (exerciseType && exerciseType !== "all") {
      params.set("exerciseType", exerciseType);
    }
    if (filters.searchName) {
      params.set("searchName", filters.searchName);
    }
    if (sort) {
      params.set("sort", sort);
    }
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="title4">운동목록</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          사용자가 선택하는 운동정보를 관리하세요.
        </p>
      </div>

      <Form
        ref={formRef}
        method="get"
        className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={exerciseType} onValueChange={handleExerciseTypeChange}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="운동분류 선택" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">전체</SelectItem>
                {EXERCISE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="searchName"
              defaultValue={filters.searchName}
              placeholder="운동명을 입력하세요"
              className="min-w-[240px]"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "검색 중..." : "검색"}
            </Button>
          </div>

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

        <input type="hidden" name="exerciseType" value={exerciseType} />
        <input type="hidden" name="sort" value={sort} />
      </Form>

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
                index={(pagination.page - 1) * PAGE_SIZE + index + 1}
                isLast={index === items.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Pagination className={cn(items.length === 0 && "opacity-50")}>
          <PaginationContent>
            {groupStart > 1 && (
              <PaginationItem>
                <PaginationLink
                  size="default"
                  href={createPageLink(groupStart - 1)}
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
                    href={createPageLink(pageNumber)}
                    isActive={pagination.page === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {groupEnd < pagination.totalPages && (
              <PaginationItem>
                <PaginationLink
                  size="default"
                  href={createPageLink(groupEnd + 1)}
                >
                  다음 10페이지
                </PaginationLink>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>

        <div className="flex justify-end">
          <Button asChild>
            <Link to="/exercises/new">추가</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
