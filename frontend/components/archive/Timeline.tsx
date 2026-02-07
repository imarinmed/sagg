import React from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  isActive?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline = ({
  events,
  className = '',
}: TimelineProps) => {
  return (
    <div className={`relative space-y-8 pl-4 ${className}`}>
      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[var(--timeline-line-color)]" />

      {events.map((event) => (
        <div key={event.id} className="relative pl-8 group">
          <div className={`
            absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 transition-all duration-300
            ${event.isActive 
              ? 'bg-[var(--color-section-accent)] border-[var(--color-section-accent)] shadow-[0_0_10px_var(--color-section-accent)]' 
              : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] group-hover:border-[var(--color-section-accent)]'
            }
          `} />

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs font-medium tracking-wider text-[var(--color-section-accent)] uppercase">
              {event.date}
            </span>
            <h3 className={`font-heading text-lg font-medium ${event.isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'}`}>
              {event.title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
