"use client";

import * as React from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import type { Route } from "./+types/detail-page";
import { makeSSRClient } from "~/supa-client";
import {
  createExercise,
  deleteExercise,
  getExerciseById,
  updateExercise,
} from "../queries";
import InputControl from "~/common/components/input-control";
import { Button } from "~/common/components/core/button";
import { Progress } from "~/common/components/core/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/core/select";
import { EXERCISE_TYPE_OPTIONS, MECHANIC_TYPE_OPTIONS } from "../constants";

const DEFAULT_GUIDES = [""];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);

  if (!params.id || params.id === "new") {
    return { exercise: null };
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return { exercise: null };
  }

  const exercise = await getExerciseById(client, id);
  return { exercise };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  const intent = (formData.get("intent") as string) || "create";
  const idValue = formData.get("id");
  const id = idValue ? Number(idValue) : null;

  if (intent === "delete" && id) {
    await deleteExercise(client, id);
    return redirect("/exercises");
  }

  const exerciseType = (formData.get("exerciseType") as string) || "";
  const mechanicType = (formData.get("mechanicType") as string) || "";
  const name = (formData.get("name") as string) || "";
  const description = (formData.get("description") as string) || "";
  const quickGuides = formData
    .getAll("quickGuide")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  const videoLink = (formData.get("videoLink") as string) || "";

  const errors: Record<string, string> = {};
  if (!exerciseType) {
    errors.exerciseType = "운동부위를 선택해주세요.";
  }
  if (!mechanicType) {
    errors.mechanicType = "운동유형을 선택해주세요.";
  }
  if (!name || name.trim().length === 0) {
    errors.name = "운동명을 입력해주세요.";
  } else if (name.trim().length > 50) {
    errors.name = "운동명은 50자 이내로 입력해주세요.";
  }
  if (!description || description.trim().length === 0) {
    errors.description = "운동설명을 입력해주세요.";
  } else if (description.trim().length > 200) {
    errors.description = "운동설명은 200자 이내로 입력해주세요.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const payload = {
    exercise_type: exerciseType,
    mechanic_type: mechanicType,
    name: name.trim(),
    description: description.trim(),
    quick_guide: quickGuides.length > 0 ? quickGuides : null,
    video_link: videoLink.trim() || null,
  };

  try {
    if (id && intent === "update") {
      await updateExercise(client, id, payload);
    } else {
      await createExercise(client, payload);
    }
    return redirect("/exercises");
  } catch (error) {
    console.error("운동 저장 실패:", error);
    return {
      success: false,
      errors: { general: "저장 중 오류가 발생했습니다." },
    };
  }
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "운동상세정보" },
    { name: "description", content: "Easy Fit 운동상세정보 관리" },
  ];
}

export default function DetailPage({ loaderData }: Route.ComponentProps) {
  const { exercise } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const isNew = !exercise;
  const isSubmitting = navigation.state === "submitting";

  const [exerciseType, setExerciseType] = React.useState(
    exercise?.exercise_type ?? ""
  );
  const [mechanicType, setMechanicType] = React.useState(
    exercise?.mechanic_type ?? ""
  );
  const [name, setName] = React.useState(exercise?.name ?? "");
  const [description, setDescription] = React.useState(
    exercise?.description ?? ""
  );
  const [quickGuides, setQuickGuides] = React.useState<string[]>(
    exercise?.quick_guide?.length ? exercise.quick_guide : DEFAULT_GUIDES
  );
  const [videoLink, setVideoLink] = React.useState(
    exercise?.video_link ?? ""
  );

  React.useEffect(() => {
    if (exercise) {
      setExerciseType(exercise.exercise_type);
      setMechanicType(exercise.mechanic_type);
      setName(exercise.name);
      setDescription(exercise.description);
      setQuickGuides(
        exercise.quick_guide?.length ? exercise.quick_guide : DEFAULT_GUIDES
      );
      setVideoLink(exercise.video_link ?? "");
    }
  }, [exercise]);

  const handleAddGuide = () => {
    setQuickGuides((prev) => [...prev, ""]);
  };

  const handleRemoveGuide = (index: number) => {
    setQuickGuides((prev) =>
      prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)
    );
  };

  const handleGuideChange = (index: number, value: string) => {
    setQuickGuides((prev) =>
      prev.map((item, idx) => (idx === index ? value : item))
    );
  };

  const handleDelete = () => {
    if (!exercise) return;
    const shouldDelete = window.confirm(
      "운동을 삭제하면 관련된 사용자의 운동플랜에서 모두 삭제되므로 주의해야 합니다. 삭제하시겠습니까?"
    );
    if (!shouldDelete) return;

    const deleteData = new FormData();
    deleteData.set("intent", "delete");
    deleteData.set("id", String(exercise.id));
    submit(deleteData, { method: "post" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="title4">운동상세정보</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          운동상세정보를 관리하세요.
        </p>
      </div>

      <Form method="post" className="space-y-6">
        {isSubmitting && <Progress value={70} />}

        {!isNew && <input type="hidden" name="id" value={exercise?.id} />}
        <input type="hidden" name="intent" value={isNew ? "create" : "update"} />

        <InputControl
          label="운동부위"
          id="exerciseType"
          required
          error={actionData?.errors?.exerciseType}
        >
          <div className="space-y-2">
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="운동부위를 선택하세요" />
              </SelectTrigger>
              <SelectContent align="start">
                {EXERCISE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="exerciseType" value={exerciseType} />
          </div>
        </InputControl>

        <InputControl
          label="운동유형"
          id="mechanicType"
          required
          error={actionData?.errors?.mechanicType}
        >
          <div className="space-y-2">
            <Select value={mechanicType} onValueChange={setMechanicType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="운동유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent align="start">
                {MECHANIC_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="mechanicType" value={mechanicType} />
          </div>
        </InputControl>

        <InputControl
          label="운동명"
          id="name"
          required
          type="text"
          inputProps={{
            name: "name",
            value: name,
            maxLength: 50,
            onChange: (event) => setName(event.target.value),
          }}
          error={actionData?.errors?.name}
        />

        <InputControl
          label="운동설명"
          id="description"
          required
          type="textarea"
          textareaProps={{
            name: "description",
            value: description,
            maxLength: 200,
            onChange: (event) => setDescription(event.target.value),
          }}
          error={actionData?.errors?.description}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">퀵가이드</p>
            <Button type="button" variant="outline" size="sm" onClick={handleAddGuide}>
              + 가이드 추가
            </Button>
          </div>
          <div className="space-y-3">
            {quickGuides.map((guide, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1">
                  <InputControl
                    label={`퀵가이드 ${index + 1}`}
                    id={`quickGuide-${index}`}
                    type="text"
                    inputProps={{
                      name: "quickGuide",
                      value: guide,
                      onChange: (event) =>
                        handleGuideChange(index, event.target.value),
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveGuide(index)}
                  disabled={quickGuides.length === 1}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>

        <InputControl
          label="동영상링크"
          id="videoLink"
          type="text"
          inputProps={{
            name: "videoLink",
            value: videoLink,
            onChange: (event) => setVideoLink(event.target.value),
          }}
        />

        {actionData?.errors?.general && (
          <p className="text-sm text-destructive" role="alert">
            {actionData.errors.general}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!isNew && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              삭제
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!isNew && (
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isSubmitting}
              >
                <Link to="/exercises">목록</Link>
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isNew ? "추가" : "업데이트"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
