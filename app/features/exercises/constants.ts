export interface SelectOption {
  value: string;
  label: string;
}

export const EXERCISE_TYPE_OPTIONS = [
  { value: "upper_body", label: "상체운동" },
  { value: "lower_body", label: "하체운동" },
  { value: "back", label: "등운동" },
  { value: "core", label: "코어운동" },
  { value: "cardio", label: "유산소운동" },
] satisfies SelectOption[];

export const MECHANIC_TYPE_OPTIONS = [
  { value: "machine", label: "기구운동" },
  { value: "bodyweight", label: "맨몸운동" },
  { value: "free_weight", label: "프리웨이트" },
  { value: "cardio", label: "유산소운동" },
] satisfies SelectOption[];

export const SORT_OPTIONS = [
  { value: "created_desc", label: "최신순" },
  { value: "created_asc", label: "오래된순" },
  { value: "name_asc", label: "이름순" },
  { value: "name_desc", label: "이름역순" },
] satisfies SelectOption[];
