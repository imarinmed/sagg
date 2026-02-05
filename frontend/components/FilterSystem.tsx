'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Users, 
  Heart, 
  Clock, 
  Dumbbell,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';

export type FilterCategory = 'character' | 'relationship' | 'timeline' | 'fitness';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  color?: string;
}

export interface FilterGroup {
  id: FilterCategory;
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
}

export interface ActiveFilter {
  category: FilterCategory;
  optionId: string;
}

interface FilterSystemProps {
  groups: FilterGroup[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  onClearAll: () => void;
  className?: string;
}

const categoryLabels: Record<FilterCategory, string> = {
  character: 'Elev',
  relationship: 'Relation',
  timeline: 'Tidslinje',
  fitness: 'Kondition',
};

export function FilterSystem({
  groups,
  activeFilters,
  onFilterChange,
  onClearAll,
  className = '',
}: FilterSystemProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<FilterCategory>>(
    new Set(groups.map(g => g.id))
  );
  const [isOpen, setIsOpen] = useState(false);

  const toggleGroup = (groupId: FilterCategory) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleFilter = (category: FilterCategory, optionId: string) => {
    const exists = activeFilters.some(
      f => f.category === category && f.optionId === optionId
    );
    
    if (exists) {
      onFilterChange(
        activeFilters.filter(
          f => !(f.category === category && f.optionId === optionId)
        )
      );
    } else {
      onFilterChange([...activeFilters, { category, optionId }]);
    }
  };

  const isFilterActive = (category: FilterCategory, optionId: string) => {
    return activeFilters.some(
      f => f.category === category && f.optionId === optionId
    );
  };

  const getActiveFiltersForCategory = (category: FilterCategory) => {
    return activeFilters.filter(f => f.category === category).length;
  };

  const activeFilterCount = activeFilters.length;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          isOpen || activeFilterCount > 0
            ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)]'
            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-accent)]'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filter</span>
        {activeFilterCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-1 px-2 py-0.5 text-xs bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-full"
          >
            {activeFilterCount}
          </motion.span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 mt-2 w-80 glass rounded-xl border border-[var(--color-border)] shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                <span className="font-medium text-[var(--color-text-primary)]">Filter</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-[var(--color-accent-primary)] hover:underline"
                  >
                    Rensa alla
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.id);
                  const activeCount = getActiveFiltersForCategory(group.id);

                  return (
                    <div key={group.id} className="border-b border-[var(--color-border)] last:border-0">
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                            {group.icon}
                          </div>
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {group.label}
                          </span>
                          {activeCount > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] rounded-full">
                              {activeCount}
                            </span>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-1">
                              {group.options.map((option) => {
                                const isActive = isFilterActive(group.id, option.id);
                                
                                return (
                                  <motion.button
                                    key={option.id}
                                    onClick={() => toggleFilter(group.id, option.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                                      isActive
                                        ? 'bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30'
                                        : 'hover:bg-[var(--color-surface-hover)]'
                                    }`}
                                    whileHover={{ x: 2 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        isActive
                                          ? 'bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)]'
                                          : 'border-[var(--color-border)]'
                                      }`}>
                                        {isActive && <Check className="w-3 h-3 text-[var(--color-text-inverse)]" />}
                                      </div>
                                      <span className={`text-sm ${
                                        isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)]'
                                      }`}>
                                        {option.label}
                                      </span>
                                    </div>
                                    {option.count !== undefined && (
                                      <span className="text-xs text-[var(--color-text-muted)]">
                                        {option.count}
                                      </span>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {activeFilterCount > 0 && (
                <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => {
                      const group = groups.find(g => g.id === filter.category);
                      const option = group?.options.find(o => o.id === filter.optionId);
                      if (!group || !option) return null;

                      return (
                        <motion.span
                          key={`${filter.category}-${filter.optionId}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] rounded-full border border-[var(--color-accent-primary)]/30"
                        >
                          <span>{option.label}</span>
                          <button
                            onClick={() => toggleFilter(filter.category, filter.optionId)}
                            className="p-0.5 hover:bg-[var(--color-accent-primary)]/20 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function createDefaultFilterGroups(): FilterGroup[] {
  return [
    {
      id: 'character',
      label: 'Elev',
      icon: <Users className="w-4 h-4" />,
      options: [
        { id: 'class-a', label: 'Klass A - Elit', count: 12, color: '#D4AF37' },
        { id: 'class-b', label: 'Klass B - Avancerad', count: 18, color: '#C0C0C0' },
        { id: 'class-c', label: 'Klass C - Standard', count: 24, color: '#CD7F32' },
        { id: 'family-natt-och-dag', label: 'Natt och Dag', count: 8 },
        { id: 'family-independent', label: 'Oberoende', count: 15 },
        { id: 'beauty-nata-lee', label: 'Nata Lee - Fitness', count: 10 },
        { id: 'beauty-helga', label: 'Helga Lovekaty - Kurvor', count: 8 },
        { id: 'beauty-alexis', label: 'Alexis Ren - Dans', count: 12 },
      ],
    },
    {
      id: 'relationship',
      label: 'Relation',
      icon: <Heart className="w-4 h-4" />,
      options: [
        { id: 'romantic', label: 'Romantisk', count: 15, color: '#be185d' },
        { id: 'familial', label: 'Familjär', count: 22, color: '#c9a227' },
        { id: 'training', label: 'Träning', count: 30, color: '#8B5CF6' },
        { id: 'blood-bond', label: 'Blod-Bindning', count: 12, color: '#991b1b' },
        { id: 'desires', label: 'Begär', count: 18, color: '#ff6b9d' },
        { id: 'serves', label: 'Tjänar', count: 25, color: '#a0a0a0' },
      ],
    },
    {
      id: 'timeline',
      label: 'Tidslinje',
      icon: <Clock className="w-4 h-4" />,
      options: [
        { id: 's01', label: 'Säsong 1', count: 8 },
        { id: 's02', label: 'Säsong 2', count: 8 },
        { id: 'present-high', label: 'Hög Närvaro', count: 20 },
        { id: 'present-medium', label: 'Medel Närvaro', count: 18 },
        { id: 'present-low', label: 'Låg Närvaro', count: 15 },
      ],
    },
    {
      id: 'fitness',
      label: 'Kondition',
      icon: <Dumbbell className="w-4 h-4" />,
      options: [
        { id: 'fitness-10', label: 'Nivå 10 - Perfektion', count: 5 },
        { id: 'fitness-8-9', label: 'Nivå 8-9 - Elit', count: 15 },
        { id: 'fitness-6-7', label: 'Nivå 6-7 - Avancerad', count: 20 },
        { id: 'dance-ballet', label: 'Balett', count: 12 },
        { id: 'dance-contemporary', label: 'Modern Dans', count: 15 },
        { id: 'dance-cheer', label: 'Cheerleading', count: 10 },
        { id: 'focus-fitness', label: 'Fitness', count: 18 },
        { id: 'focus-dance', label: 'Dans', count: 22 },
      ],
    },
  ];
}

export default FilterSystem;
