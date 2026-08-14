"use client";

import { useToast } from "@/components/shared/ToastProvider";
import { exerciseMedia, type ClientWorkoutExercise } from "@/lib/mock/client-data";

export function ExerciseLine({ ex }: { ex: ClientWorkoutExercise }) {
  const showToast = useToast();
  const media = exerciseMedia[ex.name];

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      • {ex.name}
      {ex.sets ? ` — ${ex.sets}` : ""}
      {media && (
        <button
          type="button"
          onClick={() => showToast(`Aperçu : ${media.name}`)}
          style={{ background: "none", border: "none", padding: 0, marginLeft: 7, color: "var(--accent-green)", cursor: "pointer", display: "inline-flex", verticalAlign: "middle" }}
        >
          {media.type === "video" ? (
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <path d="M4 4h13v16H4z" strokeLinejoin="round" />
              <path d="M17 9l4-2v10l-4-2" />
            </svg>
          ) : (
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="1.5" />
              <path d="M21 16l-5-5-4 4-3-3-5 5" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
