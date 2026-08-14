import type { NavSection } from "@/components/shared/Sidebar";

export const clientNavSections: NavSection[] = [
  {
    items: [
      {
        href: "/client/dashboard",
        label: "Tableau de bord",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" rx="2" />
            <rect x="14" y="3" width="7" height="5" rx="2" />
            <rect x="14" y="12" width="7" height="9" rx="2" />
            <rect x="3" y="16" width="7" height="5" rx="2" />
          </svg>
        ),
      },
      {
        href: "/client/programme",
        label: "Mon programme",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M6.5 6.5l11 11M4 9l3-3 3 3-3 3zM17 15l3-3-3-3-3 3z" />
          </svg>
        ),
      },
      {
        href: "/client/objectifs",
        label: "Objectifs & mensurations",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="0.8" fill="currentColor" />
          </svg>
        ),
      },
      {
        href: "/client/alimentation",
        label: "Plan alimentaire",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M6 2h9l3 3v17H6z" strokeLinejoin="round" />
            <path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2" />
          </svg>
        ),
      },
      {
        href: "/client/questionnaire",
        label: "Questionnaire santé",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M4 12.5l6 6L20 7" />
          </svg>
        ),
      },
      {
        href: "/client/messagerie",
        label: "Messagerie",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/client/rendez-vous",
        label: "Mes rendez-vous",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
            <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
          </svg>
        ),
      },
      {
        href: "/client/factures",
        label: "Mes factures",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1.2-5 3 2.2 3 5 3 5 1 5 3-2.2 3-5 3-5-1-5-3" />
          </svg>
        ),
      },
    ],
  },
];
