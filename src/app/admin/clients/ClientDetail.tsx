"use client";

import { useState } from "react";
import { statusBadgeClass, type Client, type MeasurementField } from "@/lib/mock/admin-data";
import { ApercuTab } from "./tabs/ApercuTab";
import { ObjectifsTab } from "./tabs/ObjectifsTab";
import { SeancesTab } from "./tabs/SeancesTab";
import { MensurationsTab } from "./tabs/MensurationsTab";
import { SanteTab } from "./tabs/SanteTab";
import { AlimentationTab } from "./tabs/AlimentationTab";

const tabs: [string, string][] = [
  ["apercu", "Aperçu"],
  ["sante", "Questionnaire santé"],
  ["mensurations", "Mensurations"],
  ["objectifs", "Objectifs"],
  ["alimentation", "Plan alimentaire"],
  ["seances", "Séances"],
];

export function ClientDetail({
  client,
  onUpdate,
  onBack,
  onEdit,
  onMessage,
  measurementCatalog,
  onAddCustomField,
  counters,
  bumpCounter,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
  onBack: () => void;
  onEdit: () => void;
  onMessage: () => void;
  measurementCatalog: MeasurementField[];
  onAddCustomField: (field: MeasurementField) => void;
  counters: { goal: number; workout: number; measure: number; photo: number; question: number };
  bumpCounter: (key: keyof typeof counters) => void;
}) {
  const [tab, setTab] = useState("apercu");

  return (
    <>
      <button className="btn btn-ghost btn-sm" type="button" onClick={onBack}>
        <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour aux clients
      </button>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="avatar-lg">{client.initials}</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 19, fontWeight: 700 }}>{client.name}</div>
                <span className={`badge ${statusBadgeClass(client.status)}`}>{client.status}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
                {client.program || "Programme non défini"} · {client.email} · {client.phone}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={onMessage}>
                Message
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={onEdit}>
                Modifier la fiche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        {tabs.map(([key, label]) => (
          <div key={key} className={`filter-pill${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>
            {label}
          </div>
        ))}
      </div>

      <div>
        {tab === "apercu" && <ApercuTab client={client} onUpdate={onUpdate} />}
        {tab === "sante" && (
          <SanteTab client={client} onUpdate={onUpdate} nextQuestionId={counters.question} onQuestionIdUsed={() => bumpCounter("question")} />
        )}
        {tab === "mensurations" && (
          <MensurationsTab
            client={client}
            onUpdate={onUpdate}
            measurementCatalog={measurementCatalog}
            onAddCustomField={onAddCustomField}
            nextMeasureId={counters.measure}
            onMeasureIdUsed={() => bumpCounter("measure")}
            nextPhotoId={counters.photo}
            onPhotoIdUsed={() => bumpCounter("photo")}
          />
        )}
        {tab === "objectifs" && (
          <ObjectifsTab client={client} onUpdate={onUpdate} nextGoalId={counters.goal} onGoalIdUsed={() => bumpCounter("goal")} />
        )}
        {tab === "alimentation" && <AlimentationTab client={client} onUpdate={onUpdate} />}
        {tab === "seances" && (
          <SeancesTab client={client} onUpdate={onUpdate} nextWorkoutId={counters.workout} onWorkoutIdUsed={() => bumpCounter("workout")} />
        )}
      </div>
    </>
  );
}
