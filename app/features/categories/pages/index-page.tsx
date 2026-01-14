"use client";

import * as React from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/index-page";
import { makeSSRClient } from "~/supa-client";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  type CategoryWithChildren,
} from "../queries";
import CategoryTree from "../components/category-tree";
import InputControl from "~/common/components/input-control";
import { Button } from "~/common/components/core/button";
import { Label } from "~/common/components/core/label";
import { Input } from "~/common/components/core/input";
import { Switch } from "~/common/components/core/switch";
import { cn } from "~/lib/utils";

// Loader: 카테고리 목록 조회
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const categories = await getAllCategories(client);
  return { categories };
};

// Action: 카테고리 생성/수정
export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  const intent = formData.get("intent") as string;
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const parentId = formData.get("parentId")
    ? Number(formData.get("parentId"))
    : null;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const displayOrder = formData.get("displayOrder")
    ? Number(formData.get("displayOrder"))
    : 0;
  const additionalAttribute1 = formData.get("additionalAttribute1") as string;
  const additionalAttribute2 = formData.get("additionalAttribute2") as string;
  const isActiveValue = formData.get("isActive");
  const isActive =
    isActiveValue === null || isActiveValue === undefined
      ? true
      : isActiveValue === "true";

  // 유효성 검사
  const errors: Record<string, string> = {};
  if (!name || name.trim().length === 0) {
    errors.name = "유형명을 입력해주세요.";
  }
  if (!code || code.trim().length === 0) {
    errors.code = "유형코드를 입력해주세요.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  try {
    const categoryData: any = {
      parent_id: parentId,
      name: name.trim(),
      code: code.trim(),
      display_order: displayOrder,
      additional_attribute1: additionalAttribute1 || null,
      additional_attribute2: additionalAttribute2 || null,
      description: "", // 선택사항
      is_active: isActive,
    };

    if (id && intent === "update") {
      // 수정
      await updateCategory(client, id, categoryData);
    } else {
      // 생성
      await createCategory(client, categoryData);
    }

    return { success: true, errors: {} };
  } catch (error) {
    console.error("카테고리 저장 실패:", error);
    return {
      success: false,
      errors: { general: "저장 중 오류가 발생했습니다." },
    };
  }
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "유형관리" },
    { name: "description", content: "Easy Fit 유형 관리" },
  ];
}

