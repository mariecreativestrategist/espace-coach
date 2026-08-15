/**
 * Données de démonstration pour l'espace admin — reprises des maquettes
 * de référence. À remplacer par des requêtes Supabase une fois le projet
 * connecté (voir supabase/migrations/0001_init.sql pour le schéma cible).
 */

export type ClientStatut = "Actif" | "En pause" | "Archivé";

export interface Goal {
  id: string;
  title: string;
  progress: number;
}

export interface WorkoutExercise {
  name: string;
  sets: string;
}

export interface Workout {
  id: string;
  name: string;
  day: string;
  week: string;
  exercises: WorkoutExercise[];
  comment: string;
}

export interface Physique {
  height: number | null;
  startWeight: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
}

export interface NutritionFile {
  name: string;
  url?: string;
}

export interface Measurement {
  id: string;
  date: string;
  values: Record<string, number | string>;
}

export interface ClientPhoto {
  id: string;
  name: string;
  date: string;
}

export type HealthQuestionType = "text" | "textarea" | "select";

export interface HealthQuestion {
  id: string;
  label: string;
  type: HealthQuestionType;
  options?: string[];
  value: string;
}

export interface Client {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  status: ClientStatut;
  progress: number;
  lastSession: string;
  sessions: number;
  notes: string;
  goals: Goal[];
  workouts: Workout[];
  physique: Physique;
  nutritionFile: NutritionFile | null;
  measurementFields: string[];
  measurements: Measurement[];
  photos: ClientPhoto[];
  healthQuestions: HealthQuestion[];
}

export interface MeasurementField {
  key: string;
  label: string;
  unit: string;
}

export type ExerciseMedia = { type: "video" | "image"; name: string } | null;

export interface ExerciseItem {
  id: number;
  name: string;
  group: string;
  description: string;
  media: ExerciseMedia;
}

export type AppointmentType = "" | "rdv" | "bilan";
export type AppointmentStatus = "prevue" | "realisee" | "manquee";

export interface Appointment {
  id: number;
  day: number;
  slot: number;
  time: string;
  text: string;
  type: AppointmentType;
  status: AppointmentStatus;
}

export type TaskPriority = "normal" | "urgent";

export interface AdminTask {
  id: number;
  text: string;
  done: boolean;
  priority: TaskPriority;
  due: string;
}

export type InvoiceStatus = "attente" | "payee" | "retard";

export interface Invoice {
  id: string;
  client: string;
  service: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  attachment?: { type: "file" | "link"; label: string } | null;
}

export function defaultHealthQuestions(): HealthQuestion[] {
  return [
    { id: "1", label: "Aval médical pour le sport", type: "select", options: ["Oui", "Non", "Non renseigné"], value: "Non renseigné" },
    { id: "2", label: "Fumeur", type: "select", options: ["Oui", "Non", "Non renseigné"], value: "Non renseigné" },
    { id: "3", label: "Niveau d'activité avant le coaching", type: "select", options: ["Sédentaire", "Modéré", "Actif", "Non renseigné"], value: "Non renseigné" },
    { id: "4", label: "Antécédents médicaux", type: "textarea", value: "" },
    { id: "5", label: "Blessures actuelles ou passées", type: "textarea", value: "" },
    { id: "6", label: "Traitement médical en cours", type: "textarea", value: "" },
    { id: "7", label: "Contre-indications à l'effort", type: "textarea", value: "" },
  ];
}

export const measurementCatalogSeed: MeasurementField[] = [
  { key: "weight", label: "Poids", unit: "kg" },
  { key: "waist", label: "Tour de taille", unit: "cm" },
  { key: "chest", label: "Tour de poitrine", unit: "cm" },
  { key: "arm", label: "Tour de bras", unit: "cm" },
  { key: "thigh", label: "Tour de cuisse", unit: "cm" },
  { key: "hips", label: "Tour de hanches", unit: "cm" },
  { key: "calf", label: "Tour de mollet", unit: "cm" },
  { key: "bodyfat", label: "Masse grasse", unit: "%" },
  { key: "muscle", label: "Masse musculaire", unit: "kg" },
];

function withHealth(overrides: Partial<Record<number, string>>): HealthQuestion[] {
  const q = defaultHealthQuestions();
  for (const [idx, value] of Object.entries(overrides)) {
    q[Number(idx)].value = value!;
  }
  return q;
}

