"use client";

import { useState, useEffect } from "react";
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router";
import { z } from "zod";
import type { Route } from "./+types/update-profile-page";
import { makeSSRClient, browserClient } from "~/supa-client";
import { Button } from "~/common/components/core/button";
import { Progress } from "~/common/components/core/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/common/components/core/dialog";
import FormItem from "~/common/components/form-item";

// Metadata 설정부
export const meta = () => {
  return [
    { title: "프로필 업데이트" },
    { name: "description", content: "프로필 업데이트 페이지" },
  ];
};

// Loader: 프로필이 이미 완전히 입력되어 있으면 홈으로 리디렉션
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // 프로필 확인
  const { data: profile, error } = await client
    .from("profiles")
    .select("nickname, gender, birth_year, height, weight")
    .eq("id", user.id)
    .maybeSingle();

  // 프로필이 완전히 입력되어 있으면 홈으로 리디렉션
  if (
    !error &&
    profile &&
    profile.nickname &&
    profile.gender &&
    profile.birth_year &&
    profile.height &&
    profile.weight
  ) {
    return redirect("/");
  }

  return null;
};

// 폼 스키마
export const formSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  gender: z.boolean(),
  birth_year: z
    .string()
    .min(1, "생년을 입력해주세요")
    .refine(
      (val) => {
        const year = parseInt(val, 10);
        const currentYear = new Date().getFullYear();
        return year >= 1900 && year <= currentYear;
      },
      { message: "올바른 생년을 입력해주세요 (1900-현재년도)" }
    ),
  height: z
    .string()
    .min(1, "키를 입력해주세요")
    .refine(
      (val) => {
        const height = parseInt(val, 10);
        return !isNaN(height) && height > 0 && height <= 300;
      },
      { message: "올바른 키를 입력해주세요 (1-300cm, 정수만 가능)" }
    ),
  weight: z
    .string()
    .min(1, "체중을 입력해주세요")
    .refine(
      (val) => {
        const weight = parseInt(val, 10);
        return !isNaN(weight) && weight > 0 && weight <= 500;
      },
      { message: "올바른 체중을 입력해주세요 (1-500kg, 정수만 가능)" }
    ),
});

// 액션 설정부
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const {
    success,
    data: parsedData,
    error: formError,
  } = formSchema.safeParse({
    nickname: formData.get("nickname"),
    gender: formData.get("gender") === "true",
    birth_year: formData.get("birth_year"),
    height: formData.get("height"),
    weight: formData.get("weight"),
  });

  if (!success) {
    return {
      formErrors: formError.flatten().fieldErrors,
      joinError: null,
    };
  }

  const { nickname, gender, birth_year, height, weight } = parsedData;
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      formErrors: null,
      joinError: null,
      saved: false,
    };
  }

  // 구글 로그인 정보에서 이메일 가져오기
  const email = user.email || user.user_metadata?.email;
  if (!email) {
    return {
      error: "이메일 정보를 가져올 수 없습니다.",
      formErrors: null,
      joinError: null,
      saved: false,
    };
  }

  // 성별을 문자열로 변환 (true -> 'male', false -> 'female')
  const genderString: "male" | "female" = gender ? "male" : "female";

  // 프로필 존재 여부 확인
  const { data: existingProfile } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const profileData = {
    id: user.id,
    email,
    nickname,
    gender: genderString,
    birth_year: parseInt(birth_year, 10),
    height: parseInt(height, 10),
    weight: parseInt(weight, 10),
    updated_at: new Date().toISOString(),
  };

  let data;
  let error;

  if (existingProfile) {
    // 프로필이 있으면 update
    const result = await client
      .from("profiles")
      .update(profileData)
      .eq("id", user.id)
      .select();
    data = result.data;
    error = result.error;
  } else {
    // 프로필이 없으면 insert
    const result = await client
      .from("profiles")
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
      })
      .select();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error("Profile save error:", error);
    return {
      error:
        error.message ||
        "정보가 정상적으로 저장되지 않았습니다. 다시 시도해주세요.",
      formErrors: null,
      joinError: null,
      saved: false,
    };
  }

  // 데이터가 실제로 저장되었는지 확인
  if (!data || data.length === 0) {
    return {
      error: "정보가 정상적으로 저장되지 않았습니다. 다시 시도해주세요.",
      formErrors: null,
      joinError: null,
      saved: false,
    };
  }

  return redirect("/", { headers });
};

