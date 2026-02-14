"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "~/common/components/core/badge";
import { cn } from "~/lib/utils";
import type { CategoryWithChildren } from "../queries";

interface CategoryTreeProps {
  categories: CategoryWithChildren[];
  selectedId?: number | null;
  onSelect: (category: CategoryWithChildren) => void;
  expandedIds?: Set<number>;
  onToggleExpand?: (id: number) => void;
  level?: number;
}

export default function CategoryTree({
  categories,
  selectedId,
  onSelect,
  expandedIds = new Set(),
  onToggleExpand,
  level = 0,
}: CategoryTreeProps) {
  const handleToggle = (
    e: React.MouseEvent,
    category: CategoryWithChildren
  ) => {
    e.stopPropagation();
    if (onToggleExpand && (category.children?.length || 0) > 0) {
      onToggleExpand(category.id);
    }
  };

  const handleSelect = (category: CategoryWithChildren) => {
    onSelect(category);
  };

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isExpanded = expandedIds.has(category.id);
        const isSelected = selectedId === category.id;
        const hasChildren = (category.children?.length || 0) > 0;
        const childrenCount = category.childrenCount || 0;

        return (
          <div key={category.id}>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 text-primary font-medium",
                level > 0 && "pl-6"
              )}
              style={{ paddingLeft: `${12 + level * 20}px` }}
              onClick={() => handleSelect(category)}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded transition-colors",
                  "hover:bg-muted",
                  !hasChildren && "invisible"
                )}
                onClick={(e) => handleToggle(e, category)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <span className="flex-1 truncate">
                [{category.id}] {category.name}
              </span>
              {childrenCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {childrenCount}
                </Badge>
              )}
            </div>
            {hasChildren && isExpanded && (
              <CategoryTree
                categories={category.children || []}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
