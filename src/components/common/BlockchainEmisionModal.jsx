import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Printer, X, ExternalLink, Sparkles } from "lucide-react";

export const BlockchainEmisionModal = ({
  isOpen,
  onClose,
  modalData,
  onConfirmPrint,
}) => {
  const [render, setRender] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  // Manejo de montaje y desmontaje suave (fade-in / fade-out)
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

  // Manejo de tecla Escape y bloqueo de scroll
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

  if (!render || !modalData) return null;

  const { estudiante, hashReal, yaExistia, message } = modalData;

  // Configuración de colores basada en si el registro es nuevo o ya existía
  const theme = yaExistia
    ? {
        badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
        glowColor: "bg-amber-500/20",
        btnBg: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-orange-700/25",
        title: "Certificado Previamente Registrado",
        subtitle: "Verificación por Hash completada",
      }
    : {
        badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
        glowColor: "bg-emerald-500/20",
        btnBg: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-700/25",
        title: "Emisión Exitosa en Blockchain",
        subtitle: "Registro inmutable verificado",
      };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Animaciones CSS personalizadas */}
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

      {/* Backdrop con Blur suave */}
      <div
        className={`fixed inset-0 w-screen h-screen bg-[#0B1120]/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Tarjeta Modal Flotante */}
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/95 p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 z-10 my-auto ${
          visible ? "animate-modal-pop" : "opacity-0 scale-95"
        }`}
      >
        {/* Efectos de resplandor ambiental */}
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${theme.glowColor} blur-3xl pointer-events-none`} />
        <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-slate-200/50 blur-2xl pointer-events-none" />

        {/* Botón de cierre superior */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          {/* Icono animado */}
          <div className="relative mb-4">
            <div className={`animate-icon-bounce flex h-20 w-20 items-center justify-center rounded-3xl ${theme.iconBg} text-white shadow-xl shadow-slate-900/15 ring-4 ring-white`}>
              <ShieldCheck size={40} strokeWidth={2.2} />
            </div>
            <span className={`absolute inset-0 -z-10 rounded-3xl ${theme.glowColor} animate-ping opacity-40`} />
          </div>

          {/* Badge del sistema */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-widest ${theme.badge}`}>
            <Sparkles size={13} /> {theme.subtitle}
          </span>

          {/* Título principal */}
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {theme.title}
          </h3>

          {/* Mensaje Informativo */}
          {message && (
            <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/60 w-full text-center">
              {message}
            </p>
          )}

          {/* Tarjeta con Detalles del Estudiante  */}
          <div className="mt-4 w-full text-left space-y-2 bg-gradient-to-br from-slate-50 to-orange-50/30 p-4 sm:p-5 rounded-2xl border border-orange-100/80 text-xs text-slate-700">
            <div className="flex justify-between border-b border-orange-100/60 pb-1.5">
              <span className="font-semibold text-slate-500">Estudiante:</span>
              <span className="font-bold text-slate-900 uppercase">{estudiante?.nombres}</span>
            </div>
            <div className="flex justify-between border-b border-orange-100/60 pb-1.5">
              <span className="font-semibold text-slate-500">C.I.:</span>
              <span className="font-bold text-slate-900">{estudiante?.ci}</span>
            </div>
            <div className="flex justify-between border-b border-orange-100/60 pb-1.5">
              <span className="font-semibold text-slate-500">Programa:</span>
              <span className="font-bold text-slate-900 text-right uppercase">{estudiante?.programa}</span>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-[11px]">Hash Transacción / Blockchain:</span>
                
              </div>
              <span className="block font-mono text-[10px] font-medium text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200/80 shadow-inner">
                {hashReal || "Hash no registrado"}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row w-full items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            >
              Cerrar sin Imprimir
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmPrint();
                onClose();
              }}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${theme.btnBg}`}
            >
              <Printer size={16} />
              Imprimir / Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};