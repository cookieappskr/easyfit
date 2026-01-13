import type { Route } from "./+types/home";
import { makeSSRClient } from "~/supa-client";
import { DateTime } from "luxon";

// 통계 데이터 로드
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);

  // 현재 회원수
  const { count: totalUsers } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // 어제 가입한 회원수
  const yesterday = DateTime.now()
    .setZone("Asia/Seoul")
    .minus({ days: 1 })
    .startOf("day")
    .toISO();
  const today = DateTime.now().setZone("Asia/Seoul").startOf("day").toISO();

  const { count: yesterdayUsers } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", yesterday!)
    .lt("created_at", today!);

  // 사용자가 선택한 운동수 (임시로 14개 고정, 추후 실제 데이터로 변경 가능)
  const selectedExercises = 14;

  return {
    totalUsers: totalUsers || 0,
    yesterdayUsers: yesterdayUsers || 0,
    selectedExercises,
  };
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "이지핏 어드민 대시보드" },
    { name: "description", content: "Easy Fit Admin Dashboard" },
  ];
}

interface StatCardProps {
  label: string;
  value: number | string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[20pt] text-gray-500">{label}</p>
      <p className="text-[120pt] font-bold text-black leading-none">{value}</p>
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { totalUsers, yesterdayUsers, selectedExercises } = loaderData;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-16 w-full max-w-6xl px-4">
        <h1 className="title1">이지핏 어드민 대시보드</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          <StatCard label="현재 회원수" value={`${totalUsers}명`} />
          <StatCard label="어제 가입한 회원수" value={`${yesterdayUsers}명`} />
          <StatCard
            label="사용자가 선택한 운동수"
            value={`${selectedExercises}개`}
          />
        </div>
      </div>
    </div>
  );
}
