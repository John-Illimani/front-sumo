import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  User,
  GraduationCap,
  BookOpen,
  Clock,
  Receipt,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  PlusCircle,
  QrCode,
  AlertCircle,
  Landmark,
  Loader2,
  Target,
  Printer,
  X,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { cursosService } from "../../services/admin/cursosService";
import { pagosService } from "../../services/admin/pagosService";
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

// MODAL DE EMISIÓN BLOCKCHAIN
const BlockchainEmisionModal = ({ isOpen, onClose, modalData, onConfirmPrint }) => {
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none font-sans overflow-y-auto">
      <div
        className={`fixed inset-0 w-screen h-screen bg-[#0B1120]/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/95 p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 z-10 my-auto ${
          visible ? "scale-100 opacity-100" : "opacity-0 scale-95"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${theme.iconBg} text-white shadow-xl ring-4 ring-white`}>
              <ShieldCheck size={40} strokeWidth={2.2} />
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-widest ${theme.badge}`}>
            <Sparkles size={13} /> {theme.subtitle}
          </span>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {theme.title}
          </h3>

          {message && (
            <p className="mt-2 text-xs font-semibold text-slate-500 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/60 w-full text-center">
              {message}
            </p>
          )}

          <div className="mt-4 w-full text-left space-y-2 bg-gradient-to-br from-slate-50 to-orange-50/30 p-4 rounded-2xl border border-orange-100/80 text-xs text-slate-700">
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
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800"
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
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-600 hover:bg-slate-100"
            >
              Cerrar sin Imprimir
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmPrint();
                onClose();
              }}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-lg ${theme.btnBg}`}
            >
              <Printer size={16} />
              Imprimir / Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
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
          ctx.fillText(`SUMO  C.I. ${ciEstudiante}`, x + logoWidth + 6 * scale, y + 17 * scale);
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

