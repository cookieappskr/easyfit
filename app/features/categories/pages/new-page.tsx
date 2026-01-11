// Imports
import z from "zod";
import { CATEGORY_TYPES, CONTENT_CONSTRAINTS } from "../constants";
import type { MetaFunction } from "react-router";
import type { Route } from "./+types/new-page";

// Metadata 설정부
export const meta: MetaFunction = () => {
  return [
    { title: "카테고리 설정" },
    { name: "description", content: "카테고리 설정 페이지" },
  ];
};

// 폼 설정부
export const formSchema = z.object({
  name: z
    .string()
    .min(CONTENT_CONSTRAINTS.name.min)
    .max(CONTENT_CONSTRAINTS.name.max),
  description: z
    .string()
    .min(CONTENT_CONSTRAINTS.description.min)
    .max(CONTENT_CONSTRAINTS.description.max),
  type: z.enum(
    CATEGORY_TYPES.map((type) => type.value) as [string, ...string[]]
  ),
  isActive: z.boolean().default(true),
});

// 데이터 로딩부
export const loader = async ({ request }: Route.LoaderArgs) => {};

// 액션 설정부

// 페이지 랜더링부
export default function NewPage() {
  return (
    <div>
      <h1>Submit Page</h1>
    </div>
  );
}
