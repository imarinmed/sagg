'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CommandPalette,
  useCommandPalette,
  FilterSystem,
  createDefaultFilterGroups,
  StudentCompanionCard,
  AuthorityPatronCard,
  CharacterGraph,
  FamilyClustering,
  MultiTrackTimeline,
  Breadcrumbs,
  MiniMap,
  NavigationShortcuts,
  SpoilerManager,
  BottomSheet,
  type SpoilerLevel,
  type FilterGroup,
  type ActiveFilter,
  type CharacterNode,
  type RelationshipEdge,
  type TimelineTrack,
  type FamilyCluster
} from '@/components';
import {
  useViewState,
  useMobileDetector
} from '@/lib';
import {
  LayoutGrid,
  Share2,
  Clock,
  Users,
  Menu,
  Filter,
  Search
} from 'lucide-react';

// Demo data for students
const demoStudents = [
  {
    id: 'kiara',
    name: 'Kiara Natt och Dag',
    studentId: 'STD-24-KND-001',
    trainingGroup: 'Advanced',
    fitnessLevel: 9,
    danceStyles: ['Balett', 'Contemporary'],
    beautyType: 'annabel-lucinda' as const,
    unintentionalEroticism: 8,
    companionClass: 'A' as const,
    companionId: 'CMP-24-KND-001-A',
    placementValue: 2400000,
    trainingModules: [
      { name: 'Fysisk Kondition', rating: 5 },
      { name: 'Dans', rating: 5 },
      { name: 'Kroppssprak', rating: 4 },
    ],
    clientSuitability: { elite: 95, ancient: 80, noble: 85, experimental: 60 },
    establishedYear: 1847,
    status: 'active' as const
  },
  {
    id: 'elise',
    name: 'Elise Vinter',
    studentId: 'STD-24-EVI-002',
    trainingGroup: 'Elite',
    fitnessLevel: 10,
    danceStyles: ['Balett', 'Jazz', 'Hip Hop'],
    beautyType: 'alexis-ren' as const,
    unintentionalEroticism: 9,
    companionClass: 'A' as const,
    companionId: 'CMP-24-EVI-002-A',
    placementValue: 3200000,
    trainingModules: [
      { name: 'Fysisk Kondition', rating: 5 },
      { name: 'Dans', rating: 5 },
      { name: 'Kroppssprak', rating: 5 },
      { name: 'Konversation', rating: 4 },
    ],
    clientSuitability: { elite: 98, ancient: 90, noble: 95, experimental: 70 },
    establishedYear: 1852,
    status: 'active' as const
  },
  {
    id: 'chloe',
    name: 'Chloe Bergman',
    studentId: 'STD-24-CBE-003',
    trainingGroup: 'Advanced',
    fitnessLevel: 8,
    danceStyles: ['Contemporary', 'Cheerleading'],
    beautyType: 'madison-beer' as const,
    unintentionalEroticism: 7,
    companionClass: 'B' as const,
    companionId: 'CMP-24-CBE-003-B',
    placementValue: 1800000,
    trainingModules: [
      { name: 'Fysisk Kondition', rating: 4 },
      { name: 'Dans', rating: 5 },
      { name: 'Kroppssprak', rating: 3 },
    ],
    clientSuitability: { elite: 75, ancient: 85, noble: 80, experimental: 90 },
    establishedYear: 1860,
    status: 'training' as const
  },
  {
    id: 'sophie',
    name: 'Sophie Lindqvist',
    studentId: 'STD-24-SLI-004',
    trainingGroup: 'Intermediate',
    fitnessLevel: 7,
    danceStyles: ['Balett'],
    beautyType: 'sydney-sweeney' as const,
    unintentionalEroticism: 6,
    companionClass: 'B' as const,
    companionId: 'CMP-24-SLI-004-B',
    placementValue: 1200000,
    trainingModules: [
      { name: 'Fysisk Kondition', rating: 3 },
      { name: 'Dans', rating: 4 },
      { name: 'Kroppssprak', rating: 3 },
    ],
    clientSuitability: { elite: 60, ancient: 70, noble: 75, experimental: 80 },
    establishedYear: 1875,
    status: 'training' as const
  }
];

