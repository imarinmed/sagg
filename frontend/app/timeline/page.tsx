import { TemporalNavigator } from "@/components/TemporalNavigator";
import temporalData from "@/../data/derived/temporal_index.json";

export default function TimelinePage() {
  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Timeline
          </h1>
          <p
            className="text-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            Explore the narrative structure across episodes, scenes, and moments.
            Filter by character presence and intensity types.
          </p>
        </header>

        <section className="glass rounded-xl p-6">
          <TemporalNavigator data={temporalData} />
        </section>
      </div>
    </main>
  );
}
