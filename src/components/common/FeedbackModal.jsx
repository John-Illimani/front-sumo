import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

export const FeedbackModal = ({
  isOpen,
  onClose,
  title = "Operación Exitosa",
  message = "El registro se procesó correctamente.",
  type = "success",
  buttonText = "Entendido",
}) => {
  const [render, setRender] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const timer = setTimeout(() => setVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!render) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      glowColor: "bg-emerald-500/20",
      btnBg: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-700/25",
    },
    error: {
      icon: AlertCircle,
      badge: "bg-red-500/10 text-red-600 border-red-500/20",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      glowColor: "bg-red-500/20",
      btnBg: "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-700/25",
    },
    info: {
      icon: Info,
      badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
      glowColor: "bg-amber-500/20",
      btnBg: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-orange-700/25",
    },
  }[type] || config.success;

  const Icon = config.icon;

  const modalContent = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Animaciones Clave */}
      <style>{`
        @keyframes modalPopIn {
          0% { opacity: 0; transform: scale(0.9) translateY(8px); }
          65% { opacity: 1; transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconBounce {
          0% { transform: scale(0.4) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); }
        }
        .animate-modal-pop {
          animation: modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-icon-bounce {
          animation: iconBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both;
        }
      `}</style>

      {/* Backdrop con Blur que cubre toda la pantalla */}
      <div
        className={`fixed inset-0 w-screen h-screen bg-[#0B1120]/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Tarjeta Modal Centrada */}
      <div
        className={` relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/95 p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300  my-auto ${
          visible ? "animate-modal-pop" : "opacity-0 scale-95"
        }`}
      >
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${config.glowColor} blur-3xl pointer-events-none`} />
        <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-orange-400/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className={`animate-icon-bounce flex h-20 w-20 items-center justify-center rounded-3xl ${config.iconBg} text-white shadow-xl shadow-slate-900/15 ring-4 ring-white`}>
              <Icon size={38} strokeWidth={2.3} />
            </div>
            <span className={`absolute inset-0 -z-10 rounded-3xl ${config.glowColor} animate-ping opacity-40`} />
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-widest ${config.badge}`}>
            <Sparkles size={13} /> Sistema SUMO
          </span>

          <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h3>

          <p className="mt-2.5 text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className={`mt-7 flex w-full items-center justify-center rounded-2xl py-4 text-sm font-extrabold tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${config.btnBg}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};