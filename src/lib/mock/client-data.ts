/**
 * Données de démonstration pour l'espace client — reprises de la maquette
 * de référence (point de vue de la cliente Lisa Carion). À remplacer par
 * des requêtes Supabase scopées à l'utilisateur connecté une fois le
 * projet connecté.
 */

export interface ClientGoal {
  id: number;
  title: string;
  progress: number;
}

export interface ClientWorkoutExercise {
  name: string;
  sets: string;
}

export interface ClientWorkout {
  id: number;
  name: string;
  day: string;
  week: string;
  done: boolean;
  exercises: ClientWorkoutExercise[];
  comment: string;
}

export interface ClientPhoto {
  id: number;
  name: string;
  date: string;
}

export type HealthQuestionType = "select" | "textarea";

export interface ClientHealthQuestion {
  id: number;
  label: string;
  type: HealthQuestionType;
  options?: string[];
  value: string;
}

export const profile = {
  name: "Lisa Carion",
  initials: "LC",
  program: "Prise de masse",
  coachName: "Marie Guillard",
  coachInitials: "MG",
  physique: { height: 165, startWeight: 58, currentWeight: 61, targetWeight: 64 },
};

export const goalsSeed: ClientGoal[] = [
  { id: 1, title: "Atteindre 65kg au squat 5x5", progress: 80 },
  { id: 2, title: "Perdre 3kg de masse grasse", progress: 45 },
];

export const workoutsSeed: ClientWorkout[] = [
  {
    id: 1, name: "Séance Jambes", day: "Lundi", week: "Semaine 1", done: true, comment: "",
    exercises: [
      { name: "Squat", sets: "5x5 60kg" }, { name: "Leg press", sets: "4x10" }, { name: "Fentes marchées", sets: "3x12" }, { name: "Mollets", sets: "4x15" },
    ],
  },
  {
    id: 2, name: "Séance Push", day: "Mercredi", week: "Semaine 1", done: true, comment: "",
    exercises: [
      { name: "Développé couché", sets: "4x8" }, { name: "Dips", sets: "3x10" }, { name: "Élévations latérales", sets: "3x15" },
    ],
  },
  {
    id: 3, name: "Séance Jambes", day: "Lundi", week: "Semaine 2", done: false, comment: "Charge en hausse par rapport à la semaine 1.",
    exercises: [
      { name: "Squat", sets: "5x5 65kg" }, { name: "Leg press", sets: "4x10" }, { name: "Fentes marchées", sets: "3x12" }, { name: "Mollets", sets: "4x15" },
    ],
  },
];

export const photosSeed: ClientPhoto[] = [
  { id: 1, name: "lisa_face_01-07.jpg", date: "01 juil." },
  { id: 2, name: "lisa_profil_01-08.jpg", date: "01 août" },
];

export const healthQuestionsSeed: ClientHealthQuestion[] = [
  { id: 1, label: "Aval médical pour le sport", type: "select", options: ["Oui", "Non", "Non renseigné"], value: "Oui" },
  { id: 2, label: "Fumeur", type: "select", options: ["Oui", "Non", "Non renseigné"], value: "Non" },
  { id: 3, label: "Niveau d'activité avant le coaching", type: "select", options: ["Sédentaire", "Modéré", "Actif", "Non renseigné"], value: "Modéré" },
  { id: 4, label: "Antécédents médicaux", type: "textarea", value: "RAS" },
  { id: 5, label: "Blessures actuelles ou passées", type: "textarea", value: "Légère gêne à l'épaule droite (ancienne luxation)" },
  { id: 6, label: "Traitement médical en cours", type: "textarea", value: "Aucun" },
  { id: 7, label: "Contre-indications à l'effort", type: "textarea", value: "Éviter les charges lourdes en développé militaire" },
];

export type ExerciseMedia = { type: "video" | "image"; name: string } | null;

export const exerciseMedia: Record<string, ExerciseMedia> = {
  Squat: null,
  "Leg press": null,
  "Développé couché": { type: "video", name: "developpe_couche.mp4" },
  Tractions: null,
  "Rowing barre": null,
  "Développé militaire": null,
  "Fentes marchées": { type: "image", name: "fentes_marchees.jpg" },
  Mollets: null,
  Gainage: null,
  Deadlift: { type: "video", name: "deadlift_technique.mp4" },
  Dips: null,
  "Élévations latérales": null,
  "Vélo / Cardio": null,
};

export const measurementHistory = [
  { date: "01 juil.", weight: "58 kg", waist: "68 cm", chest: "88 cm", arm: "26 cm", thigh: "52 cm" },
  { date: "01 août", weight: "61 kg", waist: "67 cm", chest: "90 cm", arm: "27 cm", thigh: "53 cm" },
];

export const nutritionFile = {
  name: "plan_alimentaire_lisa_aout.pdf",
  updatedLabel: "Mis à jour le 01 août 2026",
};

export const upcomingAppointments = [
  { title: "Séance coaching", label: "Lundi 11 août · 09:00 · Visio" },
  { title: "Séance coaching", label: "Mercredi 13 août · 18:00 · Présentiel" },
];

export const appointmentHistory = [
  { title: "Séance coaching", label: "Vendredi 08 août", status: "Réalisée", badge: "badge-green" },
  { title: "Séance coaching", label: "Mercredi 06 août", status: "Réalisée", badge: "badge-green" },
  { title: "RDV bilan mensuel", label: "Lundi 04 août", status: "Manquée", badge: "badge-danger" },
];

export const invoicesSeed = [
  { id: "INV-0142", label: "Abonnement mensuel", date: "05 août 2026", amount: "89€" },
  { id: "INV-0118", label: "Abonnement mensuel", date: "05 juillet 2026", amount: "89€" },
  { id: "INV-0095", label: "Bilan + programme initial", date: "10 juin 2026", amount: "120€" },
];

export function calcWeightProgress(start: number, current: number, target: number): number {
  if (start === target) return 0;
  let pct = ((current - start) / (target - start)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  return Math.round(pct);
}
