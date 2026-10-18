type RadioCardGroupProps<T extends string> = {
  legend: string;
  name: string;
  value: T | "";
  options: readonly T[];
  error?: string;
  disabled?: boolean;
  singleColumn?: boolean;
  onChange: (value: T) => void;
};

export function RadioCardGroup<T extends string>({
  legend,
  name,
  value,
  options,
  error,
  disabled = false,
  singleColumn = false,
  onChange,
}: RadioCardGroupProps<T>) {
  const errorId = `${name}-error`;

  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-semibold text-ink">
        {legend}
        <span className="text-terracotta" aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      <div className={`grid grid-cols-1 gap-2 ${singleColumn ? "" : "sm:grid-cols-2 sm:gap-3"}`}>
        {options.map((option, index) => {
          const selected = value === option;
          const optionId = `${name}-${index}`;
          return (
            <label
              key={option}
              htmlFor={optionId}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-sm transition focus-within:ring-2 focus-within:ring-forest/30 ${
                disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              } ${
                selected
                  ? "border-forest bg-forest/10 ring-1 ring-forest/20"
                  : "border-line bg-white hover:border-leaf/50"
              }`}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
              />
              <span className="min-w-0 break-words text-[0.95rem] font-medium text-ink">
                {option}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
