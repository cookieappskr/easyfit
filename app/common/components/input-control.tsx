import * as React from "react";
import { Label } from "~/common/components/core/label";
import { Input } from "~/common/components/core/input";
import { Switch } from "~/common/components/core/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/common/components/core/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface InputControlProps {
  /**
   * 레이블 텍스트
   */
  label: string;
  /**
   * 입력 필드 ID
   */
  id: string;
  /**
   * 입력 가이드 툴팁 메시지
   */
  tooltip?: string;
  /**
   * 에러 메시지
   */
  error?: string;
  /**
   * 필수 여부
   */
  required?: boolean;
  /**
   * 입력 타입 (text, number, switch)
   */
  type?: "text" | "number" | "switch";
  /**
   * Input props
   */
  inputProps?: React.ComponentProps<typeof Input>;
  /**
   * Switch props (type이 switch일 때)
   */
  switchProps?: React.ComponentProps<typeof Switch>;
  /**
   * Switch 레이블 (type이 switch일 때)
   */
  switchLabel?: { checked: string; unchecked: string };
}

/**
 * 입력 컨트롤 컴포넌트
 *
 * 레이블, 입력 가이드 툴팁 버튼, 입력 항목, 에러 메시지 표시부로 구성
 */
export default function InputControl({
  label,
  id,
  tooltip,
  error,
  required = false,
  type = "text",
  inputProps,
  switchProps,
  switchLabel,
}: InputControlProps) {
  const isSwitch = type === "switch";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor={id}
          className={cn(
            required &&
              "after:content-['*'] after:ml-0.5 after:text-destructive"
          )}
        >
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isSwitch ? (
        <div className="flex items-center gap-3">
          <Switch id={id} {...switchProps} />
          {switchLabel && (
            <Label
              htmlFor={id}
              className="font-normal text-sm text-muted-foreground"
            >
              {switchProps?.checked
                ? switchLabel.checked
                : switchLabel.unchecked}
            </Label>
          )}
        </div>
      ) : (
        <Input
          id={id}
          type={type}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
