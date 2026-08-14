"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";

export default function AdminReglagesPage() {
  const showToast = useToast();
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <PageShell title="Paramètres" subtitle="Gérez votre profil et vos préférences" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="settings-stack">
        <div className="card">
          <div className="card-header">
            <h3>Profil coach</h3>
          </div>
          <div className="card-body">
            <div className="profile-row">
              <div className="avatar-lg">MG</div>
              <button className="btn btn-ghost btn-sm" type="button">
                Changer la photo
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" defaultValue="Marie Guillard" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue="marie@creativestrategist.fr" />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" defaultValue="06 00 00 00 00" />
              </div>
              <div className="form-group">
                <label>Spécialité</label>
                <input type="text" defaultValue="Coaching sportif & remise en forme" />
              </div>
              <div className="form-group full">
                <label>Bio publique</label>
                <textarea defaultValue="Coach sportif certifiée, spécialisée en prise de masse et remise en forme. Accompagnement 100% personnalisé, en visio ou en présentiel." />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Sécurité</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group full">
                <label>Mot de passe actuel</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="setting-row" style={{ marginTop: 6 }}>
              <div>
                <div className="setting-row-title">Authentification à deux facteurs</div>
                <div className="setting-row-sub">Sécurise l&apos;accès à votre espace admin</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
                <span className="track">
                  <span className="thumb" />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn btn-ghost" type="button">
            Annuler
          </button>
          <button className="btn btn-primary" type="button" onClick={() => showToast("Modifications enregistrées")}>
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </PageShell>
  );
}
