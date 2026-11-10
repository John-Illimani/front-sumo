import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Loader2,
  ShoppingBag,
  Info,
  Upload,
  FileCheck,
  QrCode,
  X,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Printer,
  CreditCard,
  Maximize2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Ban
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { cursosService } from "../../services/admin/cursosService";
import { pagosService } from "../../services/admin/pagosService";
import { facultadesService } from "../../services/admin/facultadesService";
import { qrInstitucionalService } from "../../services/admin/qrInstitucionalService";
import { blockchainBoletaService } from "../../services/admin/blockchainBoletaService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const INK = {
  navy: [11, 17, 32],
  gold: [217, 119, 6],
  slate: [71, 85, 105],
  emerald: [16, 185, 129],
  paper: [250, 248, 242],
  ink: [30, 41, 59],
};

const checkIsActivo = (estado) => {
  if (estado === true || estado === 1) return true;
  if (typeof estado === "string") {
    const lower = estado.toLowerCase().trim();
    return lower === "activo" || lower === "v" || lower === "t" || lower === "true" || lower === "1";
  }
  return false;
};

export const BlockchainEmisionModal = ({ isOpen, onClose, modalData, onConfirmPrint }) => {
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

  if (!render || !modalData) return null;

  const { estudiante, hashReal, yaExistia, message } = modalData;

  const theme = yaExistia
    ? {
        badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
        glowColor: "bg-amber-500/20",
        btnBg: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-orange-700/25",
        title: "Boleta Previamente Registrada",
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

      <div
        className={`fixed inset-0 w-screen h-screen bg-[#0B1120]/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/95 p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 z-10 my-auto ${
          visible ? "animate-modal-pop" : "opacity-0 scale-95"
        }`}
      >
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${theme.glowColor} blur-3xl pointer-events-none`} />
        <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-slate-200/50 blur-2xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className={`animate-icon-bounce flex h-20 w-20 items-center justify-center rounded-3xl ${theme.iconBg} text-white shadow-xl shadow-slate-900/15 ring-4 ring-white`}>
              <ShieldCheck size={40} strokeWidth={2.2} />
            </div>
            <span className={`absolute inset-0 -z-10 rounded-3xl ${theme.glowColor} animate-ping opacity-40`} />
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-widest ${theme.badge}`}>
            <Sparkles size={13} /> {theme.subtitle}
          </span>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {theme.title}
          </h3>

          {message && (
            <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/60 w-full text-center">
              {message}
            </p>
          )}

          <div className="mt-4 w-full text-left space-y-2 bg-gradient-to-br from-slate-50 to-orange-50/30 p-4 sm:p-5 rounded-2xl border border-orange-100/80 text-xs text-slate-700">
            <div className="flex justify-between border-b border-orange-100/60 pb-1.5">
              <span className="font-semibold text-slate-500">Estudiante:</span>
              <span className="font-bold text-slate-900">{estudiante?.nombre} {estudiante?.apellido}</span>
            </div>
            <div className="flex justify-between border-b border-orange-100/60 pb-1.5">
              <span className="font-semibold text-slate-500">C.I.:</span>
              <span className="font-bold text-slate-900">{estudiante?.ci}</span>
            </div>
            <div className="flex justify-between border-b border-orange-100/60 pb-1.5">
              <span className="font-semibold text-slate-500">Monto Abonado:</span>
              <span className="font-bold text-emerald-600">Bs. {Number(estudiante?.monto_abonado || 0).toFixed(2)}</span>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-[11px]">Hash Transacción / Blockchain:</span>
                {hashReal && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${hashReal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Etherscan <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <span className="block font-mono text-[10px] font-medium text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200/80 shadow-inner">
                {hashReal || "Hash no registrado"}
              </span>
            </div>
          </div>

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

const cargarLogoBase64 = (url = "/logo_sumo.png") => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const generarFondoMarcasDeAgua = (logoBase64, ciEstudiante, widthMM, heightMM) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const scale = 3;
    canvas.width = widthMM * 3.78 * scale;
    canvas.height = heightMM * 3.78 * scale;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#FAF8F2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderPattern = (imgObj) => {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((-25 * Math.PI) / 180);

      const rowStep = 75 * scale;
      const colStep = 180 * scale;
      const logoWidth = 28 * scale;
      const logoHeight = 24 * scale;

      ctx.font = `bold ${13 * scale}px Helvetica, Arial, sans-serif`;
      ctx.fillStyle = "#0F172A";

      const startX = -canvas.width * 1.5;
      const endX = canvas.width * 1.5;
      const startY = -canvas.height * 1.5;
      const endY = canvas.height * 1.5;

      for (let y = startY, rowIndex = 0; y < endY; y += rowStep, rowIndex++) {
        const offsetX = (rowIndex % 2) * (colStep / 2);
        for (let x = startX + offsetX; x < endX; x += colStep) {
          if (imgObj) {
            ctx.globalAlpha = 0.16;
            ctx.drawImage(imgObj, x, y, logoWidth, logoHeight);
          }
          ctx.globalAlpha = 0.14;
          ctx.fillText(
            `SUMO  C.I. ${ciEstudiante}`,
            x + logoWidth + 6 * scale,
            y + 17 * scale
          );
        }
      }
      ctx.restore();
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };

    if (logoBase64) {
      const logoImg = new Image();
      logoImg.onload = () => renderPattern(logoImg);
      logoImg.onerror = () => renderPattern(null);
      logoImg.src = logoBase64;
    } else {
      renderPattern(null);
    }
  });
};

