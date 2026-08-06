"use client";

import { LoaderCircle, X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  tone?: "danger" | "success" | "default";
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  loading = false,
  tone = "default",
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  const confirmClass =
    tone === "danger"
      ? "border-plur-red/40 bg-plur-red text-white shadow-[0_12px_30px_rgba(255,70,85,0.25)]"
      : tone === "success"
        ? "border-plur-green/40 bg-plur-green text-black shadow-[0_12px_30px_rgba(67,231,164,0.2)]"
        : "border-cyan-400/40 bg-cyan-400 text-black shadow-[0_12px_30px_rgba(34,211,238,0.2)]";

  const iconClass =
    tone === "danger"
      ? "bg-plur-red/10 text-plur-red"
      : tone === "success"
        ? "bg-plur-green/10 text-plur-green"
        : "bg-cyan-400/10 text-cyan-300";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={() => {
          if (!loading) {
            onCancel();
          }
        }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
      />

      <section className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-plur-border bg-plur-card shadow-[0_30px_100px_rgba(0,0,0,0.65)] animate-[modalIn_220ms_ease-out]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-plur-red/15 blur-3xl" />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
            >
              {icon}
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-plur-border bg-plur-bg text-plur-muted transition hover:border-plur-red/40 hover:text-white disabled:opacity-50"
            >
              <X size={17} />
            </button>
          </div>

          <h2
            id="confirm-modal-title"
            className="mt-5 font-rajdhani text-2xl font-black text-white"
          >
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-plur-muted">
            {description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="h-11 rounded-xl border border-plur-border bg-plur-bg text-xs font-bold text-plur-muted transition hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
            >
              {loading && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {loading ? "İşleniyor..." : confirmText}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}