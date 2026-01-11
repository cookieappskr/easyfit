// Imports
import { Form, redirect, type MetaFunction } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/update-profile-page";
import { makeSSRClient } from "~/supa-client";
import { Input } from "~/common/components/core/input";
import { Button } from "~/common/components/core/button";
import { Label } from "~/common/components/core/label";

// Metadata 설정부
export const meta: MetaFunction = () => {
  return [
    { title: "프로필 업데이트" },
    { name: "description", content: "프로필 업데이트 페이지" },
  ];
};

// 폼 설정부
export const formSchema = z.object({
  nickname: z.string().min(1),
  email: z.string().email(),
});

// 액션 설정부
export const action = async ({ request }: Route.ActionArgs) => {
  //   폼데이터 확인부
  const formData = await request.formData();
  const {
    success,
    data: parsedData,
    error: formError,
  } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { formErrors: formError.flatten().fieldErrors, joinError: null };
  }
  const { nickname, email } = parsedData;
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }
  const { data, error } = await client
    .from("profiles")
    .update({ nickname, email })
    .eq("id", user.id);
  if (error) {
    return { error: error.message };
  }
  return redirect("/", { headers });
};

// 페이지 랜더링부
export default function UpdateProfilePage() {
  return (
    <div>
      <h1>프로필 업데이트 페이지</h1>
      <Form method="post">
        <Label htmlFor="nickname">닉네임</Label>
        <Input type="text" name="nickname" />
        <Label htmlFor="email">이메일</Label>
        <Input type="email" name="email" />
        <Button type="submit">프로필 업데이트</Button>
      </Form>
    </div>
  );
}
