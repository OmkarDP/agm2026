import {
  ORGANIZATION,
  PAGE_DESCRIPTION,
  PAGE_SUBTITLE,
  PAGE_TITLE,
} from "../constants";

export function Header() {
  return (
    <header className="text-center">
      <img
        src="/logo.png"
        alt="संवेदना फाउंडेशन लोगो"
        className="mx-auto mb-3 h-16 w-auto object-contain sm:h-24"
      />
      <p className="text-xs font-medium tracking-wide text-forest sm:text-sm">
        {ORGANIZATION}
      </p>
      <h1 className="mt-2 font-display text-2xl leading-snug text-ink sm:mt-3 sm:text-3xl">
        {PAGE_TITLE}
      </h1>
      <p className="mt-1 text-base font-semibold text-leaf sm:mt-2 sm:text-lg">{PAGE_SUBTITLE}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:mt-4 sm:text-[0.95rem]">
        {PAGE_DESCRIPTION}
      </p>
    </header>
  );
}
