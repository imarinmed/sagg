import React from 'react';

interface SectionNumberProps {
  number: string | number;
  title: string;
  className?: string;
}

export const SectionNumber = ({
  number,
  title,
  className = '',
}: SectionNumberProps) => {
  const formattedNumber = number.toString().padStart(2, '0');

  return (
    <div className={`flex items-baseline gap-3 border-b border-[var(--color-border-subtle)] pb-2 mb-6 ${className}`}>
      <span className="font-mono text-xl font-bold text-[var(--color-section-accent)]">
        {formattedNumber}
      </span>
      <h2 className="font-heading text-lg font-medium tracking-wide text-[var(--color-text-primary)] uppercase">
        {title}
      </h2>
    </div>
  );
};