// Demo data for authorities
const demoAuthorities = [
  {
    id: 'desiree',
    name: 'Desirée Natt och Dag',
    title: 'Matriark',
    authorityLevel: 'alfa' as const,
    family: 'Natt och Dag',
    sector: 'Nord',
    generation: 2,
    bloodline: 'Ren' as const,
    memberSince: 1847,
    clearance: 'Nivå Alfa',
    influence: 'Omfattande',
    assets: 'Hemliga',
    companionPrivileges: 'Obegränsad',
    currentCompanion: 'Klassificerad',
    isCompanionSecret: true
  },
  {
    id: 'henry',
    name: 'Henry Vinter',
    title: 'Patriark',
    authorityLevel: 'alfa' as const,
    family: 'Vinter',
    sector: 'Syd',
    generation: 3,
    bloodline: 'Ren' as const,
    memberSince: 1852,
    clearance: 'Nivå Alfa',
    influence: 'Omfattande',
    assets: 'Hemliga',
    companionPrivileges: 'Obegränsad',
    currentCompanion: 'Elise Vinter',
    isCompanionSecret: false
  }
];

// Demo data for graph
const demoGraphNodes: CharacterNode[] = [
  { id: 'kiara', name: 'Kiara', x: 100, y: 100, fitnessLevel: 9, danceSkill: 9, beautyRating: 9, family: 'Natt och Dag', beautyType: 'annabel-lucinda', color: '#d4af37' },
  { id: 'elise', name: 'Elise', x: 300, y: 150, fitnessLevel: 10, danceSkill: 10, beautyRating: 10, family: 'Vinter', beautyType: 'alexis-ren', color: '#c0c0c0' },
  { id: 'chloe', name: 'Chloe', x: 200, y: 300, fitnessLevel: 8, danceSkill: 8, beautyRating: 8, family: 'Bergman', beautyType: 'madison-beer', color: '#cd853f' },
  { id: 'sophie', name: 'Sophie', x: 400, y: 250, fitnessLevel: 7, danceSkill: 7, beautyRating: 7, family: 'Lindqvist', beautyType: 'sydney-sweeney', color: '#b8d4e3' },
  { id: 'desiree', name: 'Desirée', x: 150, y: 200, fitnessLevel: 10, danceSkill: 9, beautyRating: 10, family: 'Natt och Dag', beautyType: 'helga-lovekaty-fit', color: '#d4af37' },
  { id: 'henry', name: 'Henry', x: 350, y: 100, fitnessLevel: 9, danceSkill: 7, beautyRating: 9, family: 'Vinter', beautyType: 'nata-lee', color: '#c0c0c0' },
  { id: 'alfred', name: 'Alfred', x: 250, y: 400, fitnessLevel: 8, danceSkill: 6, beautyRating: 8, family: 'Natt och Dag', beautyType: 'nata-lee', color: '#d4af37' },
  { id: 'victoria', name: 'Victoria', x: 450, y: 350, fitnessLevel: 9, danceSkill: 8, beautyRating: 9, family: 'Vinter', beautyType: 'alexis-ren', color: '#c0c0c0' },
];

const demoGraphEdges: RelationshipEdge[] = [
  { id: 'e1', source: 'kiara', target: 'desiree', type: 'familial', strength: 1 },
  { id: 'e2', source: 'elise', target: 'henry', type: 'familial', strength: 1 },
  { id: 'e3', source: 'kiara', target: 'elise', type: 'romantic', strength: 0.8 },
  { id: 'e4', source: 'chloe', target: 'sophie', type: 'training', strength: 0.6 },
  { id: 'e5', source: 'desiree', target: 'henry', type: 'romantic', strength: 0.9 },
  { id: 'e6', source: 'kiara', target: 'alfred', type: 'blood-bond', strength: 0.7 },
  { id: 'e7', source: 'elise', target: 'victoria', type: 'training', strength: 0.5 },
  { id: 'e8', source: 'desiree', target: 'kiara', type: 'training', strength: 0.9 },
  { id: 'e9', source: 'chloe', target: 'kiara', type: 'desires', strength: 0.4 },
  { id: 'e10', source: 'sophie', target: 'elise', type: 'serves', strength: 0.3 },
];

