import { LOGO_IMAGE_PATH, SITE_NAME } from "@/lib/config";

/**
 * Logo du site — si LOGO_IMAGE_PATH est configuré (voir src/lib/config.ts),
 * affiche cette image ; sinon affiche le symbole par défaut dans son
 * cadre en dégradé signature. Utilisé sur fond sombre (sidebar) comme
 * sur fond clair (écran de connexion) : une image custom doit rester
 * lisible dans les deux cas.
 */
export function BrandMark() {
  if (LOGO_IMAGE_PATH) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={LOGO_IMAGE_PATH} alt={SITE_NAME} className="brand-logo-img" />;
  }

  return (
    <div className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
