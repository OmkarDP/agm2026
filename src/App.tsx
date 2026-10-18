import { useState } from "react";
import { Header } from "./components/Header";
import { RegistrationForm } from "./components/RegistrationForm";
import { SuccessPage } from "./components/SuccessPage";
import { ORGANIZATION } from "./constants";

export default function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return <SuccessPage onGoBack={() => setIsSubmitted(false)} />;
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(46,107,80,0.12),_transparent_42%),linear-gradient(180deg,_#f6f1e8_0%,_#efe6d6_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-3 py-4 sm:px-6 sm:py-12">
        <img
          src="/banner.jpeg"
          alt="वार्षिक सर्वसाधारण सभा २०२६ बॅनर"
          className="mb-4 w-full rounded-2xl border border-line object-cover shadow-sm"
        />
        <main className="flex-1">
          <section className="rounded-2xl border border-line bg-card p-3 shadow-[0_18px_50px_rgba(28,25,23,0.08)] sm:rounded-3xl sm:p-8">
            <Header />
            <div className="mt-8 border-t border-line pt-8">
              <RegistrationForm onSuccess={() => setIsSubmitted(true)} />
            </div>
          </section>
        </main>
        <footer className="flex items-center justify-center gap-2 py-6 text-center text-sm text-muted">
          <img
            src="/logo.png"
            alt=""
            className="h-6 w-auto object-contain"
          />
          {ORGANIZATION}
        </footer>
      </div>
    </div>
  );
}