// Demo data for timeline
const demoEpisodes = [
  { id: 's01e01', title: 'The Awakening', number: 1 },
  { id: 's01e02', title: 'First Blood', number: 2 },
  { id: 's01e03', title: 'The Hunger', number: 3 },
  { id: 's01e04', title: 'Training Begins', number: 4 },
  { id: 's01e05', title: 'Blood Bond', number: 5 },
];

const demoTracks: TimelineTrack[] = [
  {
    id: 'episode',
    label: 'Avsnitt',
    icon: React.createElement('span', { key: 'ep' }, '▶'),
    color: '#d4af37',
    events: [
      { id: 'e1', episode: 's01e01', timestamp: '00:00', type: 'episode', title: 'The Awakening', characters: ['kiara'] },
      { id: 'e2', episode: 's01e02', timestamp: '00:00', type: 'episode', title: 'First Blood', characters: ['kiara', 'elise'] },
      { id: 'e3', episode: 's01e03', timestamp: '00:00', type: 'episode', title: 'The Hunger', characters: ['kiara', 'desiree'] },
    ]
  },
  {
    id: 'presence',
    label: 'Närvaro',
    icon: React.createElement('span', { key: 'pr' }, '👤'),
    color: '#8b5cf6',
    events: [
      { id: 'p1', episode: 's01e01', timestamp: '05:30', type: 'presence', title: 'Kiara anländer', intensity: 0.8, characters: ['kiara'] },
      { id: 'p2', episode: 's01e02', timestamp: '12:00', type: 'presence', title: 'Elise träning', intensity: 0.9, characters: ['elise'] },
      { id: 'p3', episode: 's01e03', timestamp: '20:00', type: 'presence', title: 'Familjemöte', intensity: 0.7, characters: ['kiara', 'desiree'] },
    ]
  },
  {
    id: 'fitness',
    label: 'Kondition',
    icon: React.createElement('span', { key: 'fit' }, '💪'),
    color: '#ff6b9d',
    events: [
      { id: 'f1', episode: 's01e01', timestamp: '15:00', type: 'fitness', title: 'Första träningen', intensity: 0.6, characters: ['kiara'] },
      { id: 'f2', episode: 's01e02', timestamp: '25:00', type: 'fitness', title: 'Dansövningar', intensity: 0.8, characters: ['elise', 'chloe'] },
      { id: 'f3', episode: 's01e04', timestamp: '10:00', type: 'fitness', title: 'Avancerad kondition', intensity: 0.9, characters: ['kiara', 'elise'] },
    ]
  },
  {
    id: 'training',
    label: 'Följeslagare Träning',
    icon: React.createElement('span', { key: 'tr' }, '🎓'),
    color: '#c9a227',
    events: [
      { id: 't1', episode: 's01e02', timestamp: '30:00', type: 'training', title: 'Kiara tränar Alfred', intensity: 0.7, characters: ['kiara', 'alfred'] },
      { id: 't2', episode: 's01e03', timestamp: '35:00', type: 'training', title: 'Desirée tränar Kiara', intensity: 0.9, characters: ['desiree', 'kiara'] },
    ]
  }
];

// Demo data for families
const demoFamilies: FamilyCluster[] = [
  {
    id: 'natt-och-dag',
    name: 'Natt och Dag',
    sector: 'Nord',
    color: '#d4af37',
    influence: 'dominant',
    establishedYear: 1847,
    members: [
      { id: 'desiree', name: 'Desirée', role: 'Matriark', fitnessLevel: 10, beautyType: 'helga-lovekaty-fit', isAuthority: true },
      { id: 'kiara', name: 'Kiara', role: 'Arvinge', fitnessLevel: 9, beautyType: 'annabel-lucinda' },
      { id: 'alfred', name: 'Alfred', role: 'Medlem', fitnessLevel: 8, beautyType: 'nata-lee' },
    ]
  },
  {
    id: 'vinter',
    name: 'Vinter',
    sector: 'Syd',
    color: '#c0c0c0',
    influence: 'major',
    establishedYear: 1852,
    members: [
      { id: 'henry', name: 'Henry', role: 'Patriark', fitnessLevel: 9, beautyType: 'nata-lee', isAuthority: true },
      { id: 'elise', name: 'Elise', role: 'Arvinge', fitnessLevel: 10, beautyType: 'alexis-ren' },
      { id: 'victoria', name: 'Victoria', role: 'Medlem', fitnessLevel: 9, beautyType: 'alexis-ren' },
    ]
  },
  {
    id: 'bergman',
    name: 'Bergman',
    sector: 'Öst',
    color: '#cd853f',
    influence: 'minor',
    establishedYear: 1860,
    members: [
      { id: 'chloe', name: 'Chloe', role: 'Arvinge', fitnessLevel: 8, beautyType: 'madison-beer' },
    ]
  }
];