export const DashboardInicioEstudiante = ({ onNavigate = () => {} }) => {
  const [estudiante, setEstudiante] = useState(null);
  const [misCursos, setMisCursos] = useState([]);
  const [misPagos, setMisPagos] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [downloadingBoleta, setDownloadingBoleta] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const [blockchainModalState, setBlockchainModalState] = useState({
    isOpen: false,
    modalData: null,
    onConfirmPrint: () => {}
  });

  const [horaActual, setHoraActual] = useState(
    new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  const showFeedback = (title, message, type = "info") =>
    setModalState({ isOpen: true, title, message, type });

  const closeFeedback = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(
        new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga de datos reales desde el backend
  const fetchDatosEstudiante = useCallback(async () => {
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

      const [cursosRes, inscripcionesRes, pagosRes, usuariosRes, postulantesRes] = await Promise.all([
        cursosService.getAll().catch(() => []),
        inscripcionesService.getAll().catch(() => []),
        pagosService.getAll().catch(() => []),
        fetch(import.meta.env.VITE_API_URL + "/api/usuarios", { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
        fetch(import.meta.env.VITE_API_URL + "/api/postulantes", { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      ]);
      

      let currentStudent = parsedUser;
      if (parsedUser && Array.isArray(usuariosRes)) {
        const fullUser = usuariosRes.find(
          (u) => Number(u.usuario_id) === Number(parsedUser.usuario_id || parsedUser.id) ||
                 u.username?.toLowerCase() === String(parsedUser.username || "").toLowerCase()
        );
        if (fullUser) currentStudent = { ...parsedUser, ...fullUser };
      }

      if (Array.isArray(postulantesRes)) {
        const matchedPost = postulantesRes.find(
          (p) => Number(p.usuario_id) === Number(currentStudent?.usuario_id || currentStudent?.id)
        );
        if (matchedPost) currentStudent = { ...currentStudent, ...matchedPost };
      }

      setEstudiante(currentStudent);

      const targetPostulanteId = currentStudent?.postulante_id || currentStudent?.usuario_id || currentStudent?.id;

      const inscripcionesMias = Array.isArray(inscripcionesRes)
        ? inscripcionesRes.filter(
            (ins) => String(ins.postulante_id) === String(targetPostulanteId) ||
                     String(ins.postulante?.usuario_id) === String(targetPostulanteId) ||
                     String(ins.usuario_id) === String(targetPostulanteId)
          )
        : [];

      setMisInscripciones(inscripcionesMias);

      const idsCursosTomados = new Set();
      inscripcionesMias.forEach((ins) => {
        if (ins.curso_id) idsCursosTomados.add(Number(ins.curso_id));
        if (Array.isArray(ins.cursos_totales)) {
          ins.cursos_totales.forEach((id) => idsCursosTomados.add(Number(id)));
        }
      });

      const cursosDetalle = Array.isArray(cursosRes)
        ? cursosRes.filter((c) => idsCursosTomados.has(Number(c.curso_id)))
        : [];

      setMisCursos(cursosDetalle);

      const misInscripcionIds = inscripcionesMias.map((ins) => ins.inscripcion_id);
      const pagosDetalle = Array.isArray(pagosRes)
        ? pagosRes.filter(
            (p) => misInscripcionIds.includes(p.inscripcion_id) || String(p.postulante_id) === String(targetPostulanteId)
          )
        : [];

      setMisPagos(pagosDetalle);

    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatosEstudiante();
  }, [fetchDatosEstudiante]);

  // Generación de PDF e integración con Blockchain
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

  const generarPDFBoletaOficial = async (estudianteData, pagoData) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoData = await cargarLogoBase64("/logo_sumo.png");
    const fondoMarcasAguaUrl = await generarFondoMarcasDeAgua(logoData, estudianteData.ci || "S/CI", pageWidth, pageHeight);

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

    doc.text(`Nombre Completo: ${estudianteData.nombre} ${estudianteData.apellido}`, 12, currentY);
    doc.text(`Cédula de Identidad: ${estudianteData.ci}`, 125, currentY);

    const facultadesConCursos = {};
    misCursos.forEach((c) => {
      const facName = c.facultad?.nombre || "Facultad General";
      const courseName = c.nombre || c.codigo;
      if (!facultadesConCursos[facName]) {
        facultadesConCursos[facName] = [];
      }
      facultadesConCursos[facName].push(courseName);
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

    doc.text(`Código Inscripción: ${misInscripciones[0]?.codigo_inscripcion || "N/A"}`, 12, currentY);
    doc.text(`Recibo Nro: ${pagoData?.recibo_nro || "REC-BCP-2026"}`, 125, currentY);

    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK.navy);
    doc.text("2. DETALLE DE LA TRANSACCIÓN FINANCIERA", 12, currentY);

    currentY += 12;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK.ink);
    doc.text(`Concepto: ${pagoData?.concepto || "Abono / Matrícula"}`, 16, currentY);
    doc.text(`Medio de Pago: ${pagoData?.medio_pago || "Ventanilla"}`, 125, currentY);

    currentY += 6;
    doc.text(`Fecha de Transacción: ${pagoData?.fecha_pago ? pagoData.fecha_pago.split("T")[0] : new Date().toISOString().split("T")[0]}`, 16, currentY);
    doc.text(`Estado del Pago: ${pagoData?.verificacion || "Verificado"}`, 125, currentY);

    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK.emerald);
    doc.text(`Monto Abonado Consolidado: Bs. ${Number(pagoData?.monto_abonado || 0).toFixed(2)}`, 16, currentY);

    currentY += 18;
    doc.setFontSize(11);
    doc.setTextColor(...INK.navy);
    doc.text("3. CÓDIGO QR Y VALIDACIÓN DE SEGURIDAD (VINCULADO A SUS CURSOS)", 12, currentY);

    currentY += 6;
    const qrDataUrl = await generarQRDataURL();
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 12, currentY, 38, 38);
    }

    doc.save(`boleta_pago_${estudianteData.ci}_${(estudianteData.nombre || "").toLowerCase()}.pdf`);
  };

  // Función para procesar y validar el pago antes de descargar la boleta
  const handleVerificarYDescargarBoleta = async (pagoAProcesar) => {
    const pagoObjetivo = pagoAProcesar || misPagos.find((p) => String(p.verificacion).toLowerCase() === "verificado") || misPagos[0];

    if (!pagoObjetivo) {
      showFeedback("Sin Registros de Pago", "Aún no has registrado ningún pago en el sistema. Inscribe tus materias para continuar.", "error");
      return;
    }

    const estaVerificado = String(pagoObjetivo.verificacion || "").toLowerCase().trim() === "verificado";

    if (!estaVerificado) {
      showFeedback(
        "Pago Pendiente de Verificación",
        `Tu pago con Recibo N° ${pagoObjetivo.recibo_nro || 'S/N'} se encuentra en estado '${pagoObjetivo.verificacion || 'pendiente'}'. La secretaría debe revisar tu comprobante antes de emitir la boleta Blockchain oficial.`,
        "error"
      );
      return;
    }

    setDownloadingBoleta(true);
    try {
      const postulanteId = estudiante?.postulante_id || estudiante?.usuario_id || estudiante?.id;
      
      // 1. REGLA ESTRICTA DE CURSOS: Obtener nombres, ordenar alfabéticamente y unir (Igual que Admin)
      const nombresCursos = misCursos.map((c) => c.nombre || c.codigo).filter(Boolean);
      const stringTodosLosCursos = nombresCursos.sort().join(" | ");

      // 2. REGLA ESTRICTA DE MONTO: Obligatorio 2 decimales en formato string
      const montoFormateado = Number(pagoObjetivo.monto_abonado || 0).toFixed(2);

      // 3. PAYLOAD EXACTO
      const boletaPayload = {
        postulanteId: postulanteId,
        nombreCompleto: `${estudiante?.nombre || ''} ${estudiante?.apellido || ''}`.trim(),
        ci: estudiante?.ci || "S/CI",
        uuid: estudiante?.uuid || "",
        reciboNro: pagoObjetivo.recibo_nro || "REC-2026-OFICIAL",
        montoAbonado: montoFormateado,
        concepto: pagoObjetivo.concepto || "Inscripción",
        medioPago: pagoObjetivo.medio_pago || "Pago Móvil QR BCP",
        fechaPago: pagoObjetivo.fecha_pago ? pagoObjetivo.fecha_pago.split("T")[0] : new Date().toISOString().split("T")[0],
        codigoInscripcion: misInscripciones[0]?.codigo_inscripcion || "INS-2026",
        curso: stringTodosLosCursos
      };

      const respuesta = await blockchainBoletaService.certificar(boletaPayload);

      const hashReal = respuesta.hashBoletin || respuesta.hash || "0x" + Array(64).fill("0").join("");
      const yaExistia = respuesta.yaExistia || false;
      const messageResponse = respuesta.message || (yaExistia ? "El registro ya se encontraba previamente verificado en la red Blockchain." : "El registro ha sido firmado y almacenado en la red inmutable.");
setMisPagos(prev => prev.map(p => 
        p.pago_id === pagoObjetivo.pago_id ? { ...p, hashBoleta: hashReal } : p
      ));
      const estudianteModalData = {
        nombre: estudiante?.nombre || "",
        apellido: estudiante?.apellido || "",
        ci: estudiante?.ci || "S/CI",
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
        onConfirmPrint: () => generarPDFBoletaOficial(estudianteModalData, pagoObjetivo),
      });

    } catch (err) {
      showFeedback("Error Blockchain", err.message || "No se pudo certificar la boleta en Blockchain.", "error");
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

  const pagoVerificado = misPagos.find((p) => String(p.verificacion).toLowerCase() === "verificado");
  const totalMontoAbonado = misPagos.reduce((acc, p) => acc + Number(p.monto_abonado || 0), 0);

  // CONSTRUCCIÓN EXACTA DEL CONTENIDO DEL QR PARA EMPAREJAR CON EL ADMINISTRADOR
  const nombreCompletoQR = `${estudiante?.nombre || ''} ${estudiante?.apellido || ''}`.trim();
  const ciQR = estudiante?.ci || 'S/CI';
  const montoQR = Number(pagoVerificado?.monto_abonado || totalMontoAbonado || 0).toFixed(2);
  const activeIns = misInscripciones[0] || {};
  const hashActualBoleta = activeIns.hash_boleta || activeIns.hash_blockchain || pagoVerificado?.hashBoleta || "PENDIENTE_HASH";

  const qrContenidoTexto = `NOMBRE: ${nombreCompletoQR} | CI: ${ciQR} | MONTO PAGADO: Bs. ${montoQR} | HASH: ${hashActualBoleta}`;

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-6 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40 pb-20">
      
      {/* SVG QR Oculto para exportación PDF */}
      <div className="hidden">
        <QRCodeSVG id="boleta-qr-svg" value={qrContenidoTexto} size={150} level="H" />
      </div>

      {/* BANNER PRINCIPAL DEL PORTAL */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0B1120] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-orange-500/15 blur-2xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 h-32 w-32 rounded-full bg-orange-500/10 blur-xl pointer-events-none" />

        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase border ${
                pagoVerificado 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                  : "bg-amber-500/20 text-amber-400 border-amber-500/40"
              }`}>
                <span className={`h-2 w-2 rounded-full ${pagoVerificado ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                {pagoVerificado ? " Verificada" : " Pendiente"}
              </span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs font-mono font-bold text-orange-300">
                CI: {estudiante?.ci || "S/CI"}
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
              ¡Bienvenido, {estudiante?.nombre || "Estudiante"} {estudiante?.apellido || ""}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">
              Consultora de Excelencia Académica SUMO · Periodo Gestión 2026
            </p>
          </div>

          {/* RELOJ EN VIVO */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm self-start md:self-auto shadow-inner">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-mono text-lg font-black text-orange-400 leading-none">
                {horaActual}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Portal del Estudiante
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN Y MÉTRICAS REALES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="flex flex-col justify-between rounded-2xl border border-orange-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Materias Inscritas
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 leading-none">
              {misCursos.length} Cursos
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {misCursos.length > 0 ? "Carga horaria asignada" : "Sin materias registradas"}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Abono Consolidado
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Receipt size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-600 leading-none">
              Bs. {totalMontoAbonado}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {misPagos.length} comprobante(s) registrado(s)
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-sky-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Estado de Verificación
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-slate-900 leading-none">
              {pagoVerificado ? "VERIFICADO" : misPagos.length > 0 ? "PENDIENTE" : "SIN PAGO"}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Validación oficial de secretaría
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Seguridad Blockchain
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-amber-600 leading-none">
              {pagoVerificado ? "Habilitado" : "En Espera"}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Firma inmutable de boleta
            </p>
          </div>
        </div>

      </div>

      {/* ACCESOS RÁPIDOS Y DETALLE DE CURSOS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* COLUMNA IZQUIERDA (8 COLS) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          
          {/* ACCESOS RÁPIDOS */}
          <div className="rounded-3xl border border-orange-200/80 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-black text-slate-800">
              <Sparkles className="text-orange-500" size={18} /> ¿Qué deseas gestionar hoy?
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <QuickActionButton
                icon={PlusCircle}
                title="Toma de Materias"
                subtitle="Inscripción y Pagos"
                onClick={() => onNavigate("inscribirse")}
                accent
              />
              <QuickActionButton
                icon={BookOpen}
                title="Mis Cursos"
                subtitle="Horarios y Docentes"
                onClick={() => onNavigate("mis-cursos")}
              />
              <QuickActionButton
                icon={User}
                title="Mi Perfil"
                subtitle="Actualizar Datos"
                onClick={() => onNavigate("perfil")}
              />
            </div>
          </div>

          {/* MIS CURSOS INSCRITOS ACTULES */}
          <div className="rounded-3xl border border-orange-200/80 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Mis Programas Cursando
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Cursos vinculados activamente
                </p>
              </div>
              
            </div>

            <div className="divide-y divide-slate-100 uppercase">
              {misCursos.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <AlertCircle size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No tienes materias tomadas todavía.</p>
                  <button
                    onClick={() => onNavigate("inscribirse")}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all"
                  >
                    <PlusCircle size={14} /> Inscribir Materias Ahora
                  </button>
                </div>
              ) : (
                misCursos.slice(0, 3).map((curso) => (
                  <div key={curso.curso_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 hover:bg-orange-50/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 font-mono font-bold text-xs">
                        {curso.codigo}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {curso.nombre}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Docente: {curso.docente ? `${curso.docente.nombre} ${curso.docente.apellido}` : "Por asignar"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                        <Clock size={13} className="text-orange-500" />
                        {curso.dias || "Presencial"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* INFORMACIÓN INSTITUCIONAL - CONSULTORA ACADÉMICA SUMO */}
          <div className="rounded-3xl border border-orange-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Sobre la Consultora de Excelencia Académica SUMO
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Líderes en preparación preuniversitaria y titulación profesional
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-1">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs">
                  <GraduationCap size={16} />
                  <span>Preparación Especializada ESFM</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Cursos enfocados en el examen de ingreso a las Escuelas Superiores de Formación de Maestros con alto porcentaje de aprobación.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-1">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs">
                  <Target size={16} />
                  <span>Taller de Tesis y Degree Projects</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Asesoramiento metodológico personalizado para la conclusión rápida y rigurosa de trabajos de grado universitarios.
                </p>
              </div>
            </div>
          </div>

        </div>

       

      </div>

      {/* MODAL DE MENSAJES Y NOTIFICACIONES */}
      <FeedbackModal
        isOpen={modalState.isOpen}
        onClose={closeFeedback}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      {/* MODAL DE EMISIÓN Y FIRMA EN BLOCKCHAIN */}
      <BlockchainEmisionModal
        isOpen={blockchainModalState.isOpen}
        onClose={() => setBlockchainModalState((prev) => ({ ...prev, isOpen: false }))}
        modalData={blockchainModalState.modalData}
        onConfirmPrint={blockchainModalState.onConfirmPrint}
      />
    </div>
  );
};

// COMPONENTE DE BOTÓN DE ACCIÓN RÁPIDA
function QuickActionButton({ icon: Icon, title, subtitle, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all active:scale-95 group cursor-pointer ${
        accent
          ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
          : "border border-orange-200/80 bg-orange-50/40 text-slate-800 hover:bg-orange-100/70 hover:border-orange-300"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105 ${
          accent ? "bg-white/20 text-white" : "bg-[#0B1120] text-orange-400"
        }`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-xs font-black ${accent ? "text-white" : "text-slate-800"}`}>
          {title}
        </p>
        <p className={`text-[10px] font-medium leading-tight mt-0.5 ${accent ? "text-orange-100" : "text-slate-400"}`}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}