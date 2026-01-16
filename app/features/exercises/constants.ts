import type { ExerciseListParams } from "./queries";

export interface SelectOption {
  value: string;
  label: string;
  displayOrder?: number;
}

// 기본 운동부위 옵션 (Supabase에서 로딩 실패 시 사용)
export const EXERCISE_TYPE_OPTIONS: SelectOption[] = [
  { value: "UPPER_BODY", label: "상체운동", displayOrder: 1 },
  { value: "LOWER_BODY", label: "하체운동", displayOrder: 2 },
  { value: "BACK", label: "등운동", displayOrder: 3 },
  { value: "CORE", label: "코어운동", displayOrder: 4 },
  { value: "CARDIO", label: "유산소운동", displayOrder: 5 },
];

// 기본 운동유형 옵션 (Supabase에서 로딩 실패 시 사용)
export const MECHANIC_TYPE_OPTIONS: SelectOption[] = [
  { value: "MACHINE", label: "기구운동", displayOrder: 1 },
  { value: "BODYWEIGHT", label: "맨몸운동", displayOrder: 2 },
  { value: "FREE_WEIGHT", label: "프리웨이트", displayOrder: 3 },
  { value: "CARDIO", label: "유산소운동", displayOrder: 4 },
];

// 정렬 옵션
export const SORT_OPTIONS: SelectOption[] = [
  { value: "created_desc", label: "최신순" },
  { value: "created_asc", label: "오래된순" },
  { value: "name_asc", label: "이름순" },
  { value: "name_desc", label: "이름역순" },
];

/**
 * TanStack Query Keys for Exercises
 */
export const exercisesKeys = {
  all: ["exercises"] as const,
  lists: () => [...exercisesKeys.all, "list"] as const,
  list: (params: ExerciseListParams) =>
    [...exercisesKeys.lists(), params] as const,
  details: () => [...exercisesKeys.all, "detail"] as const,
  detail: (id: number) => [...exercisesKeys.details(), id] as const,
};
