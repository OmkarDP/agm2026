import { ORGANIZATION, PAGE_TITLE } from "../constants";

type SuccessPageProps = {
  onGoBack: () => void;
};

export function SuccessPage({ onGoBack }: SuccessPageProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(46,107,80,0.15),_transparent_60%),linear-gradient(180deg,_#f6f1e8_0%,_#efe6d6_100%)]"
        aria-hidden="true"
      />
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="संवेदना फाउंडेशन लोगो"
          className="mb-6 h-24 w-auto object-contain"
        />
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">
          नोंदणी यशस्वी!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          आपली नोंदणी यशस्वीरीत्या पूर्ण झाली आहे.
        </p>
        <p className="mt-1 text-base leading-relaxed text-muted">
          {PAGE_TITLE} साठी धन्यवाद!
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={onGoBack}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-forest px-6 text-base font-semibold text-white shadow-sm transition hover:bg-forest-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            नवीन नोंदणी करा
          </button>
        </div>
        <p className="mt-8 text-sm text-muted">{ORGANIZATION}</p>
      </div>
    </div>
  );
}