// 페이지 렌더링부
export default function UpdateProfilePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [gender, setGender] = useState(false);
  const [formValues, setFormValues] = useState({
    nickname: "",
    birth_year: "",
    height: "",
    weight: "",
  });

  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    if (actionData?.formErrors) {
      setFormErrors(actionData.formErrors);
    }
  }, [actionData]);

  useEffect(() => {
    // 저장 실패 시 alert 표시
    if (
      navigation.state === "idle" &&
      actionData?.error &&
      actionData.saved === false
    ) {
      alert("정보가 정상적으로 저장되지 않았습니다. 다시 시도해주세요.");
    }
  }, [navigation.state, actionData]);

  useEffect(() => {
    // 성공적으로 리디렉트되면 다이얼로그 표시
    if (
      navigation.state === "idle" &&
      actionData &&
      !actionData.error &&
      !actionData.formErrors &&
      actionData.saved !== false
    ) {
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        navigate("/");
      }, 2000);
    }
  }, [navigation.state, actionData, navigate]);

  // 폼 값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <h1 className="title1 mb-8">프로필 정보 수정</h1>

      {isSubmitting && (
        <div className="mb-4">
          <Progress value={undefined} className="h-1" />
          <p className="text-sm text-muted-foreground mt-2">
            정보를 저장하는 중...
          </p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <FormItem
          label="닉네임"
          id="nickname"
          type="text"
          required
          tooltip="사용할 닉네임을 입력해주세요"
          error={formErrors.nickname?.[0]}
          inputProps={{
            name: "nickname",
            placeholder: "닉네임을 입력하세요",
            value: formValues.nickname,
            onChange: handleInputChange,
          }}
        />

        <div className="space-y-2">
          <FormItem
            label="성별"
            id="gender"
            type="switch"
            required
            tooltip="성별을 선택해주세요"
            switchLabel={{ checked: "남성", unchecked: "여성" }}
            switchProps={{
              checked: gender,
              onCheckedChange: setGender,
              id: "gender-switch",
            }}
          />
          {/* Switch 값을 폼에 포함하기 위한 hidden input */}
          <input type="hidden" name="gender" value={String(gender)} />
        </div>

        <FormItem
          label="생년"
          id="birth_year"
          type="number"
          required
          tooltip="생년 4자리를 입력해주세요 (예: 1990)"
          error={formErrors.birth_year?.[0]}
          inputProps={{
            name: "birth_year",
            placeholder: "1990",
            min: 1900,
            max: new Date().getFullYear(),
            value: formValues.birth_year,
            onChange: handleInputChange,
          }}
        />

        <FormItem
          label="키 (cm)"
          id="height"
          type="number"
          required
          tooltip="키를 cm 단위로 입력해주세요"
          error={formErrors.height?.[0]}
          inputProps={{
            name: "height",
            placeholder: "175",
            min: 1,
            max: 300,
            step: 1,
            value: formValues.height,
            onChange: handleInputChange,
          }}
        />

        <FormItem
          label="체중 (kg)"
          id="weight"
          type="number"
          required
          tooltip="체중을 kg 단위로 입력해주세요"
          error={formErrors.weight?.[0]}
          inputProps={{
            name: "weight",
            placeholder: "70",
            min: 1,
            max: 500,
            step: 1,
            value: formValues.weight,
            onChange: handleInputChange,
          }}
        />

        {actionData?.error && (
          <div className="text-sm text-destructive" role="alert">
            {actionData.error}
          </div>
        )}

        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || isLoading}
          className="w-full"
        >
          {isSubmitting ? "처리 중..." : "정보수정"}
        </Button>
      </Form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정보가 잘 수정되었습니다</DialogTitle>
            <DialogDescription>홈 화면으로 이동합니다.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
