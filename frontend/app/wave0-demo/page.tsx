'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CommandPalette, useCommandPalette, CommandItem } from '@/components/CommandPalette';
import { FilterSystem, createDefaultFilterGroups, ActiveFilter } from '@/components/FilterSystem';
import { useViewState, ViewMode, CardViewMode } from '@/lib/useViewState';
import { useMobileDetector } from '@/lib/useMobileDetector';
import { 
  LayoutGrid, 
  Share2, 
  Clock, 
  Columns2,
  User,
  Film,
  Sparkles,
  Map,
  Smartphone,
  Tablet,
  Monitor,
  CreditCard
} from 'lucide-react';
import { StudentCompanionCard } from '@/components/StudentCompanionCard';
import { AuthorityPatronCard } from '@/components/AuthorityPatronCard';
import { CharacterGraph, CharacterNode, RelationshipEdge } from '@/components/CharacterGraph';
import { Crown } from 'lucide-react';

const demoCommandItems: CommandItem[] = [
  {
    id: 'kiara',
    type: 'character',
    title: 'Kiara Natt och Dag',
    subtitle: 'Elev | Klass A | Träningsgrupp: Advanced',
    action: () => console.log('Selected Kiara'),
    metadata: { family: 'Natt och Dag', class: 'A' },
  },
  {
    id: 'desiree',
    type: 'character',
    title: 'Desirée Natt och Dag',
    subtitle: 'Matriark | Forntida | Patron Status',
    action: () => console.log('Selected Desirée'),
    metadata: { family: 'Natt och Dag', class: 'A' },
  },
  {
    id: 'elise',
    type: 'character',
    title: 'Elise',
    subtitle: 'Elev | Klass B | Dans: Balett',
    action: () => console.log('Selected Elise'),
    metadata: { class: 'B' },
  },
  {
    id: 's01e01',
    type: 'episode',
    title: 's01e01 - The Awakening',
    subtitle: 'Första avsnittet | Kiaras ankomst',
    action: () => console.log('Selected episode 1'),
    metadata: { episodeNumber: 's01e01' },
  },
  {
    id: 's01e02',
    type: 'episode',
    title: 's01e02 - First Blood',
    subtitle: 'Första matningen | Blod-bindning',
    action: () => console.log('Selected episode 2'),
    metadata: { episodeNumber: 's01e02' },
  },
  {
    id: 'view-cards',
    type: 'view',
    title: 'Kortvy',
    subtitle: 'Visa alla elever som kort',
    action: () => console.log('Switch to cards view'),
  },
  {
    id: 'view-graph',
    type: 'view',
    title: 'Relationsgraf',
    subtitle: 'Visa relationer som nodgraf',
    action: () => console.log('Switch to graph view'),
  },
  {
    id: 'view-timeline',
    type: 'view',
    title: 'Tidslinje',
    subtitle: 'Visa kronologisk tidslinje',
    action: () => console.log('Switch to timeline view'),
  },
  {
    id: 'toggle-spoilers',
    type: 'action',
    title: 'Växla Spoilers',
    subtitle: 'Visa/dölj spoiler-information',
    action: () => console.log('Toggle spoilers'),
  },
];

const viewModeIcons: Record<ViewMode, React.ReactNode> = {
  cards: <LayoutGrid className="w-4 h-4" />,
  graph: <Share2 className="w-4 h-4" />,
  timeline: <Clock className="w-4 h-4" />,
  split: <Columns2 className="w-4 h-4" />,
  phone: <Smartphone className="w-4 h-4" />,
};

const cardModeLabels: Record<CardViewMode, string> = {
  portrait: 'Porträtt',
  compact: 'Kompakt',
  list: 'Lista',
};

