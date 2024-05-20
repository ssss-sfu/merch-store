import { type FieldError } from "react-hook-form";

export function FieldValidation({
  children,
  error,
  highlightOnly,
}: {
  children: React.ReactNode;
  error: FieldError | undefined;
  highlightOnly?: boolean;
}) {
  return (
    <div className={`${error?.message ? "error" : ""} group h-full w-full`}>
      {children}
      {!highlightOnly && error?.message && (
        <span className="text-red-500">{error.message}</span>
      )}
    </div>
  );
}
