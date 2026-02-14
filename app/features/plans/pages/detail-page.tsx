"use client";

import * as React from "react";
import { useNavigate, useParams } from "react-router";
import type { Route } from "./+types/detail-page";

// Hooks
import {
  usePrompt,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
} from "../hooks";

// Hook for LLM Model options
import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";

// Components
import { Button } from "~/common/components/core/button";
import { Skeleton } from "~/common/components/core/skeleton";
import FormItem from "~/common/components/form-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/core/select";
import { Textarea } from "~/common/components/core/textarea";
import { Progress } from "~/common/components/core/progress";

// Constants
import { DEFAULT_BASE_PROMPT, DEFAULT_OUTPUT_FORMAT } from "../constants";

// Loader
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

export function meta({ params }: Route.MetaArgs) {
  const isNew = params.id === "new";
  return [
    {
      title: isNew
        ? "프롬프트 추가 - Easy Fit"
        : "프롬프트 수정 - Easy Fit",
    },
    { name: "description", content: "운동계획 생성 프롬프트를 관리하세요." },
  ];
}

// LLM 모델 옵션 조회 Hook
const useLLMModelOptions = () => {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ["categories", "LLM_MODEL_TYPE"],
    queryFn: async () => {
      // 1. 부모 카테고리 찾기
      const { data: parentCategory, error: parentError } = await client
        .from("categories")
        .select("id")
        .eq("code", "LLM_MODEL_TYPE")
        .maybeSingle();

      if (parentError || !parentCategory) {
        return [];
      }

      // 2. 자식 카테고리 조회
      const { data: children, error: childError } = await client
        .from("categories")
        .select("code, name, is_active")
        .eq("parent_id", parentCategory.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (childError) {
        return [];
      }

      return (children || []).map((cat: any) => ({
        value: cat.code,
        label: cat.name,
      }));
    },
    staleTime: 1000 * 60 * 30,
  });
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const promptId = isNew ? null : parseInt(id || "0", 10);

  // TanStack Query
  const { data: prompt, isLoading } = usePrompt(promptId);
  const createMutation = useCreatePrompt();
  const updateMutation = useUpdatePrompt();
  const deleteMutation = useDeletePrompt();

  // LLM 모델 옵션 조회
  const { data: llmModelOptions = [] } = useLLMModelOptions();

  // 폼 상태
  const [title, setTitle] = React.useState("");
  const [llmModelCode, setLlmModelCode] = React.useState("");
  const [basePrompt, setBasePrompt] = React.useState(DEFAULT_BASE_PROMPT);
  const [outputFormat, setOutputFormat] = React.useState(DEFAULT_OUTPUT_FORMAT);
  const [isActive, setIsActive] = React.useState(false);

  // 에러 상태
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 기존 데이터로 폼 초기화
  React.useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setLlmModelCode(prompt.llm_model_code);
      setBasePrompt(prompt.base_prompt);
      setOutputFormat(prompt.output_format);
      setIsActive(prompt.is_active);
    } else if (isNew) {
      setTitle("");
      setLlmModelCode("");
      setBasePrompt(DEFAULT_BASE_PROMPT);
      setOutputFormat(DEFAULT_OUTPUT_FORMAT);
      setIsActive(false);
    }
  }, [prompt, isNew]);

  // 유효성 검사
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (title.length > 50) {
      newErrors.title = "제목은 50글자 이내로 입력해주세요.";
    }

    if (!llmModelCode) {
      newErrors.llmModelCode = "LLM 모델을 선택해주세요.";
    }

    if (!basePrompt.trim()) {
      newErrors.basePrompt = "기본프롬프트를 입력해주세요.";
    } else if (basePrompt.length > 2000) {
      newErrors.basePrompt = "기본프롬프트는 2000글자 이내로 입력해주세요.";
    }

    if (!outputFormat.trim()) {
      newErrors.outputFormat = "출력형식을 입력해주세요.";
    } else if (outputFormat.length > 2000) {
      newErrors.outputFormat = "출력형식은 2000글자 이내로 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 등록/수정 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      title: title.trim(),
      llm_model_code: llmModelCode,
      base_prompt: basePrompt.trim(),
      output_format: outputFormat.trim(),
      is_active: isNew ? false : isActive, // 새로 생성할 때는 false, 수정할 때는 기존 값 유지
    };

    try {
      if (isNew) {
        await createMutation.mutateAsync(payload);
      } else {
        const result = await updateMutation.mutateAsync({
          id: promptId!,
          updates: payload,
        });
        // 업데이트 결과 확인
        if (!result) {
          throw new Error("업데이트에 실패했습니다. 데이터가 반환되지 않았습니다.");
        }
      }
      navigate("/plans");
    } catch (error) {
      console.error("저장 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
      alert(errorMessage);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "프롬프트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(promptId!);
      navigate("/plans");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  // 로딩 상태
  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading && !isNew) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="title4">프롬프트 상세</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            프롬프트 정보를 관리하세요.
          </p>
        </div>
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="title4">프롬프트 상세</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          프롬프트 정보를 관리하세요.
        </p>
      </div>

      {/* 로딩 progress 바 */}
      {isProcessing && (
        <div className="rounded-lg border bg-card p-4">
          <Progress value={undefined} className="w-full" />
          <p className="mt-2 text-center text-sm text-muted-foreground">
            처리 중...
          </p>
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-xs">
          <div className="space-y-6">
            {/* 제목 */}
            <FormItem
              label="제목"
              id="title"
              required
              error={errors.title}
              tooltip="50글자 이내로 입력해주세요"
              inputProps={{
                value: title,
                onChange: (e) => setTitle(e.target.value),
                placeholder: "프롬프트 제목을 입력하세요",
                maxLength: 50,
                disabled: isProcessing,
              }}
            />

            {/* LLM 모델 */}
            <FormItem
              label="LLM 모델"
              id="llm-model"
              required
              error={errors.llmModelCode}
            >
              <Select
                value={llmModelCode || ""}
                onValueChange={(value) => {
                  if (value) setLlmModelCode(value);
                }}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="LLM 모델을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {llmModelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {/* 기본프롬프트 */}
            <div className="space-y-2">
              <FormItem
                label="기본프롬프트"
                id="base-prompt"
                required
                error={errors.basePrompt}
                tooltip="2000글자까지 입력 가능합니다"
              >
                <div className="relative">
                  <Textarea
                    value={basePrompt}
                    onChange={(e) => setBasePrompt(e.target.value)}
                    placeholder="기본프롬프트를 입력하세요"
                    maxLength={2000}
                    rows={10}
                    disabled={isProcessing}
                    className="resize-none"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {basePrompt.length} / 2000
                  </div>
                </div>
              </FormItem>
            </div>

            {/* 출력형식 */}
            <div className="space-y-2">
              <FormItem
                label="출력형식"
                id="output-format"
                required
                error={errors.outputFormat}
                tooltip="2000글자까지 입력 가능합니다"
              >
                <div className="relative">
                  <Textarea
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    placeholder="출력형식을 입력하세요"
                    maxLength={2000}
                    rows={10}
                    disabled={isProcessing}
                    className="resize-none"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {outputFormat.length} / 2000
                  </div>
                </div>
              </FormItem>
            </div>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex items-center justify-between">
          {!isNew && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              삭제
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/plans")}
              disabled={isProcessing}
            >
              목록
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isNew ? "추가" : "업데이트"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