export default function Wave0DemoPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const { state, setMode, setCardMode, setSpoilerLevel } = useViewState();
  const mobile = useMobileDetector();
  const filterGroups = createDefaultFilterGroups();

  useCommandPalette(() => setCommandPaletteOpen(true));

  const handleCommandSelect = useCallback((item: CommandItem) => {
    console.log('Selected:', item);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-heading text-[var(--color-accent-primary)]"
          >
            Wave 0: Foundation Components
          </motion.h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            St. Cecilia Akademi - Premium Character Map
          </p>
        </header>

        
        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            <User className="w-6 h-6 text-[var(--color-accent-primary)]" />
            1. Command Palette (Cmd+K)
          </h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 rounded-lg text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/20 transition-colors"
            >
              <span className="text-lg">Öppna Command Palette</span>
              <kbd className="px-2 py-1 text-sm bg-[var(--color-bg-tertiary)] rounded">Cmd+K</kbd>
            </button>
          </div>

          <div className="text-sm text-[var(--color-text-muted)]">
            <p>Tryck Cmd+K (eller Ctrl+K) för att öppna sökpanelen</p>
            <p>Sök efter elever, avsnitt, eller vyer</p>
          </div>

          <CommandPalette
            items={demoCommandItems}
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onSelect={handleCommandSelect}
          />
        </section>

        
        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[var(--color-accent-primary)]" />
            2. Filter System
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <FilterSystem
              groups={filterGroups}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
              onClearAll={handleClearFilters}
            />

            {activeFilters.length > 0 && (
              <div className="text-sm text-[var(--color-text-muted)]">
                {activeFilters.length} filter aktiva
              </div>
            )}
          </div>

          <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">Aktiva filter:</p>
            {activeFilters.length === 0 ? (
              <p className="text-[var(--color-text-secondary)]">Inga filter valda</p>
            ) : (
              <pre className="text-xs text-[var(--color-text-secondary)] overflow-auto">
                {JSON.stringify(activeFilters, null, 2)}
              </pre>
            )}
          </div>
        </section>

        
        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            <Map className="w-6 h-6 text-[var(--color-accent-primary)]" />
            3. View State Manager
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Vy-läge</h3>
              <div className="flex flex-wrap gap-2">
                {(['cards', 'graph', 'timeline', 'split'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMode(mode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      state.mode === mode
                        ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-accent)]'
                    }`}
                  >
                    {viewModeIcons[mode]}
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Kortläge</h3>
              <div className="flex flex-wrap gap-2">
                {(['portrait', 'compact', 'list'] as CardViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCardMode(mode)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      state.cardMode === mode
                        ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-accent)]'
                    }`}
                  >
                    {cardModeLabels[mode]}
                  </button>
                ))}
              </div>
            </div>

            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Spoiler-nivå</h3>
              <div className="flex flex-wrap gap-2">
                {(['hidden', 'hinted', 'revealed'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpoilerLevel(level)}
                    className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                      state.spoilerLevel === level
                        ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-accent)]'
                    }`}
                  >
                    {level === 'hidden' ? 'Dold' : level === 'hinted' ? 'Hintad' : 'Avslöjad'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">Nuvarande tillstånd:</p>
            <pre className="text-xs text-[var(--color-text-secondary)] overflow-auto">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
        </section>

        
        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            {mobile.deviceType === 'mobile' ? (
              <Smartphone className="w-6 h-6 text-[var(--color-accent-primary)]" />
            ) : mobile.deviceType === 'tablet' ? (
              <Tablet className="w-6 h-6 text-[var(--color-accent-primary)]" />
            ) : (
              <Monitor className="w-6 h-6 text-[var(--color-accent-primary)]" />
            )}
            4. Mobile Detector
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
              <p className="text-sm text-[var(--color-text-muted)]">Enhetstyp</p>
              <p className="text-lg font-medium text-[var(--color-text-primary)] capitalize">
                {mobile.deviceType}
              </p>
            </div>

            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
              <p className="text-sm text-[var(--color-text-muted)]">Orientering</p>
              <p className="text-lg font-medium text-[var(--color-text-primary)] capitalize">
                {mobile.orientation}
              </p>
            </div>

            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
              <p className="text-sm text-[var(--color-text-muted)]">Touch</p>
              <p className="text-lg font-medium text-[var(--color-text-primary)]">
                {mobile.isTouch ? 'Ja' : 'Nej'}
              </p>
            </div>

            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
              <p className="text-sm text-[var(--color-text-muted)]">Breakpoint</p>
              <p className="text-lg font-medium text-[var(--color-text-primary)] uppercase">
                {mobile.breakpoint}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">Skärmstorlek:</p>
            <p className="text-[var(--color-text-secondary)]">
              {mobile.screenWidth} × {mobile.screenHeight}px
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {mobile.isMobile && (
              <span className="px-3 py-1 text-sm bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] rounded-full">
                Mobile
              </span>
            )}
            {mobile.isTablet && (
              <span className="px-3 py-1 text-sm bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] rounded-full">
                Tablet
              </span>
            )}
            {mobile.isDesktop && (
              <span className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-full">
                Desktop
              </span>
            )}
          </div>
        </section>

        
        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-[var(--color-accent-primary)]" />
            5. StudentCompanionCard (Wave 1)
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <StudentCompanionCard
                id="kiara-natt-och-dag"
                name="Kiara Natt och Dag"
                studentId="STD-24-KND-001"
                trainingGroup="Advanced"
                fitnessLevel={9}
                danceStyles={['Balett', 'Contemporary']}
                beautyType="annabel-lucinda"
                unintentionalEroticism={8}
                companionClass="A"
                companionId="CMP-24-KND-001-A"
                placementValue={2400000}
                trainingModules={[
                  { name: 'Fysisk Kondition', rating: 5 },
                  { name: 'Dans & Rörelse', rating: 5 },
                  { name: 'Kroppsspråk', rating: 4 },
                  { name: 'Konversation', rating: 5 },
                  { name: 'Förförelse', rating: 4 },
                  { name: 'Njutningskonst', rating: 5 },
                  { name: 'Blod-Spel', rating: 5 },
                  { name: 'Flexibilitet', rating: 4 },
                  { name: 'Uthållighet', rating: 4 },
                ]}
                clientSuitability={{
                  elite: 95,
                  ancient: 80,
                  noble: 85,
                  experimental: 60,
                }}
                establishedYear={1847}
                status="active"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Oavsiktlig Fitness Ikon
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Kiara representerar den "oavsiktliga eroticism" som alla vampyrer i detta universum har. 
                  Hon bad inte om att bli en fitness ikon—hennes vampyr-fysiologi gjorde henne till det.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  3D Flip Funktion
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Klicka på kortet för att vända det. Framsidan visar den offentliga elev-profilen 
                  (St. Cecilia Akademi). Baksiden visar den konfidentiella följeslagare-bedömningen 
                  med träningsmoduler och klient-lämplighet.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Annabel Lucinda Referens
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Kiara har nått Annabel Lucinda-nivå av extrem muskel-definition—synliga abs, 
                  skulpterade axlar, kraftfulla ben. Hon är en "stark är vacker" ikon utan att 
                  ens försöka.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Oavsiktlig Erotism: 8/10
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Även när Kiara försöker vara "normal" är hon oavsiktligt erotisk. Varje outfit 
                  blir provocerande. Varje rörelse drar blickar. Varje pose ser ut som ett 
                  fitness-magasin omslag.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            <Crown className="w-6 h-6 text-[var(--color-accent-primary)]" />
            6. AuthorityPatronCard (Wave 2)
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <AuthorityPatronCard
                id="desiree-natt-och-dag"
                name="Desirée Natt och Dag"
                title="Matriark | Forntida | Patron Status"
                authorityLevel="alfa"
                family="Natt och Dag"
                sector="Natt och Dag"
                generation={2}
                bloodline="Ren"
                memberSince={1847}
                clearance="Nivå Alfa"
                influence="Omfattande"
                assets="Hemliga"
                companionPrivileges="Obegränsad"
                isCompanionSecret={true}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Eviga Rådet - Vampire Authority
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Desirée representerar den ultimata vampyr-auktoriteten. Som medlem av Eviga Rådet 
                  har hon omfattande inflytande och hemliga tillgångar. Hennes nuvarande följeslagare 
                  är klassificerad information.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Luxury Embossed Design
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Kortet har ett landskapsformat med lyxig präglad estetik. Hexagon-porträttet, 
                  hologram-effekter, och sigill/vax-märken skapar en auktoritär känsla passande 
                  för vampyr-eliten.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Helga Lovekaty + Nata Lee Fusion
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Desirée ser ut som Kiaras något äldre syster trots att hon är hennes mor. 
                  Hon har Helga Lovekatys kurvor med Nata Lees fitness—en omöjlig skönhet 
                  som frystes vid 18 års ålder för århundraden sedan.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Nivå Alfa Clearance
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Högsta auktoritetsnivå med tillgång till all hemlig information. 
                  Medlem sedan 1847—över 175 år av makt och inflytande i vampyr-samhället.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] flex items-center gap-3">
            <Share2 className="w-6 h-6 text-[var(--color-accent-primary)]" />
            7. CharacterGraph (Wave 3)
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                Canvas-baserad Relationsgraf
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                En "beautiful chaos" visualisering av karaktärsrelationer. Hovra över noder för att fokusera, 
                scrolla för att zooma, dra för att panorera. Relationer visas med pulserande färger baserat på typ.
              </p>
              
              <CharacterGraph
                nodes={[
                  { id: 'kiara', name: 'Kiara', x: 400, y: 300, fitnessLevel: 9, danceSkill: 8, beautyRating: 9, family: 'Natt och Dag', beautyType: 'annabel-lucinda', color: '#d4af37' },
                  { id: 'desiree', name: 'Desirée', x: 200, y: 200, fitnessLevel: 10, danceSkill: 9, beautyRating: 10, family: 'Natt och Dag', beautyType: 'helga-lovekaty-fit', color: '#c9a227' },
                  { id: 'elise', name: 'Elise', x: 600, y: 250, fitnessLevel: 8, danceSkill: 9, beautyRating: 8, family: 'Independent', beautyType: 'alexis-ren', color: '#8B5CF6' },
                  { id: 'chloe', name: 'Chloe', x: 550, y: 400, fitnessLevel: 7, danceSkill: 8, beautyRating: 8, family: 'Independent', beautyType: 'alexis-ren', color: '#ff6b9d' },
                  { id: 'alfred', name: 'Alfred', x: 300, y: 400, fitnessLevel: 8, danceSkill: 6, beautyRating: 7, family: 'Natt och Dag', beautyType: 'nata-lee', color: '#991b1b' },
                ]}
                edges={[
                  { id: '1', source: 'kiara', target: 'desiree', type: 'familial', strength: 5 },
                  { id: '2', source: 'kiara', target: 'alfred', type: 'romantic', strength: 4 },
                  { id: '3', source: 'kiara', target: 'elise', type: 'training', strength: 3 },
                  { id: '4', source: 'desiree', target: 'alfred', type: 'blood-bond', strength: 5 },
                  { id: '5', source: 'elise', target: 'chloe', type: 'desires', strength: 3 },
                ]}
                width={800}
                height={500}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  50+ Noder vid 60fps
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Canvas-rendering för hög prestanda. Varje nod representerar en karaktär med storlek 
                  baserat på fitness + dans + skönhet. Level 10 (Nata Lee-perfektion) = 120px diameter.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Relationstyper med Färger
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Romantisk (crimson), Familjär (gold), Träning (purple), Blod-Bindning (dark red), 
                  Begär (pink), Tjänar (silver). Kurvade Bezier-kopplingar med glow-effekt.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">
            Nästa steg
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { wave: 'Wave 4', title: 'Family Clustering', desc: 'Group characters by vampire family' },
              { wave: 'Wave 5', title: 'Multi-Track Timeline', desc: '6-track timeline with fitness focus' },
              { wave: 'Wave 6', title: 'Navigation', desc: 'Command palette, mini-map, breadcrumbs' },
              { wave: 'Wave 7', title: 'Spoilers & Secrets', desc: 'Hidden/Hinted/Revealed states' },
              { wave: 'Wave 8', title: 'Accessibility', desc: 'Keyboard nav, screen readers, colorblind' },
              { wave: 'Wave 9', title: 'Mobile', desc: 'Vertical stack, bottom sheets, touch' },
            ].map((item) => (
              <div 
                key={item.wave}
                className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-accent)] transition-colors"
              >
                <p className="text-sm text-[var(--color-accent-primary)] font-medium">{item.wave}</p>
                <h3 className="text-lg text-[var(--color-text-primary)] font-medium">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