export default function IndexPage({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] =
    React.useState<CategoryWithChildren | null>(null);
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());
  const [mode, setMode] = React.useState<"view" | "add-sibling" | "add-child">(
    "view"
  );
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    displayOrder: 0,
    additionalAttribute1: "",
    additionalAttribute2: "",
    isActive: true,
  });

  const isSubmitting = navigation.state === "submitting";

  // 카테고리 선택 핸들러
  const handleSelectCategory = (category: CategoryWithChildren) => {
    setSelectedCategory(category);
    setMode("view");
    setFormData({
      name: category.name,
      code: (category as any).code || "",
      displayOrder: (category as any).display_order || 0,
      additionalAttribute1: (category as any).additional_attribute1 || "",
      additionalAttribute2: (category as any).additional_attribute2 || "",
      isActive: category.is_active,
    });
  };

  // 트리 확장/축소 핸들러
  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 동일레벨 추가 버튼 클릭
  const handleAddSibling = () => {
    // selectedCategory가 없으면 루트 레벨에 추가
    if (!selectedCategory) {
      // 기존 루트 노드들의 최대 display_order 찾기
      const maxOrder =
        categories.length > 0
          ? Math.max(
              ...categories.map((cat) => (cat as any).display_order || 0)
            )
          : -1;
      setMode("add-sibling");
      setFormData({
        name: "",
        code: "",
        displayOrder: maxOrder + 1,
        additionalAttribute1: "",
        additionalAttribute2: "",
        isActive: true,
      });
      return;
    }
    setMode("add-sibling");
    setFormData({
      name: "",
      code: "",
      displayOrder: ((selectedCategory as any).display_order || 0) + 1,
      additionalAttribute1: "",
      additionalAttribute2: "",
      isActive: true,
    });
  };

  // 하위레벨 추가 버튼 클릭
  const handleAddChild = () => {
    // selectedCategory가 없으면 동작하지 않음 (하위레벨은 부모가 필요)
    if (!selectedCategory) return;
    setMode("add-child");
    setFormData({
      name: "",
      code: "",
      displayOrder: 0,
      additionalAttribute1: "",
      additionalAttribute2: "",
      isActive: true,
    });
  };

  // 폼 제출 성공 시 처리
  React.useEffect(() => {
    if (actionData?.success) {
      // 페이지 새로고침하여 최신 데이터 로드
      window.location.reload();
    }
  }, [actionData?.success]);

  return (
    <div className="flex flex-col h-full">
      {/* 상단 타이틀 */}
      <div className="px-6 py-4 border-b">
        <h1 className="title2">유형관리</h1>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 트리뷰 섹션 (400px) */}
        <div className="w-[400px] border-r flex flex-col">
          {/* 버튼 그룹 */}
          <div className="p-4 border-b flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSibling}
              disabled={mode === "add-sibling"}
            >
              + 동일레벨
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddChild}
              disabled={!selectedCategory || mode === "add-child"}
            >
              + 하위레벨
            </Button>
          </div>

          {/* 트리뷰 */}
          <div className="flex-1 overflow-y-auto p-2">
            <CategoryTree
              categories={categories}
              selectedId={selectedCategory?.id}
              onSelect={handleSelectCategory}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
            />
          </div>
        </div>

        {/* 우측: 상세정보 섹션 */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedCategory || mode !== "view" ? (
            <Form method="post" className="space-y-6 max-w-2xl">
              <input
                type="hidden"
                name="intent"
                value={mode === "view" ? "update" : "create"}
              />
              {selectedCategory && mode === "view" && (
                <input type="hidden" name="id" value={selectedCategory.id} />
              )}
              {mode === "add-child" && selectedCategory && (
                <input
                  type="hidden"
                  name="parentId"
                  value={selectedCategory.id}
                />
              )}
              {mode === "add-sibling" && (
                <input
                  type="hidden"
                  name="parentId"
                  value={
                    selectedCategory
                      ? (selectedCategory as any).parent_id || ""
                      : ""
                  }
                />
              )}

              {/* 필수 입력 안내 */}
              <p className="text-sm text-destructive">
                * 표시는 필수입력 사항입니다.
              </p>

              {/* 유형명 */}
              <InputControl
                label="유형명"
                id="name"
                required
                type="text"
                inputProps={{
                  name: "name",
                  value: formData.name,
                  onChange: (e) =>
                    setFormData({ ...formData, name: e.target.value }),
                  readOnly:
                    mode === "view" && (selectedCategory as any)?.code
                      ? true
                      : false,
                }}
                error={actionData?.errors?.name}
              />

              {/* 유형코드 */}
              <InputControl
                label="유형코드"
                id="code"
                required
                type="text"
                inputProps={{
                  name: "code",
                  value: formData.code,
                  onChange: (e) =>
                    setFormData({ ...formData, code: e.target.value }),
                  readOnly:
                    mode === "view" && (selectedCategory as any)?.code
                      ? true
                      : false,
                }}
                error={actionData?.errors?.code}
              />

              {/* 표시순서 */}
              <InputControl
                label="표시순서"
                id="displayOrder"
                type="number"
                inputProps={{
                  name: "displayOrder",
                  type: "number",
                  value: formData.displayOrder,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      displayOrder: Number(e.target.value) || 0,
                    }),
                }}
                error={actionData?.errors?.displayOrder}
              />

              {/* 부가속성1 */}
              <InputControl
                label="부가속성1"
                id="additionalAttribute1"
                type="text"
                inputProps={{
                  name: "additionalAttribute1",
                  value: formData.additionalAttribute1,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute1: e.target.value,
                    }),
                }}
                error={actionData?.errors?.additionalAttribute1}
              />

              {/* 부가속성2 */}
              <InputControl
                label="부가속성2"
                id="additionalAttribute2"
                type="text"
                inputProps={{
                  name: "additionalAttribute2",
                  value: formData.additionalAttribute2,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute2: e.target.value,
                    }),
                }}
                error={actionData?.errors?.additionalAttribute2}
              />

              {/* 사용여부 */}
              <div className="space-y-2">
                <Label htmlFor="isActive">사용여부</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className="font-normal text-sm text-muted-foreground"
                  >
                    {formData.isActive ? "Y" : "N"}
                  </Label>
                </div>
                <input
                  type="hidden"
                  name="isActive"
                  value={formData.isActive.toString()}
                />
              </div>

              {/* 일반 에러 메시지 */}
              {actionData?.errors?.general && (
                <p className="text-sm text-destructive" role="alert">
                  {actionData.errors.general}
                </p>
              )}

              {/* 저장 버튼 */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "저장"}
                </Button>
              </div>
            </Form>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              좌측에서 항목을 선택하거나 추가 버튼을 클릭해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
