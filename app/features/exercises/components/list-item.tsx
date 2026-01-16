import { Link } from "react-router";
import { Badge } from "~/common/components/core/badge";
import type { Exercise } from "../queries";
import { EXERCISE_TYPE_OPTIONS, MECHANIC_TYPE_OPTIONS } from "../constants";
import { cn } from "~/lib/utils";

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
  isLast?: boolean;
  exerciseTypeOptions?: { value: string; label: string }[];
  mechanicTypeOptions?: { value: string; label: string }[];
}

const getLabel = (value: string, options: { value: string; label: string }[]) =>
  options.find((option) => option.value === value)?.label ?? value;

export default function ExerciseListItem({
  exercise,
  index,
  isLast = false,
  exerciseTypeOptions = EXERCISE_TYPE_OPTIONS,
  mechanicTypeOptions = MECHANIC_TYPE_OPTIONS,
}: ExerciseListItemProps) {
  return (
    <Link
      to={`/exercises/${exercise.id}`}
      className={cn(
        "grid grid-cols-[80px_160px_160px_minmax(160px,1fr)_minmax(240px,2fr)] items-center gap-4 px-4 py-3 text-sm transition-colors",
        "hover:bg-muted/40",
        !isLast && "border-b"
      )}
    >
      <span className="text-muted-foreground">{index}</span>
      <Badge variant="secondary">
        {getLabel(exercise.exercise_type, exerciseTypeOptions)}
      </Badge>
      <Badge variant="outline">
        {getLabel(exercise.mechanic_type, mechanicTypeOptions)}
      </Badge>
      <span className="truncate font-medium">{exercise.name}</span>
      <span className="line-clamp-2 text-muted-foreground">
        {exercise.description}
      </span>
    </Link>
  );
}