// Filter groups
const filterGroups: FilterGroup[] = [
  {
    id: 'character',
    label: 'Elev',
    icon: React.createElement(Users, { className: 'w-4 h-4' }),
    options: [
      { id: 'class-a', label: 'Klass A', count: 2 },
      { id: 'class-b', label: 'Klass B', count: 2 },
      { id: 'active', label: 'Aktiv', count: 2 },
      { id: 'training', label: 'Under Utbildning', count: 2 },
    ]
  },
  {
    id: 'fitness',
    label: 'Kondition',
    icon: React.createElement('span', { key: 'fit' }, '💪'),
    options: [
      { id: 'elite', label: 'Elit (10)', count: 1 },
      { id: 'advanced', label: 'Avancerad (8-9)', count: 2 },
      { id: 'intermediate', label: 'Medel (7)', count: 1 },
    ]
  },
  {
    id: 'relationship',
    label: 'Relation',
    icon: React.createElement('span', { key: 'rel' }, '💕'),
    options: [
      { id: 'romantic', label: 'Romantisk', count: 2 },
      { id: 'familial', label: 'Familjär', count: 2 },
      { id: 'training', label: 'Träning', count: 3 },
    ]
  }
];

// View mode options
const viewModes = [
  { id: 'cards', label: 'Kort', icon: LayoutGrid },
  { id: 'graph', label: 'Graf', icon: Share2 },
  { id: 'timeline', label: 'Tidslinje', icon: Clock },
  { id: 'families', label: 'Familjer', icon: Users },
];

