import { PAYMENT_APPEAL, UPI_ID, UPI_NAME } from "../constants";

export function PaymentSection() {
  return (
    <section
      aria-label="पेमेंट माहिती"
      className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 className="font-display text-lg text-ink">पेमेंट माहिती</h2>

      <div className="flex w-full flex-col gap-1 rounded-xl bg-paper p-4 text-center">
        <p className="text-sm text-muted">UPI क्रमांक</p>
        <p className="text-lg font-semibold tracking-wide text-ink">
          {UPI_ID}
        </p>
        <p className="text-sm text-muted">{UPI_NAME}</p>
      </div>

      <p className="text-center text-[0.95rem] leading-relaxed text-ink">
        {PAYMENT_APPEAL}
      </p>
    </section>
  );
}
