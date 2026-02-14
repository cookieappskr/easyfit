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
    "view",
  );
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    displayOrder: 0,
    value: "",
    description: "",
    additionalAttribute1: "",
    additionalAttribute2: "",
    additionalAttribute3: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );

  // 트리에서 모든 카테고리를 평탄화하여 반환
  const getAllCategoriesFlat = React.useCallback(
    (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
      const result: CategoryWithChildren[] = [];
      function traverse(c: CategoryWithChildren) {
        result.push(c);
        (c.children || []).forEach(traverse);
      }
      cats.forEach(traverse);
      return result;
    },
    []
  );

  // 유형코드 중복 검사 (blur 시)
  const handleCodeBlur = React.useCallback(() => {
    const code = formData.code.trim();
    if (!code) return;

    const flatCategories = getAllCategoriesFlat(categories);
    const isDuplicate = flatCategories.some((cat) => {
      const existingCode = (cat as any).code?.trim();
      if (!existingCode) return false;
      if (mode === "view" && selectedCategory?.id === cat.id) return false;
      return existingCode.toLowerCase() === code.toLowerCase();
    });

    setFormErrors((prev) => ({
      ...prev,
      code: isDuplicate
        ? "유형코드가 중복됩니다."
        : prev.code === "유형코드가 중복됩니다."
          ? ""
          : prev.code,
    }));
  }, [
    formData.code,
    categories,
    mode,
    selectedCategory?.id,
    getAllCategoriesFlat,
  ]);

  // 저장 버튼 활성화 여부: 필수값 입력 + 중복 없음 + 제출 중 아님
  const isSaveDisabled = React.useMemo(() => {
    if (
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending
    )
      return true;
    if (!formData.name?.trim() || !formData.code?.trim()) return true;
    if (formErrors.code === "유형코드가 중복됩니다.") return true;
    return false;
  }, [
    createMutation.isPending,
    updateMutation.isPending,
    deleteMutation.isPending,
    formData.name,
    formData.code,
    formErrors.code,
  ]);

  // 카테고리 선택 핸들러
  const handleSelectCategory = (category: CategoryWithChildren) => {
    setSelectedCategory(category);
    setMode("view");
    setFormData({
      name: category.name,
      code: (category as any).code || "",
      displayOrder: (category as any).display_order || 0,
      value: (category as any).value || "",
      description: (category as any).description || "",
      additionalAttribute1: (category as any).additional_attribute1 || "",
      additionalAttribute2: (category as any).additional_attribute2 || "",
      additionalAttribute3: (category as any).additional_attribute3 || "",
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
              ...categories.map((cat) => (cat as any).display_order || 0),
            )
          : -1;
      setMode("add-sibling");
      setFormData({
        name: "",
        code: "",
        displayOrder: maxOrder + 1,
        value: "",
        description: "",
        additionalAttribute1: "",
        additionalAttribute2: "",
        additionalAttribute3: "",
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
      value: "",
      description: "",
      additionalAttribute1: "",
      additionalAttribute2: "",
      additionalAttribute3: "",
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
      value: "",
      description: "",
      additionalAttribute1: "",
      additionalAttribute2: "",
      additionalAttribute3: "",
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
    } else {
      const flatCategories = getAllCategoriesFlat(categories);
      const isDuplicate = flatCategories.some((cat) => {
        const existingCode = (cat as any).code?.trim();
        if (!existingCode) return false;
        if (mode === "view" && selectedCategory?.id === cat.id) return false;
        return (
          existingCode.toLowerCase() === formData.code.trim().toLowerCase()
        );
      });
      if (isDuplicate) {
        errors.code = "유형코드가 중복됩니다.";
      }
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
        value: formData.value || null,
        description: formData.description || null,
        additional_attribute1: formData.additionalAttribute1 || null,
        additional_attribute2: formData.additionalAttribute2 || null,
        additional_attribute3: formData.additionalAttribute3 || null,
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
              value: (updated as any).value || "",
              description: (updated as any).description || "",
              additionalAttribute1:
                (updated as any).additional_attribute1 || "",
              additionalAttribute2:
                (updated as any).additional_attribute2 || "",
              additionalAttribute3:
                (updated as any).additional_attribute3 || "",
              isActive: updated.is_active,
            });
          },
          onError: (error) => {
            setFormErrors({
              general: error.message || "저장 중 오류가 발생했습니다.",
            });
          },
        },
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
        value: formData.value || null,
        description: formData.description || null,
        additional_attribute1: formData.additionalAttribute1 || null,
        additional_attribute2: formData.additionalAttribute2 || null,
        additional_attribute3: formData.additionalAttribute3 || null,
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
            value: (newCategory as any).value || "",
            description: (newCategory as any).description || "",
            additionalAttribute1:
              (newCategory as any).additional_attribute1 || "",
            additionalAttribute2:
              (newCategory as any).additional_attribute2 || "",
            additionalAttribute3:
              (newCategory as any).additional_attribute3 || "",
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
        "선택한 항목과 하위 항목이 모두 삭제됩니다. 항목을 삭제하시겠습니까?",
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
          value: "",
          description: "",
          additionalAttribute1: "",
          additionalAttribute2: "",
          additionalAttribute3: "",
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
                  onChange: (e) => {
                    const newCode = e.target.value;
                    setFormData({ ...formData, code: newCode });
                    if (formErrors.code === "유형코드가 중복됩니다.") {
                      setFormErrors((prev) => ({ ...prev, code: "" }));
                    }
                  },
                  onBlur: handleCodeBlur,
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

              {/* value (구 부가속성1) */}
              <FormItem
                label="값"
                id="value"
                type="text"
                inputProps={{
                  value: formData.value,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      value: e.target.value,
                    }),
                }}
                error={formErrors.value}
              />

              {/* description (구 부가속성2) */}
              <FormItem
                label="요약"
                id="description"
                type="text"
                inputProps={{
                  value: formData.description,
                  onChange: (e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    }),
                }}
                error={formErrors.description}
              />

              {/* 부가속성1 (구 부가속성3) */}
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

              {/* 부가속성2 (구 부가속성4) */}
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

              {/* 부가속성3 (구 부가속성5) */}
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
                <Button type="submit" disabled={isSaveDisabled}>
                  {createMutation.isPending || updateMutation.isPending
                    ? "저장 중..."
                    : "저장"}
                </Button>
                {mode === "view" && selectedCategory && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={
                      createMutation.isPending ||
                      updateMutation.isPending ||
                      deleteMutation.isPending
                    }
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
