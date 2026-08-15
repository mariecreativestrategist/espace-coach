"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  function openModal() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setError("Session expirée, reconnecte-toi.");
      setSaving(false);
      return;
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthError) {
      setError("Mot de passe actuel incorrect.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <>
      <button type="button" onClick={openModal} className="icon-btn" title="Changer mon mot de passe" style={{ width: 34, height: 34, flexShrink: 0 }}>
        <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
          <circle cx="8" cy="15" r="4" />
          <path d="M10.5 12.5L20 3M17 6l3 3M14 9l2 2" />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Changer mon mot de passe" small>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div style={{ fontSize: 12.5, color: "var(--danger)" }}>{error}</div>}
            {success && <div style={{ fontSize: 12.5, color: "var(--accent-green)" }}>Mot de passe mis à jour.</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Fermer
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Changer le mot de passe"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
