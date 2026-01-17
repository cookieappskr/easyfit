"use client";

import * as React from "react";
import { useNavigate, useParams } from "react-router";
import type { Route } from "./+types/detail-page";

// Hooks
import {
  useExercise,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
  useExerciseTypeOptions,
  useMechanicTypeOptions,
} from "../hooks";

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
import { Progress } from "~/common/components/core/progress";

// Constants
import { EXERCISE_TYPE_OPTIONS, MECHANIC_TYPE_OPTIONS } from "../constants";

// Loader (React Router 7 필수)
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

export function meta({ params }: Route.MetaArgs) {
  const isNew = params.id === "new";
  return [
    { title: isNew ? "운동 추가 - Easy Fit" : "운동 수정 - Easy Fit" },
    { name: "description", content: "운동상세정보를 관리하세요." },
  ];
}

interface QuickGuideItem {
  id: string;
  text: string;
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const exerciseId = isNew ? null : parseInt(id || "0", 10);

  // TanStack Query
  const {
    data: exercise,
    isLoading,
    error: exerciseError,
  } = useExercise(exerciseId);
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const deleteMutation = useDeleteExercise();

  // 동적 카테고리 옵션 조회
  const { data: exerciseTypeOptionsData } = useExerciseTypeOptions();
  const { data: mechanicTypeOptionsData } = useMechanicTypeOptions();

  const currentExerciseTypeOptions =
    exerciseTypeOptionsData && exerciseTypeOptionsData.length > 0
      ? exerciseTypeOptionsData
      : EXERCISE_TYPE_OPTIONS;

  const currentMechanicTypeOptions =
    mechanicTypeOptionsData && mechanicTypeOptionsData.length > 0
      ? mechanicTypeOptionsData
      : MECHANIC_TYPE_OPTIONS;

  // 폼 상태
  const [exerciseType, setExerciseType] = React.useState("");
  const [mechanicType, setMechanicType] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [videoLink, setVideoLink] = React.useState("");
  const [quickGuideItems, setQuickGuideItems] = React.useState<
    QuickGuideItem[]
  >([]);

  // 에러 상태
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 기존 데이터로 폼 초기화
  React.useEffect(() => {
    if (exercise) {
      setExerciseType(exercise.exercise_type || "");
      setMechanicType(exercise.mechanic_type || "");
      setName(exercise.name);
      setDescription(exercise.description);
      setVideoLink(exercise.video_link || "");
      setQuickGuideItems(
        (exercise.quick_guide || []).map((text, index) => ({
          id: `guide-${index}`,
          text,
        }))
      );
    } else if (isNew) {
      // 새 항목일 경우에만 초기화
      setExerciseType("");
      setMechanicType("");
      setName("");
      setDescription("");
      setVideoLink("");
      setQuickGuideItems([]);
    }
  }, [exercise, isNew]);

  // 퀵가이드 추가
  const handleAddQuickGuide = () => {
    setQuickGuideItems([
      ...quickGuideItems,
      { id: `guide-${Date.now()}`, text: "" },
    ]);
  };

  // 퀵가이드 제거
  const handleRemoveQuickGuide = (id: string) => {
    setQuickGuideItems(quickGuideItems.filter((item) => item.id !== id));
  };

