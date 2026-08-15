"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { createClient } from "@/lib/supabase/client";

export default function AdminReglagesPage() {
  const showToast = useToast();
  const [twoFactor, setTwoFactor] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  async function savePassword() {
    setPasswordError(null);

    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setSavingPassword(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setPasswordError("Session expirée, reconnecte-toi.");
      setSavingPassword(false);
      return;
    }

    // Vérifie le mot de passe actuel avant d'appliquer le changement.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthError) {
      setPasswordError("Mot de passe actuel incorrect.");
      setSavingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Mot de passe mis à jour");
  }

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
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {passwordError && (
              <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 10 }}>{passwordError}</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" type="button" onClick={savePassword} disabled={savingPassword}>
                {savingPassword ? "Enregistrement…" : "Changer le mot de passe"}
              </button>
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
          <button className="btn btn-primary" type="button" onClick={() => showToast("Profil enregistré")}>
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </PageShell>
  );
}