export const clientsSeed: Client[] = [
  {
    id: "1", initials: "LC", name: "Lisa Carion", email: "lisa.carion@email.com", phone: "06 12 34 56 78",
    program: "Prise de masse", status: "Actif", progress: 72, lastSession: "08 août", sessions: 12,
    notes: "Très motivée, aime les défis de charge. Attention à l'épaule droite sur les développés.",
    goals: [
      { id: "1", title: "Atteindre 65kg au squat 5x5", progress: 80 },
      { id: "2", title: "Perdre 3kg de masse grasse", progress: 45 },
    ],
    workouts: [
      { id: "1", name: "Séance Jambes", day: "Lundi", week: "Semaine 1", comment: "", exercises: [
        { name: "Squat", sets: "5x5 60kg" }, { name: "Leg press", sets: "4x10" }, { name: "Fentes marchées", sets: "3x12" }, { name: "Mollets", sets: "4x15" },
      ] },
      { id: "2", name: "Séance Push", day: "Mercredi", week: "Semaine 1", comment: "", exercises: [
        { name: "Développé couché", sets: "4x8" }, { name: "Dips", sets: "3x10" }, { name: "Élévations latérales", sets: "3x15" },
      ] },
      { id: "6", name: "Séance Jambes", day: "Lundi", week: "Semaine 2", comment: "Charge en hausse par rapport à la semaine 1.", exercises: [
        { name: "Squat", sets: "5x5 65kg" }, { name: "Leg press", sets: "4x10" }, { name: "Fentes marchées", sets: "3x12" }, { name: "Mollets", sets: "4x15" },
      ] },
    ],
    physique: { height: 165, startWeight: 58, currentWeight: 61, targetWeight: 64 },
    nutritionFile: { name: "plan_alimentaire_lisa_aout.pdf" },
    measurementFields: ["weight", "waist", "chest", "arm", "thigh"],
    measurements: [
      { id: "1", date: "01 juil.", values: { weight: 58, waist: 68, chest: 88, arm: 26, thigh: 52 } },
      { id: "2", date: "01 août", values: { weight: 61, waist: 67, chest: 90, arm: 27, thigh: 53 } },
    ],
    photos: [
      { id: "1", name: "lisa_face_01-07.jpg", date: "01 juil." },
      { id: "2", name: "lisa_profil_01-08.jpg", date: "01 août" },
    ],
    healthQuestions: withHealth({ 0: "Oui", 1: "Non", 2: "Modéré", 3: "RAS", 4: "Légère gêne à l'épaule droite (ancienne luxation)", 5: "Aucun", 6: "Éviter les charges lourdes en développé militaire" }),
  },
  {
    id: "2", initials: "TM", name: "Tom Mercier", email: "tom.mercier@email.com", phone: "06 22 33 44 55",
    program: "Perte de poids", status: "Actif", progress: 45, lastSession: "07 août", sessions: 6, notes: "",
    goals: [{ id: "3", title: "Perdre 5kg avant la rentrée", progress: 30 }],
    workouts: [
      { id: "3", name: "Cardio + gainage", day: "Mardi", week: "Semaine 1", comment: "", exercises: [
        { name: "Vélo / Cardio", sets: "30 min" }, { name: "Gainage", sets: "3x1 min" }, { name: "Mountain climbers", sets: "3x20" },
      ] },
    ],
    physique: { height: 178, startWeight: 92, currentWeight: 87, targetWeight: 80 },
    nutritionFile: null,
    measurementFields: ["weight", "waist", "chest", "arm", "thigh"],
    measurements: [{ id: "3", date: "15 juil.", values: { weight: 92, waist: 98, chest: 102, arm: 32, thigh: 58 } }],
    photos: [],
    healthQuestions: withHealth({ 0: "Oui", 1: "Non", 2: "Sédentaire", 3: "Léger surpoids" }),
  },
  {
    id: "3", initials: "SB", name: "Sarah Ben", email: "sarah.ben@email.com", phone: "06 33 44 55 66",
    program: "Powerlifting", status: "Actif", progress: 88, lastSession: "08 août", sessions: 21, notes: "",
    goals: [
      { id: "4", title: "Squat à 100kg", progress: 90 },
      { id: "5", title: "Deadlift à 130kg", progress: 70 },
    ],
    workouts: [
      { id: "4", name: "Séance Force", day: "Lundi", week: "Semaine 1", comment: "", exercises: [
        { name: "Squat", sets: "5x3 92kg" }, { name: "Deadlift", sets: "3x5 110kg" }, { name: "Développé couché", sets: "4x5 60kg" },
      ] },
    ],
    physique: { height: 170, startWeight: 70, currentWeight: 72, targetWeight: 74 },
    nutritionFile: { name: "plan_nutrition_sarah.pdf" },
    measurementFields: ["weight", "waist", "chest", "arm", "thigh"],
    measurements: [{ id: "4", date: "01 août", values: { weight: 72, waist: 71, chest: 94, arm: 29, thigh: 56 } }],
    photos: [],
    healthQuestions: withHealth({ 0: "Oui", 1: "Non", 2: "Actif", 3: "RAS" }),
  },
  {
    id: "4", initials: "JD", name: "Julie Dorval", email: "julie.dorval@email.com", phone: "06 44 55 66 77",
    program: "Remise en forme", status: "En pause", progress: 20, lastSession: "28 juil.", sessions: 2, notes: "",
    goals: [], workouts: [],
    physique: { height: 162, startWeight: 68, currentWeight: 68, targetWeight: 62 },
    nutritionFile: null,
    measurementFields: ["weight", "waist", "hips"],
    measurements: [], photos: [],
    healthQuestions: defaultHealthQuestions(),
  },
  {
    id: "5", initials: "MF", name: "Marc Ferreira", email: "marc.ferreira@email.com", phone: "06 55 66 77 88",
    program: "Prise de masse", status: "Actif", progress: 60, lastSession: "06 août", sessions: 15, notes: "",
    goals: [{ id: "6", title: "Prise de 4kg de muscle", progress: 55 }],
    workouts: [
      { id: "5", name: "Séance Dos", day: "Jeudi", week: "Semaine 1", comment: "", exercises: [
        { name: "Tractions", sets: "4x8" }, { name: "Rowing barre", sets: "4x10" }, { name: "Tirage vertical", sets: "3x12" },
      ] },
    ],
    physique: { height: 180, startWeight: 75, currentWeight: 78, targetWeight: 82 },
    nutritionFile: null,
    measurementFields: ["weight", "waist", "chest", "arm", "thigh"],
    measurements: [{ id: "5", date: "20 juil.", values: { weight: 75, waist: 80, chest: 98, arm: 33, thigh: 57 } }],
    photos: [],
    healthQuestions: withHealth({ 0: "Oui", 1: "Non", 2: "Modéré", 3: "RAS" }),
  },
  {
    id: "6", initials: "ER", name: "Emma Roy", email: "emma.roy@email.com", phone: "06 66 77 88 99",
    program: "Cardio", status: "Archivé", progress: 100, lastSession: "12 juin", sessions: 30, notes: "",
    goals: [{ id: "7", title: "Marathon de Paris terminé", progress: 100 }], workouts: [],
    physique: { height: 167, startWeight: 60, currentWeight: 58, targetWeight: 58 },
    nutritionFile: null,
    measurementFields: ["weight", "waist"],
    measurements: [], photos: [],
    healthQuestions: withHealth({ 0: "Oui", 1: "Non", 2: "Actif" }),
  },
];

