import { BookOpen, Palette, Minimize2 } from "lucide-react";

const FEATURES = [
  {
    number: "01",
    icon: BookOpen,
    title: "Turn the page",
    description: "Move through your book one page at a time.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Make it yours",
    description: "Choose a reading environment that feels right.",
  },
  {
    number: "03",
    icon: Minimize2,
    title: "Stay immersed",
    description: "Minimal controls. Maximum focus.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <h2 className="max-w-[24ch] text-balance font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight text-ink">
        Designed around the feeling of reading.
      </h2>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {FEATURES.map(({ number, icon: Icon, title, description }) => (
          <div
            key={number}
            className="border-t border-hairline pt-6"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">{number}</span>
              <Icon className="size-4 text-lamplight" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
