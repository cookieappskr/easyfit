// 유형설정부
export const CATEGORY_TYPES = [
  { label: "Exercise", value: "exercise" },
  { label: "Program", value: "program" },
  { label: "User", value: "user" },
  { label: "Other", value: "other" },
] as const;

// 콘텐츠 제약조건 설정부
export const CONTENT_CONSTRAINTS = {
  name: {
    min: 1,
    max: 50,
  },
  description: {
    min: 1,
    max: 200,
  },
};
