import type { PromptsListParams } from "./queries";

export interface SelectOption {
  value: string;
  label: string;
}

// 정렬 옵션
export const SORT_OPTIONS: SelectOption[] = [
  { value: "created_desc", label: "최근등록순" },
  { value: "created_asc", label: "오래된등록순" },
  { value: "title_asc", label: "가나다순" },
];

/**
 * TanStack Query Keys for Workout Plan Prompts
 */
export const promptsKeys = {
  all: ["workout-plan-prompts"] as const,
  lists: () => [...promptsKeys.all, "list"] as const,
  list: (params: PromptsListParams) =>
    [...promptsKeys.lists(), params] as const,
  details: () => [...promptsKeys.all, "detail"] as const,
  detail: (id: number) => [...promptsKeys.details(), id] as const,
  active: () => [...promptsKeys.all, "active"] as const,
};

// 기본 프롬프트 템플릿
export const DEFAULT_BASE_PROMPT = `운동계획을 수립하고 있습니다. 
당신은 뛰어난 운동생리학자이자 트레이너로서 중년 또는 운동초보를 위한 점진적 운동부하 계획을 제안해 주십시오. 
- 현실적이며 실질적인 계획이어야 함 
- 주차별 부하증가율은 시스템 변수로 사용되어야 하므로 구간이 아닌 정확한 하나의 값으로 제안필요 
- 안전하게 운동할 수 있어야 함`;

// 출력 형식 템플릿
export const DEFAULT_OUTPUT_FORMAT = `운동별 주차별 부하증가율, 식단을 json형태 (아래 예 참고)로 제안해주세요. 

{
  workout_plan : [
    {
      name : "랫풀다운", 
      weeks : 55, 
      plan : [
        {
          point : "워밍업 주간",
          start_week : 1,
          end_week : 10,
          increase_rate : 3,
          caution : "무리한 증량 금지"
        }, 
        {
          point : "본격적인 근성장 주간", 
          start_week : 11,
          end_week : 30,
          increase_rate : 5
        }
      ]
    }
  ], 
  nutrition_plan : {
    plan : "Smart Lean Bulk", 
    description : "단순히 많이 먹는 것이 아니라, 근육 합성 효율을 극대화하는 식단 전략",
    daily_calory : "2,200 ~ 2,300 kcal",
    ratios : "(탄:단:지): 5 : 2.5 : 2.5 (근성장과 호르몬 안정을 고려한 배분)",
    meals : [
      {
        name : "아침",
        point : "에너지충전",
        time : "운동 직후 8시", 
        menu : "현미밥 2/3공기 + 달걀후라이 2개 + 두부부침 + 저염나물류",
        tip : "기상 후 단백질 공급은 근손실 방지에 매우 중요합니다."
      }
    ]
  }
}`;
