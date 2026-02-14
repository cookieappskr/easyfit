import type { SupabaseClient } from "@supabase/supabase-js";
import { type Database } from "~/supa-client";

// Database 타입이 업데이트되지 않았을 수 있으므로 확장 타입 정의
export type Category = Database["public"]["Tables"]["categories"]["Row"] & {
  code?: string;
  display_order?: number;
  value?: string | null;
  description?: string | null;
  additional_attribute1?: string | null;
  additional_attribute2?: string | null;
  additional_attribute3?: string | null;
  parent_id?: number | null;
};

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
  childrenCount?: number;
};

/**
 * 모든 카테고리 조회 (트리 구조로 변환)
 */
export const getAllCategories = async (
  client: SupabaseClient<Database>
): Promise<CategoryWithChildren[]> => {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  // 트리 구조로 변환
  const categoryMap = new Map<number, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // 모든 카테고리를 맵에 추가
  data.forEach((category) => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      childrenCount: 0,
    });
  });

  // 부모-자식 관계 설정
  data.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(categoryWithChildren);
        parent.childrenCount = (parent.childrenCount || 0) + 1;
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  return rootCategories;
};

/**
 * 카테고리 ID로 조회
 */
export const getCategoryById = async (
  client: SupabaseClient<Database>,
  id: number
): Promise<Category | null> => {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * 카테고리 생성
 */
export const createCategory = async (
  client: SupabaseClient<Database>,
  category: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<Category> => {
  const { data, error } = await client
    .from("categories")
    .insert({
      ...category,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * 선택한 항목 및 모든 하위 항목의 ID 수집 (삭제 순서: 리프 노드 우선)
 */
const collectSubtreeIdsForDeletion = (
  allCategories: { id: number; parent_id: number | null }[],
  rootId: number
): number[] => {
  const idToParent = new Map(
    allCategories.map((c) => [c.id, c.parent_id] as [number, number | null])
  );
  const idsToDelete: number[] = [];
  const collect = (id: number) => {
    idsToDelete.push(id);
    allCategories
      .filter((c) => c.parent_id === id)
      .forEach((c) => collect(c.id));
  };
  collect(rootId);
  // 자식 → 부모 순으로 삭제 (역순)
  return idsToDelete.reverse();
};

/**
 * 카테고리 및 모든 하위 항목 삭제
 */
export const deleteCategoryWithDescendants = async (
  client: SupabaseClient<Database>,
  categoryId: number
): Promise<void> => {
  const { data: allData } = await client
    .from("categories")
    .select("id, parent_id");

  if (!allData) {
    throw new Error("카테고리 목록을 불러올 수 없습니다.");
  }

  const idsToDelete = collectSubtreeIdsForDeletion(allData, categoryId);

  for (const id of idsToDelete) {
    const { error } = await client.from("categories").delete().eq("id", id);

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
};

/**
 * 카테고리 수정
 */
export const updateCategory = async (
  client: SupabaseClient<Database>,
  id: number,
  updates: Partial<Omit<Category, "id" | "created_at" | "updated_at">>
): Promise<Category> => {
  const { data, error } = await client
    .from("categories")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};
