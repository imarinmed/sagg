"use client";

import { StaticCharacter } from "@/lib/characterData";

interface LoanEvent {
  episode: string;
  timestamp: string;
  event: string;
  type: "lesson" | "assignment" | "break" | "discovery";
}

interface ScheduleDay {
  day: string;
  classes: string[];
  available: boolean;
}

const mockSchedule: ScheduleDay[] = [
  { day: "Monday", classes: ["History", "Literature", "Physical Education"], available: true },
  { day: "Tuesday", classes: ["Mathematics", "Science", "Art"], available: true },
  { day: "Wednesday", classes: ["History", "Languages", "Physical Education"], available: false },
  { day: "Thursday", classes: ["Mathematics", "Literature", "Science"], available: true },
  { day: "Friday", classes: ["Art", "Languages", "Physical Education"], available: true },
];

const mockLoanEvents: LoanEvent[] = [
  { episode: "S01E01", timestamp: "00:14:32", event: "First feeding incident", type: "discovery" },
  { episode: "S01E03", timestamp: "00:23:15", event: "Bathroom confrontation", type: "lesson" },
  { episode: "S01E05", timestamp: "00:18:45", event: "After-hours detention", type: "assignment" },
];

interface StudentCalendarWidgetProps {
  character: StaticCharacter;
}

export default function StudentCalendarWidget({ character }: StudentCalendarWidgetProps) {
  const isFemaleStudent = character.id === "kiara-natt-och-dag" || 
                         character.id === "elise" || 
                         character.id === "chloe";

  if (!isFemaleStudent) return null;

  const getEventTypeStyle = (type: LoanEvent["type"]) => {
    switch (type) {
      case "discovery":
        return "text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]";
      case "lesson":
        return "text-[var(--blood-crimson)] border-[var(--blood-crimson)]";
      case "assignment":
        return "text-pink-400 border-pink-400";
      default:
        return "text-[var(--color-text-muted)] border-[var(--color-border-subtle)]";
    }
  };

  const getEventTypeLabel = (type: LoanEvent["type"]) => {
    switch (type) {
      case "discovery":
        return "DSC";
      case "lesson":
        return "LSS";
      case "assignment":
        return "ASG";
      default:
        return "BRK";
    }
  };

  return (
    <div className="schedule-widget rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
          Student Schedule
        </h3>
        <span className="text-xs font-mono text-[var(--blood-crimson)] loan-pulse inline-block px-2 py-0.5 rounded bg-red-900/30">
          MONITORED
        </span>
      </div>

      <div className="space-y-2 mb-6">
        <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Weekly Availability
        </h4>
        {mockSchedule.map((day) => (
          <div
            key={day.day}
            className={`p-3 rounded border ${
              day.available
                ? "border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)]/50"
                : "border-red-900/50 bg-red-900/10"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {day.day}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  day.available
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {day.available ? "Available" : "Booked"}
              </span>
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {day.classes.join(" • ")}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--color-border-subtle)]">
        <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Recorded Events
        </h4>
        <div className="space-y-3">
          {mockLoanEvents.map((event, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${getEventTypeStyle(event.type)} bg-opacity-10`}
              style={{ backgroundColor: "rgba(139, 0, 0, 0.1)" }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono opacity-70">{event.episode}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${getEventTypeStyle(event.type)}`}>
                  {getEventTypeLabel(event.type)}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-primary)] mb-1">
                {event.event}
              </p>
              <span className="text-xs text-[var(--color-text-muted)] font-mono">
                @ {event.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] text-center">
        <span className="text-xs text-[var(--color-text-muted)] italic">
          All activities logged for SST analysis
        </span>
      </div>
    </div>
  );
}