export const TomaMateriasEstudiante = () => {
  const [estudianteProfile, setEstudianteProfile] = useState(null);

  const [cursos, setCursos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [miPago, setMiPago] = useState(null);
  
  const [qrsList, setQrsList] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingBoleta, setDownloadingBoleta] = useState(false);

  const [selectedCursoIds, setSelectedCursoIds] = useState([]);
  const [initialCursoIds, setInitialCursoIds] = useState([]);
  const [pagoTab, setPagoTab] = useState("qr");

  // Modales
  const [isConfirmPagoModalOpen, setIsConfirmPagoModalOpen] = useState(false);
  const [medioPago, setMedioPago] = useState("Pago Móvil QR");
  const [conceptoPago, setConceptoPago] = useState("Inscripción y Primera Cuota");
  const [fotoComprobante, setFotoComprobante] = useState(null);
  const [previewComprobante, setPreviewComprobante] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const [blockchainModalState, setBlockchainModalState] = useState({
    isOpen: false,
    modalData: null,
    onConfirmPrint: () => {}
  });

  const showFeedback = (title, message, type = "success") =>
    setModalState({ isOpen: true, title, message, type });

  const closeFeedback = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const authHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const savedUserStr = localStorage.getItem("user");
      let parsedUser = null;
      if (savedUserStr) {
        try {
          parsedUser = JSON.parse(savedUserStr);
        } catch {
          parsedUser = { username: savedUserStr };
        }
      }

      const [cursosRes, facultadesRes, inscripcionesRes, pagosRes, qrsRes, usuariosRes, postulantesRes] = await Promise.all([
        cursosService.getAll().catch(() => []),
        facultadesService.getAll().catch(() => []),
        inscripcionesService.getAll().catch(() => []),
        pagosService.getAll().catch(() => []),
        qrInstitucionalService.getAll().catch(() => []),
        fetch(import.meta.env.VITE_API_URL + "/api/usuarios", { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
        fetch(import.meta.env.VITE_API_URL + "/api/postulantes", { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      ]);

      setCursos(cursosRes);
      setFacultades(facultadesRes);
      setQrsList(qrsRes);

      let currentStudent = parsedUser;
      if (parsedUser && Array.isArray(usuariosRes) && usuariosRes.length > 0) {
        const fullUser = usuariosRes.find(
          (u) => Number(u.usuario_id) === Number(parsedUser.usuario_id || parsedUser.id) ||
                 u.username?.toLowerCase() === String(parsedUser.username || "").toLowerCase()
        );
        if (fullUser) {
          currentStudent = { ...parsedUser, ...fullUser };
        }
      }

      let matchedPostulante = null;
      if (Array.isArray(postulantesRes) && postulantesRes.length > 0) {
        matchedPostulante = postulantesRes.find(
          (p) => Number(p.usuario_id) === Number(currentStudent?.usuario_id || currentStudent?.id)
        );
      }

      if (matchedPostulante) {
        currentStudent = { ...currentStudent, ...matchedPostulante };
      }

      setEstudianteProfile(currentStudent);

      const targetPostulanteId = currentStudent?.postulante_id || currentStudent?.usuario_id || currentStudent?.id;

      // FILTRAR CORRECTAMENTE SIN REPETIDOS NI NULOS
      const inscripcionesMias = Array.isArray(inscripcionesRes) ? inscripcionesRes.filter((ins) => {
        const pId = ins.postulante_id || ins.postulante?.postulante_id;
        const uId = ins.usuario_id || ins.postulante?.usuario_id || ins.usuario?.id;
        
        return (
          (pId && currentStudent?.postulante_id && String(pId) === String(currentStudent.postulante_id)) ||
          (uId && (currentStudent?.usuario_id || currentStudent?.id) && String(uId) === String(currentStudent?.usuario_id || currentStudent?.id)) ||
          (String(ins.postulante_id) === String(targetPostulanteId))
        );
      }) : [];
      
      setMisInscripciones(inscripcionesMias);

      // Usamos Set para eliminar IDs de cursos repetidos y filtramos nulos/inválidos
      const idsActuales = [...new Set(
        inscripcionesMias
          .map((ins) => Number(ins.curso_id))
          .filter((id) => !isNaN(id) && id > 0)
      )];

      setSelectedCursoIds(idsActuales);
      setInitialCursoIds(idsActuales);

      const misInscripcionIds = inscripcionesMias.map((ins) => ins.inscripcion_id);
      const pagoExistente = Array.isArray(pagosRes) ? pagosRes.find((p) => 
        misInscripcionIds.includes(p.inscripcion_id) || String(p.postulante_id) === String(targetPostulanteId)
      ) : null;
      
      // Obtener Hash guardado si es que ya se emitió antes (y evitar que diga PENDIENTE)
      const activeIns = inscripcionesMias[0];
      const hashGuardado = activeIns?.hash_boleta || activeIns?.hash_blockchain || "";

      if (pagoExistente) {
        setMiPago({...pagoExistente, hashBoleta: hashGuardado || pagoExistente.hashBoleta});
        setMedioPago(pagoExistente.medio_pago || "Pago Móvil QR ");
        setConceptoPago(pagoExistente.concepto || "Inscripción y Primera Cuota");
        if (pagoExistente.foto_comprobante || pagoExistente.foto_comprobante_base64) {
          const rawImg = pagoExistente.foto_comprobante_base64 || pagoExistente.foto_comprobante;
          const formattedImg = rawImg.startsWith("data:image") ? rawImg : `data:image/png;base64,${rawImg}`;
          setPreviewComprobante(formattedImg);
        }
      } else {
        setMiPago(null);
        setPreviewComprobante(null);
      }
    } catch (error) {
      showFeedback("Error de Carga", error.message || "No se pudieron sincronizar los datos de la cuenta.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ofertaPorFacultad = useMemo(() => {
    const agrupado = {};
    cursos.forEach((curso) => {
      const facName = curso.facultad?.nombre || "Facultad General";
      if (!agrupado[facName]) agrupado[facName] = [];
      agrupado[facName].push(curso);
    });
    return agrupado;
  }, [cursos]);

  const qrsDisponibles = useMemo(() => {
    return qrsList.filter((item) => Boolean(item.qr_foto_base64 || item.qr_foto));
  }, [qrsList]);

  const cuentasDisponibles = useMemo(() => {
    return qrsList.filter((item) => !item.qr_foto_base64 && !item.qr_foto);
  }, [qrsList]);

  const montoTotalAcumulado = useMemo(() => {
    return selectedCursoIds.reduce((acc, cId) => {
      const curso = cursos.find((c) => Number(c.curso_id) === Number(cId));
      return acc + (curso ? Number(curso.precio_mensual || curso.costo || 450) : 0);
    }, 0);
  }, [selectedCursoIds, cursos]);

  const estaVerificado = useMemo(() => {
    if (!miPago) return false;
    return String(miPago.verificacion || "").toLowerCase().trim() === "verificado";
  }, [miPago]);

  const hayCambiosEnMaterias = useMemo(() => {
    if (selectedCursoIds.length !== initialCursoIds.length) return true;
    const sortedInit = [...initialCursoIds].sort();
    const sortedSel = [...selectedCursoIds].sort();
    return !sortedInit.every((val, index) => val === sortedSel[index]);
  }, [selectedCursoIds, initialCursoIds]);

  // Variables calculadas y extraídas de forma robusta para emparejar con el Admin
  const nombreCompleto = `${estudianteProfile?.nombre || estudianteProfile?.nombres || misInscripciones[0]?.nombre || ''} ${estudianteProfile?.apellido || estudianteProfile?.apellidos || misInscripciones[0]?.apellido || ''}`.trim();
  const ciBoleta = estudianteProfile?.ci || estudianteProfile?.carnet || misInscripciones[0]?.ci || 'S/CI';
  const uuidBoleta = estudianteProfile?.uuid || misInscripciones[0]?.uuid || "";
  const codigoInscripcion = misInscripciones[0]?.codigo_inscripcion || "N/A";
  const turnoEstudiante = misInscripciones[0]?.turno || "Sin Turno";
  const observacionesEstudiante = misInscripciones[0]?.observaciones || "";

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      showFeedback("Archivo no válido", "Selecciona un archivo de imagen válido (PNG, JPG, JPEG)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreviewComprobante(e.target.result);
    reader.readAsDataURL(file);
    setFotoComprobante(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const toggleSeleccionCurso = (cursoId, cursoEstado) => {
    if (!checkIsActivo(cursoEstado)) {
      showFeedback("Curso Inactivo", "Este programa se encuentra actualmente inhabilitado o cerrado.", "error");
      return;
    }

    const numericId = Number(cursoId);
    if (selectedCursoIds.includes(numericId)) {
      setSelectedCursoIds((prev) => prev.filter((id) => id !== numericId));
    } else {
      setSelectedCursoIds((prev) => [...prev, numericId]);
    }
  };

  const handleActualizarMaterias = async () => {
    setSaving(true);
    try {
      const postulanteId = estudianteProfile?.postulante_id || estudianteProfile?.usuario_id || estudianteProfile?.id;
      let activeInsId = misInscripciones[0]?.inscripcion_id;

      if (activeInsId) {
        await inscripcionesService.update(activeInsId, {
          postulante_id: postulanteId,
          curso_id: selectedCursoIds[0] || null,
          cursos_totales: selectedCursoIds
        });
      } else {
        for (let i = 0; i < selectedCursoIds.length; i++) {
          const payloadInscripcion = {
            postulante_id: postulanteId,
            curso_id: selectedCursoIds[i],
            turno: "Mañana"
          };
          await inscripcionesService.create(payloadInscripcion);
        }
      }

      if (miPago?.pago_id) {
        try {
          await pagosService.update(miPago.pago_id, {
            monto: montoTotalAcumulado,
            verificacion: "pendiente",
            estado_pago: "pendiente"
          });
          setMiPago((prev) => ({ ...prev, verificacion: "pendiente", estado_pago: "pendiente", monto_abonado: montoTotalAcumulado }));
        } catch (e) {
          console.warn("No se pudo resetear el pago en BD automáticamente:", e);
        }
      }

      showFeedback(
        "Materias Actualizadas",
        "Tu selección de materias ha sido guardada. Debido a la modificación, el estado de tu pago ahora es 'pendiente' hasta una nueva verificación.",
        "success"
      );

      await fetchData();
    } catch (error) {
      showFeedback("Error al Actualizar", error.message || "No se pudo actualizar la lista de materias.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarPago = async () => {
    if (selectedCursoIds.length === 0) {
      showFeedback("Atención", "Debes tener al menos una materia inscrita para subir un pago.", "error");
      return;
    }

    if (!fotoComprobante && !miPago?.foto_comprobante && !previewComprobante) {
      showFeedback("Comprobante Requerido", "Por favor adjunta la imagen de tu comprobante de pago.", "error");
      return;
    }

    setSaving(true);
    try {
      const postulanteId = estudianteProfile?.postulante_id || estudianteProfile?.usuario_id || estudianteProfile?.id;
      const activeInsId = misInscripciones[0]?.inscripcion_id;

      const formData = new FormData();
      formData.append("inscripcion_id", activeInsId || "");
      formData.append("postulante_id", postulanteId);
      formData.append("monto", montoTotalAcumulado);
      formData.append("monto_abonado", montoTotalAcumulado);
      formData.append("concepto", conceptoPago);
      formData.append("medio_pago", medioPago);
      formData.append("estado_pago", "pendiente");
      formData.append("verificacion", "pendiente");

      if (fotoComprobante instanceof File) {
        formData.append("foto_comprobante", fotoComprobante);
      }


      
          
            

      const token = localStorage.getItem("access_token") || localStorage.getItem("token");

      const response = await fetch(import.meta.env.VITE_API_URL + "/api/pagos", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar el pago en el servidor.");
      }

      const responseData = await response.json();
      const pagoDevuelto = responseData.pago;

      const fotoActualizada = previewComprobante || (pagoDevuelto?.foto_comprobante ? `data:image/png;base64,${pagoDevuelto.foto_comprobante}` : miPago?.foto_comprobante);

      setMiPago({
        ...(pagoDevuelto || miPago || {}),
        foto_comprobante: fotoActualizada,
        foto_comprobante_base64: fotoActualizada,
        verificacion: "pendiente",
        estado_pago: "pendiente",
        monto_abonado: montoTotalAcumulado,
        medio_pago: medioPago,
        concepto: conceptoPago
      });

      setFotoComprobante(null);
      setIsConfirmPagoModalOpen(false);

      showFeedback(
        "Pago Registrado",
        "Tu comprobante de pago ha sido subido correctamente y está en revisión.",
        "success"
      );

      await fetchData();
    } catch (error) {
      showFeedback("Error de Pago", error.message || "No se pudo subir el comprobante de pago.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelarInscripcionesYPago = async () => {
    setSaving(true);
    try {
      const postulanteId = estudianteProfile?.postulante_id || estudianteProfile?.usuario_id || estudianteProfile?.id;

      if (!postulanteId) {
        throw new Error("No se encontró el ID de postulante.");
      }

      await inscripcionesService.cancelarInscripcionesPorPostulante(postulanteId);

      showFeedback("Inscripciones Canceladas", "Se han eliminado tus registros de materias y pagos.", "success");
      setMisInscripciones([]);
      setSelectedCursoIds([]);
      setMiPago(null);
      setFotoComprobante(null);
      setPreviewComprobante(null);
      setIsDeleteModalOpen(false);
      await fetchData();
    } catch (error) {
      showFeedback("Error", error.message || "No se pudieron eliminar los registros.", "error");
    } finally {
      setSaving(false);
    }
  };

  const generarQRDataURL = async () => {
    return new Promise((resolve) => {
      const svgElement = document.getElementById("boleta-qr-svg");
      if (!svgElement) return resolve(null);
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width || 200;
        canvas.height = img.height || 200;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
    });
  };

  const generarPDFBoletaOficial = async (estudianteData, hashReal) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoData = await cargarLogoBase64("/logo_sumo.png");
    const fondoMarcasAguaUrl = await generarFondoMarcasDeAgua(logoData, ciBoleta, pageWidth, pageHeight);

    if (fondoMarcasAguaUrl) {
      doc.addImage(fondoMarcasAguaUrl, "JPEG", 0, 0, pageWidth, pageHeight);
    }

    let currentY = 12;

    if (logoData) {
      doc.addImage(logoData, "PNG", 12, currentY, 32, 16);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...INK.navy);
    doc.text("BOLETA DE PAGO Y CERTIFICADO", pageWidth - 12, currentY + 6, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(...INK.gold);

    currentY += 22;
    doc.setDrawColor(...INK.navy);
    doc.setLineWidth(0.6);
    doc.line(12, currentY, pageWidth - 12, currentY);

    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(...INK.navy);
    doc.text("1. DATOS DEL POSTULANTE Y PROGRAMAS ACADÉMICOS", 12, currentY);

    currentY += 7;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK.ink);

    doc.text(`Nombre Completo: ${nombreCompleto}`, 12, currentY);
    doc.text(`Cédula de Identidad: ${ciBoleta}`, 125, currentY);

    // Recreamos exactamente la estructura de cursos para emparejar el admin
    const facultadesConCursos = {};

    selectedCursoIds.forEach((cId) => {
      const c = cursos.find((item) => Number(item.curso_id) === Number(cId));
      if (c) {
        const facName = c.facultad?.nombre || "Facultad General";
        const courseName = c.nombre || c.codigo;
        if (!facultadesConCursos[facName]) {
          facultadesConCursos[facName] = [];
        }
        if (!facultadesConCursos[facName].includes(courseName)) {
          facultadesConCursos[facName].push(courseName);
        }
      }
    });

    currentY += 6;
    doc.text("Programas Inscritos por Facultad:", 12, currentY);

    let cursosY = currentY + 5;

    Object.entries(facultadesConCursos).forEach(([facultadNombre, listaCursos]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK.navy);
      const lineaFac = doc.splitTextToSize(`${facultadNombre}:`, 185);
      doc.text(lineaFac, 12, cursosY);
      cursosY += (lineaFac.length * 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK.ink);
      listaCursos.forEach((cursoNombre) => {
        const lineasCurso = doc.splitTextToSize(`  • ${cursoNombre}`, 180);
        doc.text(lineasCurso, 12, cursosY);
        cursosY += (lineasCurso.length * 4.5);
      });

      cursosY += 2;
    });

    currentY = Math.max(currentY + 12, cursosY + 2);

    doc.text(`Turno: ${turnoEstudiante}`, 12, currentY);
    doc.text(`Código Inscripción: ${codigoInscripcion}`, 125, currentY);

    if (observacionesEstudiante) {
      currentY += 6;
      const obsLines = doc.splitTextToSize(`Observaciones: ${observacionesEstudiante}`, 190);
      doc.text(obsLines, 12, currentY);
      currentY += (obsLines.length * 4.5);
    }

    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK.navy);
    doc.text("2. DETALLE DE LA TRANSACCIÓN FINANCIERA", 12, currentY);

    currentY += 12;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK.ink);
    doc.text(`Concepto: ${miPago?.concepto || "Abono / Matrícula"}`, 16, currentY);
    doc.text(`Medio de Pago: ${miPago?.medio_pago || "Ventanilla"}`, 125, currentY);

    currentY += 6;
    doc.text(`Fecha de Transacción: ${miPago?.fecha_pago ? miPago.fecha_pago.split("T")[0] : new Date().toISOString().split("T")[0]}`, 16, currentY);
    doc.text(`Estado del Pago: ${miPago?.estado_pago || "Completado"}`, 125, currentY);

    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK.emerald);
    doc.text(`Monto Abonado Consolidado: Bs. ${Number(miPago?.monto_abonado || montoTotalAcumulado).toFixed(2)}`, 16, currentY);

    currentY += 18;
    doc.setFontSize(11);
    doc.setTextColor(...INK.navy);
    doc.text("3. CÓDIGO QR Y VALIDACIÓN DE SEGURIDAD (VINCULADO A SUS CURSOS)", 12, currentY);

    currentY += 6;

    const qrDataUrl = await generarQRDataURL();
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 12, currentY, 38, 38);
    }

    doc.save(`boleta_pago_${ciBoleta}_${(nombreCompleto).split(" ")[0]?.toLowerCase() || "estudiante"}.pdf`);
  };

  const handleCertificarYPreguntarImpresion = async () => {
    if (!estaVerificado) {
      showFeedback("Pago No Verificado", "El pago aún se encuentra en estado 'pendiente'. Solo se permite emitir y descargar la boleta cuando la verificación esté completada.", "error");
      return;
    }

    setDownloadingBoleta(true);
    try {
      const postulanteId = estudianteProfile?.postulante_id || estudianteProfile?.usuario_id || estudianteProfile?.id || misInscripciones[0]?.postulante_id;
      
      // 1. REGLA ESTRICTA DE CURSOS: Obtener nombres, ordenar alfabéticamente y unir (Igual que Admin)
      const nombresCursos = selectedCursoIds.map((cId) => {
        const c = cursos.find((item) => Number(item.curso_id) === Number(cId));
        return c ? (c.nombre || c.codigo) : null;
      }).filter(Boolean);
      
      const stringTodosLosCursos = nombresCursos.sort().join(" | ");

      // 2. REGLA ESTRICTA DE MONTO: Obligatorio 2 decimales en formato string
      const montoFormateado = Number(miPago?.monto_abonado || montoTotalAcumulado).toFixed(2);

      // 3. PAYLOAD EXACTO
      const boletaPayload = {
        postulanteId: postulanteId,
        nombreCompleto: nombreCompleto.trim(), // Evita espacios accidentales
        ci: ciBoleta,
        uuid: uuidBoleta || "", // Envía el UUID o vacío, igual que el admin
        reciboNro: miPago?.recibo_nro || `REC-BCP-2026-${misInscripciones[0]?.inscripcion_id || "000"}`,
        montoAbonado: montoFormateado, 
        concepto: miPago?.concepto || "Pago Presencial",
        medioPago: miPago?.medio_pago || "Ventanilla",
        fechaPago: miPago?.fecha_pago ? miPago.fecha_pago.split("T")[0] : new Date().toISOString().split("T")[0],
        codigoInscripcion: codigoInscripcion,
        curso: stringTodosLosCursos
      };

      const respuesta = await blockchainBoletaService.certificar(boletaPayload);

      const hashReal = respuesta.hashBoletin || respuesta.hash || "0x" + Array(64).fill("0").join("");
      const yaExistia = respuesta.yaExistia || false;
      const messageResponse = respuesta.message || (yaExistia ? "El registro ya se encontraba previamente verificado en la red Blockchain." : "El registro ha sido firmado y almacenado en la red inmutable.");

      // Guardamos en el estado para que el QR reciba su valor
      setMiPago(prev => ({ ...prev, hashBoleta: hashReal }));

      const estudianteModalData = {
        nombre: nombreCompleto.split(" ")[0],
        apellido: nombreCompleto.split(" ").slice(1).join(" "),
        ci: ciBoleta,
        monto_abonado: montoFormateado,
        codigoInscripcion: boletaPayload.codigoInscripcion
      };

      setBlockchainModalState({
        isOpen: true,
        modalData: {
          estudiante: estudianteModalData,
          hashReal: hashReal,
          yaExistia: yaExistia,
          message: messageResponse,
        },
        onConfirmPrint: () => generarPDFBoletaOficial(estudianteModalData, hashReal),
      });

    } catch (err) {
      showFeedback("Error", err.message || "No se pudo certificar la boleta en Blockchain.", "error");
    } finally {
      setDownloadingBoleta(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-orange-50/40 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // --- CÓDIGO QR EXACTO AL DEL ADMINISTRADOR ---
  const hashActualBoleta = miPago?.hashBoleta || "PENDIENTE_HASH";
  const qrContenidoTexto = `NOMBRE: ${nombreCompleto} | CI: ${ciBoleta} | MONTO PAGADO: Bs. ${Number(miPago?.monto_abonado || 0).toFixed(2)} | HASH: ${hashActualBoleta}`;

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-6 p-4 sm:p-8 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40 shadow-sm pb-24">
      
      {/* Contenedor Oculto para que JsPDF lea el SVG */}
      <div className="hidden">
        <QRCodeSVG id="boleta-qr-svg" value={qrContenidoTexto} size={200} level="H" />
      </div>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-orange-200/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Toma de Materias y Estado de Pago
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-0.5">
              PORTAL ESTUDIANTIL · SELECCIÓN, COMPROBANTE Y DESCARGA DE BOLETA
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-orange-200/80 bg-white px-4 py-2.5 shadow-sm">
            <ShoppingBag size={20} className="text-orange-500" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Materias ({selectedCursoIds.length})
              </p>
              <p className="text-sm font-black text-emerald-600">
                Bs. {montoTotalAcumulado.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsConfirmPagoModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95"
          >
            <CreditCard size={18} /> Subir Comprobante de Pago
          </button>
        </div>
      </div>

      {hayCambiosEnMaterias && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-bounce">
          <p className="text-xs font-bold">Has modificado tus materias.</p>
          <button
            type="button"
            onClick={handleActualizarMaterias}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-black shadow-md transition-all"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Actualizar Materias
          </button>
        </div>
      )}

      {miPago && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border ${
          estaVerificado 
            ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
            : miPago.estado_pago === "anulado" || miPago.verificacion === 'rechazado'
            ? "bg-red-50 border-red-300 text-red-900"
            : "bg-amber-50 border-amber-300 text-amber-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white ${
              estaVerificado ? "bg-emerald-600" : (miPago.estado_pago === "anulado" || miPago.verificacion === "rechazado") ? "bg-red-600" : "bg-amber-500"
            }`}>
              {estaVerificado ? <FileCheck size={22} /> : <Clock size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black uppercase flex items-center gap-1.5">
                  Estado de Verificación: {estaVerificado ? "VERIFICADO Y CONFIRMADO" : (miPago.estado_pago === "anulado" || miPago.verificacion === "rechazado") ? "RECHAZADO" : "PENDIENTE DE VERIFICACIÓN"}
                  {estaVerificado ? <ShieldCheck size={16} className="text-emerald-600" /> : <ShieldAlert size={16} className="text-amber-600" />}
                </h4>
                
              </div>
              <p className="text-xs font-medium opacity-80 mt-0.5">
                {estaVerificado 
                  ? "Tu pago ha sido verificado formalmente por secretaría. Puedes proceder con la descarga de tu boleta oficial con validación Blockchain."
                  : "Tu comprobante de pago está pendiente de revisión por el personal autorizado. La boleta se habilitará una vez sea verificado."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(previewComprobante || miPago.foto_comprobante || miPago.foto_comprobante_base64) && (
              <div 
                onClick={() => setLightboxImage(previewComprobante || miPago.foto_comprobante_base64 || miPago.foto_comprobante)}
                className="group relative w-12 h-12 rounded-xl border bg-white overflow-hidden shadow-sm cursor-pointer hover:border-orange-400 shrink-0"
              >
                <img 
                  src={(previewComprobante || miPago.foto_comprobante_base64 || miPago.foto_comprobante).startsWith('data:') 
                    ? (previewComprobante || miPago.foto_comprobante_base64 || miPago.foto_comprobante) 
                    : `data:image/jpeg;base64,${miPago.foto_comprobante}`} 
                  alt="Comprobante Subido" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Maximize2 size={14} />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleCertificarYPreguntarImpresion}
              disabled={!estaVerificado || downloadingBoleta}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                estaVerificado
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none border border-slate-300"
              }`}
            >
              {downloadingBoleta ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )} 
              Descargar Boleta QR / PDF
            </button>

            {!estaVerificado && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-300 bg-white text-red-600 hover:bg-red-50 font-bold text-xs transition-all active:scale-95"
              >
                <Trash2 size={15} /> Cancelar Inscripción
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {Object.keys(ofertaPorFacultad).length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-orange-200">
            <Info size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-600">No hay cursos disponibles para inscripción en este momento.</p>
          </div>
        ) : (
          Object.entries(ofertaPorFacultad).map(([facultadNombre, listaCursos]) => (
            <div key={facultadNombre} className="rounded-2xl border border-orange-200/70 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
                <Building2 className="text-orange-500 shrink-0" size={20} />
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {facultadNombre}
                </h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60 ml-auto">
                  {listaCursos.length} Opciones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 capitalize">
                {listaCursos.map((curso) => {
                  const isSelected = selectedCursoIds.includes(Number(curso.curso_id));
                  const isCursoActivo = checkIsActivo(curso.estado);

                  return (
                    <div
                      key={curso.curso_id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        !isCursoActivo 
                          ? "border-slate-200 bg-slate-100 opacity-70"
                          : isSelected
                            ? "border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-400/20"
                            : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      {!isCursoActivo && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-50/50 backdrop-blur-[1px]">
                          <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                            <Ban size={14} /> Materia Inactiva
                          </span>
                        </div>
                      )}

                      <div className={!isCursoActivo ? "line-through grayscale" : ""}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase text-slate-700">
                            {curso.codigo}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              isCursoActivo
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isCursoActivo ? "Disponible" : "Cerrado"}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                          {curso.nombre}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">
                          Docente: {curso.docente ? `${curso.docente.nombre} ${curso.docente.apellido}` : "A ser asignado"}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={13} className="text-orange-500" />
                            <span>{curso.dias || "Sin días"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={13} className="text-orange-500" />
                            <span>{curso.modalidad || "Presencial"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={13} className="text-orange-500" />
                            <span>Cupos: {curso.cupo_maximo || 50}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={13} className="text-emerald-600" />
                            <span className="font-bold text-emerald-600">
                              Bs. {Number(curso.precio_mensual || 450)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!isCursoActivo}
                        onClick={() => toggleSeleccionCurso(curso.curso_id, curso.estado)}
                        className={`relative z-20 flex w-full items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          !isCursoActivo 
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : isSelected
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95"
                              : "bg-[#0B1120] text-white hover:bg-slate-800 shadow-sm active:scale-95"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Trash2 size={15} /> Quitar de mis materias
                          </>
                        ) : (
                          <>
                            <Plus size={15} /> {isCursoActivo ? "Tomar esta materia" : "No disponible"}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {isConfirmPagoModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => setIsConfirmPagoModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-slate-800 border-b pb-3 flex items-center gap-2">
              <CreditCard className="text-emerald-600" size={22} /> Registrar y Subir Comprobante
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumen de Materias a Pagar</p>
                <div className="space-y-2 max-h-36 overflow-y-auto divide-y divide-slate-200/60">
                  {selectedCursoIds.map((cId) => {
                    const c = cursos.find((item) => Number(item.curso_id) === Number(cId));
                    if (!c) return null;
                    return (
                      <div key={c.curso_id} className="pt-2 flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{c.nombre} ({c.codigo})</span>
                        <span className="font-black text-emerald-600">Bs. {Number(c.precio_mensual || 450)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-slate-300 mt-3 pt-2 flex justify-between text-sm font-black">
                  <span>Monto Total a Abonar:</span>
                  <span className="text-emerald-600">Bs. {montoTotalAcumulado}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  MÉTODOS DE PAGO DISPONIBLES
                </h4>
                
                <div className="flex items-center gap-2 border-b pb-2">
                  <button
                    type="button"
                    onClick={() => setPagoTab("qr")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      pagoTab === "qr"
                        ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <QrCode size={16} /> Códigos QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPagoTab("cuentas")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      pagoTab === "cuentas"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard size={16} /> Cuentas Bancarias
                  </button>
                </div>

                {pagoTab === "qr" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4">
                    {qrsDisponibles.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-2">No hay códigos QR activos en este momento.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {qrsDisponibles.map((qr) => {
                          const imgSrc = qr.qr_foto_base64 || qr.qr_foto;
                          const uniqueKey = qr.qr_id || qr.id;
                          const isQrActivo = checkIsActivo(qr.activo);

                          return (
                            <div key={`qr-${uniqueKey}`} className={`relative flex flex-col items-center text-center p-2.5 rounded-xl border shadow-sm transition-all ${
                              isQrActivo ? "bg-white border-emerald-100" : "bg-slate-100 border-slate-200 opacity-60 grayscale"
                            }`}>
                              {!isQrActivo && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/40 rounded-xl">
                                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-md">
                                    X (Inactivo)
                                  </span>
                                </div>
                              )}
                              <div 
                                onClick={() => isQrActivo && setLightboxImage(imgSrc)}
                                className={`group relative w-20 h-20 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm transition-all flex items-center justify-center overflow-hidden ${
                                  isQrActivo ? "cursor-pointer hover:border-emerald-400" : ""
                                }`}
                              >
                                <img src={imgSrc} alt={qr.titular} className="max-h-full max-w-full object-contain rounded-lg" />
                                {isQrActivo && (
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-xl transition-opacity">
                                    <Maximize2 size={16} />
                                  </div>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold mt-2 truncate w-full ${isQrActivo ? "text-slate-800" : "text-slate-500 line-through"}`}>
                                {qr.titular || "Titular QR"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {pagoTab === "cuentas" && (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {cuentasDisponibles.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-2">No hay cuentas bancarias registradas.</p>
                    ) : (
                      cuentasDisponibles.map((cta) => {
                        const uniqueCtaKey = cta.qr_id || cta.id;
                        const isCuentaActiva = checkIsActivo(cta.activo);

                        return (
                          <div key={`cta-${uniqueCtaKey}`} className={`relative border rounded-2xl p-3.5 shadow-sm flex items-center justify-between ${
                            isCuentaActiva ? "bg-slate-50 border-slate-200" : "bg-slate-100 border-slate-300 opacity-60"
                          }`}>
                            <div className={!isCuentaActiva ? "line-through grayscale" : ""}>
                              <h5 className={`text-xs font-black ${isCuentaActiva ? "text-slate-900" : "text-slate-600"}`}>
                                {cta.banco || "Banco Autorizado"}
                              </h5>
                              <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                                Titular: <strong className={isCuentaActiva ? "text-slate-800" : "text-slate-500"}>
                                  {cta.titular || "S/N"}
                                </strong>
                              </p>
                              <div className={`inline-block mt-1 border px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                                isCuentaActiva ? "bg-white border-slate-200 text-slate-700" : "bg-slate-200 border-slate-300 text-slate-500"
                              }`}>
                                N° Cuenta: {cta.numero_cuenta || "S/N"}
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm ${
                              isCuentaActiva 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-red-50 text-red-600 border-red-200"
                            }`}>
                              {isCuentaActiva ? "Activa" : "X (Inactiva)"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Medio de Pago Utilizado *
                </label>
                <select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-400"
                >
                  <option value="Pago Móvil QR BCP">Pago Móvil QR </option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Depósito Presencial">Depósito Presencial en Ventanilla</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Adjuntar Foto del Comprobante *
                </label>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer ${
                    isDragging ? "border-emerald-500 bg-emerald-50" : "border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  {previewComprobante ? (
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(previewComprobante);
                        }}
                        className="group relative w-20 h-20 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-center overflow-hidden mb-2"
                      >
                        <img 
                          src={previewComprobante} 
                          alt="Comprobante" 
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-xl transition-opacity">
                          <Maximize2 size={16} />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <ImageIcon size={14} /> Haz clic o arrastra para cambiar la imagen
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-3">
                      <Upload size={30} className="text-emerald-500 mb-2" />
                      <p className="text-xs font-bold text-slate-700">Selecciona o arrastra la foto del comprobante</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG o WEBP hasta 5MB</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="border-t pt-4 flex items-center justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setIsConfirmPagoModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEnviarPago}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={16} /> Confirmar y Enviar Pago
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {isDeleteModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900">¿Cancelar Inscripciones?</h3>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Se eliminarán tus materias e inscripciones. La cuenta de tu usuario no será afectada.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelarInscripcionesYPago}
                disabled={saving}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md flex items-center justify-center gap-1"
              >
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : <>Sí, Eliminar Inscripciones</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {lightboxImage && createPortal(
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setLightboxImage(null)} className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors">
              <X size={24} />
            </button>
            <img 
              src={lightboxImage} 
              alt="Ampliada" 
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      , document.body)}

      <FeedbackModal
        isOpen={modalState.isOpen}
        onClose={closeFeedback}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <BlockchainEmisionModal
        isOpen={blockchainModalState.isOpen}
        onClose={() => setBlockchainModalState((prev) => ({ ...prev, isOpen: false }))}
        modalData={blockchainModalState.modalData}
        onConfirmPrint={blockchainModalState.onConfirmPrint}
      />
    </div>
  );
};