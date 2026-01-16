import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { getExercises, type ExerciseListParams } from "../queries";
import { exercisesKeys } from "../constants";

/**
 * 운동 목록 조회 Hook
 *
 * @param params - 필터, 정렬, 페이지네이션 파라미터
 * @returns TanStack Query의 useQuery 결과
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useExercises({
 *   page: 1,
 *   pageSize: 20,
 *   exerciseType: 'upper_body',
 *   searchName: '벤치',
 *   sort: 'created_desc'
 * })
 *
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 *
 * return (
 *   <div>
 *     {data.items.map(exercise => (
 *       <ExerciseItem key={exercise.id} exercise={exercise} />
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useExercises = (params: ExerciseListParams) => {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: exercisesKeys.list(params),
    queryFn: () => getExercises(client, params),
    staleTime: 1000 * 60 * 5, // 5분
  });
};
