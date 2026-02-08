import { notFound } from "next/navigation";
import { getCharacterById } from "@/lib/characterData";
import CharacterPageLayout from "@/components/characters/CharacterPageLayout";
import CharacterNavSidebar from "@/components/characters/CharacterNavSidebar";
import CharacterCatalogHeader from "@/components/characters/CharacterCatalogHeader";
import CharacterStatsPanel from "@/components/characters/CharacterStatsPanel";
import StudentCalendarWidget from "@/components/characters/StudentCalendarWidget";
import CharacterGallery from "@/components/characters/CharacterGallery";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CharacterPage({ params }: PageProps) {
  const { id } = await params;
  const character = getCharacterById(id);

  if (!character) {
    notFound();
  }

  const navSections = [
    { id: "overview", label: "Overview" },
    { id: "gallery", label: "Gallery" },
    { id: "connections", label: "Connections" },
    { id: "evolution", label: "Evolution" },
    { id: "presence", label: "Presence" },
    ...(character.student_profile ? [{ id: "schedule", label: "Schedule" }] : []),
    { id: "profile", label: "Profile", restricted: true },
  ];

  const isFemaleStudent = character.role?.toLowerCase().includes("female") || 
                         character.id === "kiara-natt-och-dag" ||
                         character.id === "elise" ||
                         character.id === "chloe";

  return (
    <CharacterPageLayout
      catalogId={character.catalog_id?.bst}
      isPremium={isFemaleStudent}
    >
      <CharacterNavSidebar sections={navSections} />

      <main className="space-y-16">
        <CharacterCatalogHeader character={character} />

        <section id="gallery" className="scroll-mt-24">
          <CharacterGallery character={character} />
        </section>

        <section id="overview" className="scroll-mt-24">
          <div className="glass rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            {character.adaptation_notes && (
              <p className="text-[var(--color-text-secondary)] mb-4">
                {character.adaptation_notes}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded">
                <h3 className="text-sm text-[var(--color-text-muted)] mb-2">Canonical Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {character.canonical_traits.map((trait) => (
                    <span key={trait} className="px-2 py-1 bg-[var(--color-surface-secondary)] rounded text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div className="glass p-4 rounded">
                <h3 className="text-sm text-[var(--color-text-muted)] mb-2">Adaptation Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {character.adaptation_traits.map((trait) => (
                    <span key={trait} className="px-2 py-1 bg-[var(--color-accent-primary)] text-black rounded text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="profile" className="scroll-mt-24 relative">
          <div className="restricted-banner mb-4">
            ⚠ Restricted Material - SST Classification
          </div>
          <div className="glass rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Kink Profile</h2>
            {character.kink_profile && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[var(--color-accent-primary)] mb-2">Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.kink_profile.preferences.map((pref) => (
                      <span key={pref} className="px-3 py-1 border border-[var(--blood-crimson)] text-[var(--blood-crimson)] rounded-full text-sm">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-red-500 mb-2">Limits</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.kink_profile.limits.map((limit) => (
                      <span key={limit} className="px-3 py-1 border border-red-500 text-red-500 rounded-full text-sm">
                        {limit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <aside className="space-y-6">
        <CharacterStatsPanel character={character} />
        {isFemaleStudent && <StudentCalendarWidget character={character} />}
      </aside>
    </CharacterPageLayout>
  );
}
