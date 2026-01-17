import { Link } from "react-router";
import { Switch } from "~/common/components/core/switch";
import type { WorkoutPlanPrompt } from "../queries";
import { cn } from "~/lib/utils";

interface PromptListItemProps {
  prompt: WorkoutPlanPrompt;
  index: number;
  isLast?: boolean;
  onToggleActive: (id: number) => void;
}

export default function PromptListItem({
  prompt,
  index,
  isLast = false,
  onToggleActive,
}: PromptListItemProps) {
  const formattedDate = new Date(prompt.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // 기본 프롬프트 앞 50글자
  const truncatedPrompt =
    prompt.base_prompt.length > 50
      ? prompt.base_prompt.substring(0, 50) + "..."
      : prompt.base_prompt;

  return (
    <div
      className={cn(
        "grid grid-cols-[80px_200px_150px_1fr_120px_100px] items-center gap-4 px-4 py-3 text-sm transition-colors",
        "hover:bg-muted/40",
        !isLast && "border-b"
      )}
    >
      {/* NO */}
      <span className="text-muted-foreground">{index}</span>

      {/* 제목 */}
      <Link
        to={`/plans/${prompt.id}`}
        className="truncate font-medium hover:text-primary hover:underline"
      >
        {prompt.title}
      </Link>

      {/* LLM 모델 */}
      <span className="truncate text-muted-foreground">
        {prompt.llm_model_code}
      </span>

      {/* 기본프롬프트 (앞 50글자) */}
      <span className="truncate text-muted-foreground">{truncatedPrompt}</span>

      {/* 등록일 */}
      <span className="text-muted-foreground">{formattedDate}</span>

      {/* 활성화 토글 */}
      <div className="flex justify-center">
        <Switch
          checked={prompt.is_active}
          onCheckedChange={() => onToggleActive(prompt.id)}
        />
      </div>
    </div>
  );
}
