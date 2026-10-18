type StatusMessageProps = {
  tone: "success" | "error";
  children: string;
};

export function StatusMessage({ tone, children }: StatusMessageProps) {
  const classes =
    tone === "success"
      ? "border-success/20 bg-success-bg text-success"
      : "border-danger/20 bg-danger-bg text-danger";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${classes}`}
    >
      {children}
    </div>
  );
}
