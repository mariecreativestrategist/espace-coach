import type { NavSection } from "@/components/shared/Sidebar";

export const adminNavSections: NavSection[] = [
  {
    label: "Général",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
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
        href: "/admin/clients",
        label: "Clients",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            <circle cx="17" cy="8" r="2.6" />
            <path d="M15 14.2c2.6.4 4.5 2.6 4.5 5.3" />
          </svg>
        ),
      },
      {
        href: "/admin/messagerie",
        label: "Messagerie",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/admin/planning",
        label: "Planning",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
            <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
          </svg>
        ),
      },
      {
        href: "/admin/exercices",
        label: "Exercices",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M6.5 6.5l11 11M4 9l3-3 3 3-3 3zM17 15l3-3-3-3-3 3z" />
          </svg>
        ),
      },
      {
        href: "/admin/todo",
        label: "To-do list",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="M4.5 6l1 1 2-2M4.5 12l1 1 2-2M4.5 18l1 1 2-2" />
          </svg>
        ),
      },
      {
        href: "/admin/administratif",
        label: "Administratif",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M6 2.5h9l3 3V21.5H6z" strokeLinejoin="round" />
            <path d="M9.5 10h5M9.5 13.5h5M9.5 17h3" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Compte",
    items: [
      {
        href: "/admin/reglages",
        label: "Réglages",
        icon: (
          <svg className="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 13a7.7 7.7 0 000-2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 00-1.7-1L15 3h-6l-.4 2.4a7.6 7.6 0 00-1.7 1l-2.3-.9-2 3.4L4.6 11a7.7 7.7 0 000 2l-2 1.5 2 3.4 2.3-.9c.5.4 1.1.8 1.7 1L9 21h6l.4-2.4c.6-.2 1.2-.6 1.7-1l2.3.9 2-3.4-2-1.5z" />
          </svg>
        ),
      },
    ],
  },
];