  // 퀵가이드 변경
  const handleQuickGuideChange = (id: string, text: string) => {
    setQuickGuideItems(
      quickGuideItems.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  // 유효성 검사
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!exerciseType) {
      newErrors.exerciseType = "운동부위를 선택해주세요.";
    }
    if (!mechanicType) {
      newErrors.mechanicType = "운동유형을 선택해주세요.";
    }
    if (!name.trim()) {
      newErrors.name = "운동명을 입력해주세요.";
    } else if (name.length > 50) {
      newErrors.name = "운동명은 50글자 이내로 입력해주세요.";
    }
    if (!description.trim()) {
      newErrors.description = "운동설명을 입력해주세요.";
    } else if (description.length > 200) {
      newErrors.description = "운동설명은 200글자 이내로 입력해주세요.";
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
      exercise_type: exerciseType,
      mechanic_type: mechanicType,
      name: name.trim(),
      description: description.trim(),
      video_link: videoLink.trim() || null,
      quick_guide:
        quickGuideItems.length > 0
          ? quickGuideItems.map((item) => item.text.trim()).filter(Boolean)
          : null,
    };

    try {
      if (isNew) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({
          id: exerciseId!,
          updates: payload,
        });
      }
      navigate("/exercises");
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "운동을 삭제하면 관련된 사용자의 운동플랜에서 모두 삭제되므로 주의해야 합니다. 삭제하시겠습니까?"
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(exerciseId!);
      navigate("/exercises");
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
          <h2 className="title4">운동상세정보</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            운동상세정보를 관리하세요.
          </p>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="title4">운동상세정보</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          운동상세정보를 관리하세요.
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
            {/* 운동부위 분류 */}
            <FormItem
              label="운동부위 분류"
              id="exercise-type"
              required
              error={errors.exerciseType}
            >
              <Select
                value={exerciseType || ""}
                onValueChange={(value) => {
                  if (value) {
                    // 빈 문자열 무시 (초기 렌더링 시 발생)
                    setExerciseType(value);
                  }
                }}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="운동부위를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {currentExerciseTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {/* 운동유형 */}
            <FormItem
              label="운동유형"
              id="mechanic-type"
              required
              error={errors.mechanicType}
            >
              <Select
                value={mechanicType || ""}
                onValueChange={(value) => {
                  if (value) {
                    // 빈 문자열 무시 (초기 렌더링 시 발생)
                    setMechanicType(value);
                  }
                }}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="운동유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {currentMechanicTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {/* 운동명 */}
            <FormItem
              label="운동명"
              id="name"
              required
              error={errors.name}
              tooltip="50글자 이내로 입력해주세요"
              inputProps={{
                value: name,
                onChange: (e) => setName(e.target.value),
                placeholder: "운동명을 입력하세요",
                maxLength: 50,
                disabled: isProcessing,
              }}
            />

            {/* 운동설명 */}
            <FormItem
              label="운동설명"
              id="description"
              required
              error={errors.description}
              tooltip="200글자 이내로 입력해주세요"
              type="textarea"
              textareaProps={{
                value: description,
                onChange: (e) => setDescription(e.target.value),
                placeholder: "운동설명을 입력하세요",
                maxLength: 200,
                rows: 4,
                disabled: isProcessing,
              }}
            />

            {/* 동영상 링크 */}
            <FormItem
              label="동영상 링크"
              id="video-link"
              tooltip="운동방법에 대한 동영상 가이드 링크를 입력하세요"
              inputProps={{
                value: videoLink,
                onChange: (e) => setVideoLink(e.target.value),
                placeholder: "https://...",
                type: "url",
                disabled: isProcessing,
              }}
            />

            {/* 퀵가이드 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">퀵가이드</label>
                  <span className="text-xs text-muted-foreground">
                    (운동방법에 대한 가이드)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuickGuide}
                  disabled={isProcessing}
                >
                  항목 추가
                </Button>
              </div>

              {quickGuideItems.length > 0 && (
                <div className="space-y-2">
                  {quickGuideItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <FormItem
                        label=""
                        id={`quick-guide-${item.id}`}
                        inputProps={{
                          value: item.text,
                          onChange: (e) =>
                            handleQuickGuideChange(item.id, e.target.value),
                          placeholder: "가이드 내용을 입력하세요",
                          disabled: isProcessing,
                        }}
                      >
                        <input
                          value={item.text}
                          onChange={(e) =>
                            handleQuickGuideChange(item.id, e.target.value)
                          }
                          placeholder="가이드 내용을 입력하세요"
                          disabled={isProcessing}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormItem>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuickGuide(item.id)}
                        disabled={isProcessing}
                      >
                        제거
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              onClick={() => navigate("/exercises")}
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
