import type { InputHTMLAttributes } from "react";

type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  id,
  label,
  error,
  ...inputProps
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        <span className="text-terracotta" aria-hidden="true">
          {" "}
          *
        </span>
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`h-12 rounded-xl border bg-white px-4 text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-forest focus:ring-2 focus:ring-forest/25 ${
          error ? "border-danger" : "border-line"
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