export const exercisesSeed: ExerciseItem[] = [
  { id: 1, name: "Squat", group: "Jambes", description: "Barre sur le haut du dos, descente contrôlée jusqu'à la parallèle.", media: null },
  { id: 2, name: "Développé couché", group: "Pectoraux", description: "Barre ou haltères, coudes à 45°, contrôle à la descente.", media: { type: "video", name: "developpe_couche.mp4" } },
  { id: 3, name: "Tractions", group: "Dos", description: "Prise pronation ou supination, amplitude complète.", media: null },
  { id: 4, name: "Rowing barre", group: "Dos", description: "Buste penché à 45°, tirage vers le nombril.", media: null },
  { id: 5, name: "Développé militaire", group: "Épaules", description: "Debout ou assis, barre ou haltères.", media: null },
  { id: 6, name: "Fentes marchées", group: "Jambes", description: "Pas alternés, genou avant à 90°.", media: { type: "image", name: "fentes_marchees.jpg" } },
  { id: 7, name: "Gainage", group: "Core", description: "Planche ventrale, dos plat, isométrique.", media: null },
  { id: 8, name: "Deadlift", group: "Full Body", description: "Dos neutre, poussée dans les talons.", media: { type: "video", name: "deadlift_technique.mp4" } },
  { id: 9, name: "Dips", group: "Pectoraux", description: "Barres parallèles, buste légèrement incliné.", media: null },
  { id: 10, name: "Vélo / Cardio", group: "Cardio", description: "Séance continue ou fractionnée selon l'objectif.", media: null },
];

export const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const dayNums = [4, 5, 6, 7, 8, 9, 10];
export const slots = ["9h", "11h", "14h", "17h"];

