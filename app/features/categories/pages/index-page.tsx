"use client";

import * as React from "react";
import type { Route } from "./+types/index-page";

// Hooks
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks";
import type { CategoryWithChildren } from "../queries";

// Loader: 빈 loader (React Router 7 필수)
export const loader = async ({}: Route.LoaderArgs) => {
  return null;
};

// Components
import CategoryTree from "../components/category-tree";
import FormItem from "~/common/components/form-item";
import { Button } from "~/common/components/core/button";
import { Label } from "~/common/components/core/label";
import { Switch } from "~/common/components/core/switch";
import { Skeleton } from "~/common/components/core/skeleton";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "유형관리" },
    { name: "description", content: "Easy Fit 유형 관리" },
  ];
}

export default function IndexPage() {
  // Query & Mutations
  const { data: categories = [], isLoading, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // 상태
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
    additionalAttribute3: "",
    additionalAttribute4: "",
    additionalAttribute5: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );

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
      additionalAttribute3: (category as any).additional_attribute3 || "",
      additionalAttribute4: (category as any).additional_attribute4 || "",
      additionalAttribute5: (category as any).additional_attribute5 || "",
      isActive: category.is_active,
    });
    setFormErrors({});
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
    if (!selectedCategory) {
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
        additionalAttribute3: "",
        additionalAttribute4: "",
        additionalAttribute5: "",
        isActive: true,
      });
      setFormErrors({});
      return;
    }
    setMode("add-sibling");
    setFormData({
      name: "",
      code: "",
      displayOrder: ((selectedCategory as any).display_order || 0) + 1,
      additionalAttribute1: "",
      additionalAttribute2: "",
      additionalAttribute3: "",
      additionalAttribute4: "",
      additionalAttribute5: "",
      isActive: true,
    });
    setFormErrors({});
  };

  // 하위레벨 추가 버튼 클릭
  const handleAddChild = () => {
    if (!selectedCategory) return;
    setMode("add-child");
    setFormData({
      name: "",
      code: "",
      displayOrder: 0,
      additionalAttribute1: "",
      additionalAttribute2: "",
      additionalAttribute3: "",
      additionalAttribute4: "",
      additionalAttribute5: "",
      isActive: true,
    });
    setFormErrors({});
  };

  // 유효성 검사
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = "유형명을 입력해주세요.";
    }
    if (!formData.code || formData.code.trim().length === 0) {
      errors.code = "유형코드를 입력해주세요.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (selectedCategory && mode === "view") {
      // 수정 모드: parent_id를 제외하고 업데이트 (parent_id는 변경하지 않음)
      const updateData: any = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        display_order: formData.displayOrder,
        additional_attribute1: formData.additionalAttribute1 || null,
        additional_attribute2: formData.additionalAttribute2 || null,
        additional_attribute3: formData.additionalAttribute3 || null,
        additional_attribute4: formData.additionalAttribute4 || null,
        additional_attribute5: formData.additionalAttribute5 || null,
        description: "",
        is_active: formData.isActive,
      };

      updateMutation.mutate(
        { id: selectedCategory.id, updates: updateData },
        {
          onSuccess: (updatedCategory) => {
            setFormErrors({});
            // 수정된 항목을 선택 상태로 유지
            const updated: CategoryWithChildren = {
              ...selectedCategory,
              ...updatedCategory,
              children: selectedCategory.children,
              childrenCount: selectedCategory.childrenCount,
            };
            setSelectedCategory(updated);
            setFormData({
              name: updated.name,
              code: (updated as any).code || "",
              displayOrder: (updated as any).display_order ?? 0,
              additionalAttribute1: (updated as any).additional_attribute1 || "",
              additionalAttribute2: (updated as any).additional_attribute2 || "",
              additionalAttribute3: (updated as any).additional_attribute3 || "",
              additionalAttribute4: (updated as any).additional_attribute4 || "",
              additionalAttribute5: (updated as any).additional_attribute5 || "",
              isActive: updated.is_active,
            });
          },
          onError: (error) => {
            setFormErrors({
              general: error.message || "저장 중 오류가 발생했습니다.",
            });
          },
        }
      );
    } else {
      // 생성 모드: parent_id를 포함하여 생성
      const categoryData: any = {
        parent_id:
          mode === "add-child" && selectedCategory
            ? selectedCategory.id
            : mode === "add-sibling" && selectedCategory
              ? (selectedCategory as any).parent_id || null
              : null,
        name: formData.name.trim(),
        code: formData.code.trim(),
        display_order: formData.displayOrder,
        additional_attribute1: formData.additionalAttribute1 || null,
        additional_attribute2: formData.additionalAttribute2 || null,
        additional_attribute3: formData.additionalAttribute3 || null,
        additional_attribute4: formData.additionalAttribute4 || null,
        additional_attribute5: formData.additionalAttribute5 || null,
        description: "",
        is_active: formData.isActive,
      };
      // 생성
      createMutation.mutate(categoryData, {
        onSuccess: (newCategory) => {
          setFormErrors({});
          setMode("view");
          // 새로 생성된 항목을 선택 상태로 설정
          const newItem: CategoryWithChildren = {
            ...newCategory,
            children: [],
            childrenCount: 0,
          };
          setSelectedCategory(newItem);
          setFormData({
            name: newCategory.name,
            code: (newCategory as any).code || "",
            displayOrder: (newCategory as any).display_order ?? 0,
            additionalAttribute1: (newCategory as any).additional_attribute1 || "",
            additionalAttribute2: (newCategory as any).additional_attribute2 || "",
            additionalAttribute3: (newCategory as any).additional_attribute3 || "",
            additionalAttribute4: (newCategory as any).additional_attribute4 || "",
            additionalAttribute5: (newCategory as any).additional_attribute5 || "",
            isActive: newCategory.is_active,
          });
          // 하위 항목 추가 시 부모 노드 확장하여 새 항목이 보이도록
          if (categoryData.parent_id) {
            setExpandedIds((prev) => new Set(prev).add(categoryData.parent_id));
          }
        },
        onError: (error) => {
          setFormErrors({
            general: error.message || "저장 중 오류가 발생했습니다.",
          });
        },
      });
    }
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!selectedCategory || mode !== "view") return;
    if (
      !window.confirm(
        "선택한 항목과 하위 항목이 모두 삭제됩니다. 항목을 삭제하시겠습니까?"
      )
    ) {
      return;
    }
    deleteMutation.mutate(selectedCategory.id, {
      onSuccess: () => {
        setFormErrors({});
        setSelectedCategory(null);
        setMode("view");
        setFormData({
          name: "",
          code: "",
          displayOrder: 0,
          additionalAttribute1: "",
          additionalAttribute2: "",
          additionalAttribute3: "",
          additionalAttribute4: "",
          additionalAttribute5: "",
          isActive: true,
        });
      },
      onError: (error) => {
        setFormErrors({
          general: error.message || "삭제 중 오류가 발생했습니다.",
        });
      },
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b">
          <h1 className="title2">유형관리</h1>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[400px] border-r p-4">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b">
          <h1 className="title2">유형관리</h1>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <p className="text-sm text-destructive">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {error.message}
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

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
              + 이 단계에 추가
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddChild}
              disabled={!selectedCategory || mode === "add-child"}
            >
              + 하위 단계 추가
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
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              {/* 필수 입력 안내 */}
              <p className="text-sm text-destructive">
                * 표시는 필수입력 사항입니다.
              </p>

              {/* 유형명 */}
              <FormItem
                label="유형명"
                id="name"
                required
                type="text"
                inputProps={{
                  value: formData.name,
                  onChange: (e) =>
                    setFormData({ ...formData, name: e.target.value }),
                }}
                error={formErrors.name}
              />

              {/* 유형코드 */}
              <FormItem
                label="유형코드"
                id="code"
                required
                type="text"
                inputProps={{
                  value: formData.code,
                  onChange: (e) =>
                    setFormData({ ...formData, code: e.target.value }),
                }}
                error={formErrors.code}
              />

              {/* 표시순서 */}
              <FormItem
                label="표시순서"
                id="displayOrder"
                type="number"
                inputProps={{
                  type: "number",
                  value: formData.displayOrder,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      displayOrder: Number(e.target.value) || 0,
                    }),
                }}
                error={formErrors.displayOrder}
              />

              {/* 부가속성1 */}
              <FormItem
                label="부가속성1"
                id="additionalAttribute1"
                type="text"
                inputProps={{
                  value: formData.additionalAttribute1,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute1: e.target.value,
                    }),
                }}
                error={formErrors.additionalAttribute1}
              />

              {/* 부가속성2 */}
              <FormItem
                label="부가속성2"
                id="additionalAttribute2"
                type="text"
                inputProps={{
                  value: formData.additionalAttribute2,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute2: e.target.value,
                    }),
                }}
                error={formErrors.additionalAttribute2}
              />

              {/* 부가속성3 */}
              <FormItem
                label="부가속성3"
                id="additionalAttribute3"
                type="text"
                inputProps={{
                  value: formData.additionalAttribute3,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute3: e.target.value,
                    }),
                }}
                error={formErrors.additionalAttribute3}
              />

              {/* 부가속성4 */}
              <FormItem
                label="부가속성4"
                id="additionalAttribute4"
                type="text"
                inputProps={{
                  value: formData.additionalAttribute4,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute4: e.target.value,
                    }),
                }}
                error={formErrors.additionalAttribute4}
              />

              {/* 부가속성5 */}
              <FormItem
                label="부가속성5"
                id="additionalAttribute5"
                type="text"
                inputProps={{
                  value: formData.additionalAttribute5,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      additionalAttribute5: e.target.value,
                    }),
                }}
                error={formErrors.additionalAttribute5}
              />

              {/* 사용여부 */}
              <div className="space-y-2">
                <Label htmlFor="isActive">사용여부</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
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
              </div>

              {/* 구분선 */}
              <hr className="border-border" />

              {/* 일반 에러 메시지 */}
              {formErrors.general && (
                <p className="text-sm text-destructive" role="alert">
                  {formErrors.general}
                </p>
              )}

              {/* 버튼 그룹: 저장(좌) / 삭제(우) */}
              <div className="flex justify-between items-center">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "저장"}
                </Button>
                {mode === "view" && selectedCategory && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={handleDelete}
                  >
                    {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              관리할 유형을 선택하거나 새로운 유형을 등록해 보세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