export default function CharactersPage() {
  const { state, setMode } = useViewState();
  const mobile = useMobileDetector();
  const [commandOpen, setCommandOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [spoilerLevel, setSpoilerLevel] = useState<SpoilerLevel>('hinted');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState('s01e01');
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  useCommandPalette(() => setCommandOpen(true));

  const handleViewChange = useCallback((view: string) => {
    setMode(view as 'cards' | 'graph' | 'timeline' | 'split');
  }, [setMode]);

  const handleFilterChange = useCallback((filters: ActiveFilter[]) => {
    setActiveFilters(filters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    console.log('Clicked node:', nodeId);
  }, []);

  const handleFamilySelect = useCallback((familyId: string) => {
    setSelectedFamily(familyId === selectedFamily ? null : familyId);
  }, [selectedFamily]);

  const handleMemberSelect = useCallback((memberId: string) => {
    console.log('Selected member:', memberId);
  }, []);

  // Filter characters based on active filters
  const filteredStudents = useMemo(() => {
    if (activeFilters.length === 0) return demoStudents;
    
    return demoStudents.filter(student => {
      return activeFilters.every(filter => {
        switch (filter.optionId) {
          case 'class-a':
            return student.companionClass === 'A';
          case 'class-b':
            return student.companionClass === 'B';
          case 'active':
            return student.status === 'active';
          case 'training':
            return student.status === 'training';
          case 'elite':
            return student.fitnessLevel === 10;
          case 'advanced':
            return student.fitnessLevel >= 8 && student.fitnessLevel <= 9;
          case 'intermediate':
            return student.fitnessLevel === 7;
          default:
            return true;
        }
      });
    });
  }, [activeFilters]);

  // Command palette items
  const commandItems = useMemo(() => {
    const items = [
      ...demoStudents.map(s => ({
        id: s.id,
        type: 'character' as const,
        title: s.name,
        subtitle: `Elev - ${s.trainingGroup}`,
        icon: '👤',
        action: () => console.log('Selected:', s.name),
      })),
      ...demoAuthorities.map(a => ({
        id: a.id,
        type: 'character' as const,
        title: a.name,
        subtitle: `${a.title} - ${a.family}`,
        icon: '👑',
        action: () => console.log('Selected:', a.name),
      })),
    ];
    return items;
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={[{ id: 'characters', label: 'Karaktärer' }]} />
            <div className="flex items-center gap-2">
              <SpoilerManager 
                globalLevel={spoilerLevel} 
                onGlobalLevelChange={setSpoilerLevel} 
              />
              <button 
                onClick={() => setCommandOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Sök</span>
                <kbd className="hidden md:inline px-2 py-0.5 text-xs bg-[var(--color-bg-secondary)] rounded">⌘K</kbd>
              </button>
              {mobile.isMobile && (
                <button 
                  onClick={() => setBottomSheetOpen(true)}
                  className="p-2 glass rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* View Mode Tabs */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleViewChange(mode.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      state.mode === mode.id
                        ? 'bg-[var(--nordic-gold)]/20 text-[var(--nordic-gold)]'
                        : 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <FilterSystem
                groups={filterGroups}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Cards View */}
          {state.mode === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Students Section */}
              <section>
                <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">
                  Elever
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStudents.map((student) => (
                    <StudentCompanionCard key={student.id} {...student} />
                  ))}
                </div>
              </section>

              {/* Authorities Section */}
              <section>
                <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-4">
                  Auktoriteter
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demoAuthorities.map((authority) => (
                    <AuthorityPatronCard key={authority.id} {...authority} />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* Graph View */}
          {state.mode === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="glass rounded-xl p-4">
                <h2 className="text-xl font-heading text-[var(--color-text-primary)] mb-2">
                  Relations Graf
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  Visualisering av karaktärer och deras relationer. Klicka på noder för detaljer.
                </p>
                <CharacterGraph
                  nodes={demoGraphNodes}
                  edges={demoGraphEdges}
                  width={800}
                  height={500}
                  onNodeClick={handleNodeClick}
                />
              </div>
            </motion.div>
          )}

          {/* Timeline View */}
          {state.mode === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="glass rounded-xl p-4">
                <h2 className="text-xl font-heading text-[var(--color-text-primary)] mb-2">
                  Tidslinje
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  Spårar kondition, närvaro och träning över avsnitten.
                </p>
                <MultiTrackTimeline
                  tracks={demoTracks}
                  episodes={demoEpisodes}
                  currentEpisode={currentEpisode}
                  onEpisodeChange={setCurrentEpisode}
                />
              </div>
            </motion.div>
          )}

          {/* Families View */}
          {state.mode === 'split' && (
            <motion.div
              key="families"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="glass rounded-xl p-4">
                <h2 className="text-xl font-heading text-[var(--color-text-primary)] mb-2">
                  Familje Kuster
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  Familjerna och deras medlemmar. Klicka för att se detaljer.
                </p>
                <FamilyClustering
                  families={demoFamilies}
                  selectedFamilyId={selectedFamily}
                  onFamilySelect={handleFamilySelect}
                  onMemberSelect={handleMemberSelect}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Desktop Navigation Shortcuts */}
      {!mobile.isMobile && (
        <div className="fixed bottom-4 right-4 z-40">
          <NavigationShortcuts
            currentView={state.mode}
            onNavigate={(view) => handleViewChange(view)}
          />
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {mobile.isMobile && (
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          title="Navigation"
        >
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Vyer</p>
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      handleViewChange(mode.id);
                      setBottomSheetOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      state.mode === mode.id
                        ? 'bg-[var(--nordic-gold)]/20 text-[var(--nordic-gold)]'
                        : 'hover:bg-[var(--color-bg-secondary)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Spoiler Nivå</p>
              <div className="flex gap-2">
                {(['hidden', 'hinted', 'revealed'] as SpoilerLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpoilerLevel(level)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                      spoilerLevel === level
                        ? 'bg-[var(--nordic-gold)]/20 text-[var(--nordic-gold)]'
                        : 'bg-[var(--color-bg-secondary)]'
                    }`}
                  >
                    {level === 'hidden' && 'Dold'}
                    {level === 'hinted' && 'Hintad'}
                    {level === 'revealed' && 'Avslöjad'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        items={commandItems}
        onSelect={(item) => item.action()}
        placeholder="Sök karaktärer, avsnitt, eller familjer..."
      />
    </div>
  );
}