export const appointmentsSeed: Appointment[] = [
  { id: 1, day: 0, slot: 0, time: "09:00", text: "Lisa C. — Coaching", type: "", status: "realisee" },
  { id: 2, day: 2, slot: 0, time: "09:30", text: "Bilan — Marc F.", type: "bilan", status: "prevue" },
  { id: 3, day: 4, slot: 0, time: "09:00", text: "Sarah B. — Coaching", type: "", status: "prevue" },
  { id: 4, day: 1, slot: 1, time: "11:00", text: "Marc F. — Coaching", type: "", status: "realisee" },
  { id: 5, day: 3, slot: 1, time: "11:30", text: "Bilan — Tom M.", type: "bilan", status: "manquee" },
  { id: 6, day: 0, slot: 2, time: "14:00", text: "RDV découverte — Nina", type: "rdv", status: "realisee" },
  { id: 7, day: 2, slot: 2, time: "14:00", text: "Sarah B. — Coaching", type: "", status: "prevue" },
  { id: 8, day: 4, slot: 2, time: "14:00", text: "Sarah B. — Coaching", type: "", status: "prevue" },
  { id: 9, day: 1, slot: 3, time: "17:00", text: "RDV découverte — Léo", type: "rdv", status: "manquee" },
  { id: 10, day: 4, slot: 3, time: "17:15", text: "RDV découverte — Julie", type: "rdv", status: "prevue" },
];

export const tasksSeed: AdminTask[] = [
  { id: 1, text: "Programme de Lisa mis à jour", done: true, priority: "normal", due: "08 août" },
  { id: 2, text: "Relancer Marc pour le paiement", done: false, priority: "urgent", due: "10 août" },
  { id: 3, text: "Préparer le bilan de Tom", done: false, priority: "normal", due: "11 août" },
  { id: 4, text: "Valider le nouveau créneau de Julie", done: false, priority: "normal", due: "09 août" },
  { id: 5, text: "Répondre aux nouveaux prospects Instagram", done: false, priority: "urgent", due: "09 août" },
  { id: 6, text: "Envoyer les factures du mois", done: true, priority: "normal", due: "05 août" },
];

export const invoicesSeed: Invoice[] = [
  { id: "INV-0143", client: "Julie Dorval", service: "Abonnement mensuel", date: "06 août 2026", amount: 89, status: "attente" },
  { id: "INV-0142", client: "Lisa Carion", service: "Abonnement mensuel", date: "05 août 2026", amount: 89, status: "payee" },
  { id: "INV-0138", client: "Marc Ferreira", service: "Pack 10 séances", date: "28 juillet 2026", amount: 450, status: "retard" },
  { id: "INV-0137", client: "Sarah Ben", service: "Abonnement trimestriel", date: "25 juillet 2026", amount: 240, status: "payee" },
  { id: "INV-0135", client: "Tom Mercier", service: "Bilan + programme initial", date: "20 juillet 2026", amount: 120, status: "payee" },
];

/* ---------------- HELPERS ---------------- */

export function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

export function statusBadgeClass(status: ClientStatut): string {
  return status === "Actif" ? "badge-green" : status === "En pause" ? "badge-warning" : "badge-muted";
}

export function calcBMI(weight: number | null, heightCm: number | null): number | null {
  if (!weight || !heightCm) return null;
  const h = heightCm / 100;
  return weight / (h * h);
}

export function calcWeightProgress(start: number | null, current: number | null, target: number | null): number {
  if (!start || !current || !target || start === target) return 0;
  let pct = ((current - start) / (target - start)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  return Math.round(pct);
}

const monthsFR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function formatDateShort(iso: string): string {
  if (!iso) return "Sans échéance";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${monthsFR[m! - 1]}`;
}

export function formatDateFR(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthsFR[m! - 1]} ${y}`;
}

export function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR") + "€";
}

export function invStatusLabel(s: InvoiceStatus): string {
  return s === "payee" ? "Payée" : s === "attente" ? "En attente" : "En retard";
}

export function invStatusClass(s: InvoiceStatus): string {
  return s === "payee" ? "badge-green" : s === "attente" ? "badge-warning" : "badge-danger";
}

export function clientStatusToDb(s: ClientStatut): "actif" | "en_pause" | "archivé" {
  return s === "Actif" ? "actif" : s === "En pause" ? "en_pause" : "archivé";
}

export function clientStatusFromDb(s: "actif" | "en_pause" | "archivé"): ClientStatut {
  return s === "actif" ? "Actif" : s === "en_pause" ? "En pause" : "Archivé";
}
