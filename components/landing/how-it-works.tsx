const STEPS = [
  {
    number: "01",
    title: "Select your meal",
    description:
      "Choose foods or macros — carbohydrates, protein, fat, and fiber. Mix and match to build any meal.",
  },
  {
    number: "02",
    title: "Set eating frequency",
    description:
      "Tell the simulation how many times a day you eat. Snacking constantly? Three meals? See the difference.",
  },
  {
    number: "03",
    title: "Watch your body respond",
    description:
      "Real-time glucose and insulin curves animate in front of you. See spikes, crashes, and fat-storage triggers.",
  },
  {
    number: "04",
    title: "Understand the outcome",
    description:
      "The simulation explains why constant insulin elevation drives fat storage — and how to avoid it.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400/70 mb-4">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Four steps to metabolic clarity.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-black/80 p-8 hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-5xl font-bold text-white/[0.06] block mb-4 font-mono">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
