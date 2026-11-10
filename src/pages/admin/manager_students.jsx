import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  User,
  CreditCard,
  Phone,
  BookOpen,
  DollarSign,
  AlignLeft,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  History,
  Users,
  Banknote,
  Landmark,
  Sparkles,
  Lock,
  Loader2,
  Edit3,
  Trash2,
  Settings,
  Wifi,
  Keyboard,
  Radio,
  FileText,
  QrCode,
  Check,
  X,
  ExternalLink,
  Printer,
  Eye,
  AlertTriangle,
  Ban
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

import { generarPDFIndividual } from "../../utils/PDF/exportPDFfunction";

import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { pagosService } from "../../services/admin/pagosService";
import { facultadesService } from "../../services/admin/facultadesService";
import { catalogoService } from "../../services/admin/catalogoService";
import { blockchainBoletaService } from "../../services/admin/blockchainBoletaService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, studentName }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle size={30} />
          </div>

          <h3 className="text-xl font-black text-slate-900">¿Eliminar Estudiante?</h3>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
            Estás a punto de eliminar permanentemente la ficha de <strong className="text-slate-800">{studentName || "este estudiante"}</strong>, sus inscripciones y sus registros asociados. Esta acción no se puede deshacer.
          </p>

          <div className="mt-6 flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
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

  // ESTA ES LA CADENA EXACTA QUE SE INYECTARÁ EN EL QR DEL PDF
  const qrStringDefinitivo = estudiante ? `NOMBRE: ${estudiante.nombre} ${estudiante.apellido} | CI: ${estudiante.ci || "S/CI"} | MONTO PAGADO: Bs. ${Number(estudiante.monto_abonado || 0).toFixed(2)} | HASH: ${estudiante.hashBoleta || hashReal}` : "";

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
        title: "Emisión Exitosa vía Smart Contract",
        subtitle: "Registro inmutable verificado",
      };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none font-sans overflow-y-auto">
      
      {/* CÓDIGO QR VINCULADO DIRECTAMENTE A ESTA MODAL Y A ESTE HASH */}
      <div style={{ display: "none" }}>
        <QRCodeSVG id="modal-qr-svg" value={qrStringDefinitivo} size={200} level="H" />
      </div>

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
              <span className="font-bold text-slate-900 uppercase">{estudiante?.nombre} {estudiante?.apellido}</span>
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

const INK = {
  navy: [11, 17, 32],
  gold: [217, 119, 6],
  slate: [71, 85, 105],
  emerald: [16, 185, 129],
  paper: [250, 248, 242],
  ink: [30, 41, 59],
};

const blankStudent = () => ({
  pago_id: null,
  inscripcion_id: null,
  postulante_id: null,
  curso_id: "",
  facultad_id: "",
  cursos_adicionales: [], 
  nombre: "",
  apellido: "",
  ci: "",
  celular: "",
  username: "",
  password: "",
  codigo_inscripcion: "",
  uuid: "",
  turno: "",
  estado: "aprobado",
  observaciones: "",
  monto_abonado: "",
  concepto_pago: "Cursos",
  medio_pago: "",
  estado_pago: "",
  fotoComprobante: null,
  verificacion: "pendiente",
  montoPagoTotal: "0.00",
  montoFaltante: "0.00",
  fechaPago: "",
  reciboNro: "",
  historial: [],
  hashBoleta: "",
  bloque: null,
  emitidoBlockchain: false
});

const obtenerFechaLocal = (fechaStr) => {
  if (!fechaStr) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return fechaStr.split("T")[0];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const money = (n) => `Bs. ${Number(n || 0).toFixed(2)}`;

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ... justo debajo de: function initials(name = "") { ... }

const calcularHashBoletaJS = async (estudiante, facultades) => {
  const fMain = facultades.find((f) => String(f.facultad_id) === String(estudiante.facultad_id));
  const cursoObj = fMain?.cursos?.find((c) => String(c.curso_id) === String(estudiante.curso_id));
  const mainCourseName = cursoObj ? (cursoObj.nombre || cursoObj.codigo) : "Curso General";

  const extraCoursesNames = (estudiante.cursos_adicionales || []).map(ext => {
    const f = facultades.find(fac => String(fac.facultad_id) === String(ext.facultad_id));
    const c = f?.cursos?.find(cur => String(cur.curso_id) === String(ext.curso_id));
    return c ? (c.nombre || c.codigo) : null;
  }).filter(Boolean);

  const stringTodosLosCursos = [mainCourseName, ...extraCoursesNames].join(" | ");

  const rawString = [
    `${estudiante.nombre} ${estudiante.apellido}`.trim().toUpperCase(),
    String(estudiante.ci || "").trim(),
    String(estudiante.uuid || "").trim(),
    String(estudiante.reciboNro || `REC-BCP-2026-${estudiante.inscripcion_id}`).trim(),
    Number(estudiante.monto_abonado || 0).toFixed(2),
    String(estudiante.concepto_pago || "Pago Presencial").trim(),
    String(estudiante.medio_pago || "Ventanilla").trim(),
    String(estudiante.fechaPago || new Date().toISOString().split("T")[0]).trim(),
    String(estudiante.codigo_inscripcion || "").trim(),
    String(stringTodosLosCursos).trim()
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};



export const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [facultades, setFacultades] = useState([]);

  const [catalogos, setCatalogos] = useState({ turnos: [], medios_pago: [], estados_pago: [] });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingBoleta, setDownloadingBoleta] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(blankStudent());
  const [isNew, setIsNew] = useState(true);

  const [modoLecturaRFID, setModoLecturaRFID] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterFacultad, setFilterFacultad] = useState("TODAS");
  const [filterFinanciero, setFilterFinanciero] = useState("TODOS");
  const [sortBy, setSortBy] = useState("nombre");
  
  const [tabLista, setTabLista] = useState("sin_comprobante");
  const [showHistorial, setShowHistorial] = useState(false);
  
  const [pagoModalData, setPagoModalData] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [pagoModalSaving, setPagoModalSaving] = useState(false);

  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "", type: "success" });
  const [blockchainModalState, setBlockchainModalState] = useState({ isOpen: false, modalData: null, onConfirmPrint: () => {} });
  
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, targetId: null, studentName: "" });

  const showFeedback = (title, message, type = "success") => setModalState({ isOpen: true, title, message, type });
  const closeFeedback = () => setModalState((prev) => ({ ...prev, isOpen: false }));

 useEffect(() => {
     let rfidBuffer = "";
     let lastKeyTime = Date.now();
     let timeoutId = null;
 
     const procesarCodigo = (codigo) => {
       const codigoLimpio = codigo.replace(/[^a-zA-Z0-9]/g, "").trim().toUpperCase();
       if (codigoLimpio.length >= 4) {
         setFormData((prev) => ({ ...prev, uuid: codigoLimpio }));
         showFeedback("Tarjeta RFID Escaneada", `Código UUID detectado: ${codigoLimpio}`, "success");
       }
     };
 
     const handleKeyDown = (e) => {
       if (!modoLecturaRFID || !e || !e.key) return;
 
       const currentTime = Date.now();
 
       // Si pasa demasiado tiempo entre lecturas (más de 500ms), reiniciar el acumulador
       if (currentTime - lastKeyTime > 500) {
         rfidBuffer = "";
       }
       lastKeyTime = currentTime;
 
       if (e.key === "Enter") {
         if (timeoutId) clearTimeout(timeoutId);
         procesarCodigo(rfidBuffer);
         rfidBuffer = "";
       } else if (e.key.length === 1) {
         rfidBuffer += e.key;
 
         // Temporizador de respaldo por si el lector no envía la tecla ENTER
         if (timeoutId) clearTimeout(timeoutId);
         timeoutId = setTimeout(() => {
           if (rfidBuffer.length >= 4) {
             procesarCodigo(rfidBuffer);
             rfidBuffer = "";
           }
         }, 200);
       }
     };
 
     window.addEventListener("keydown", handleKeyDown);
     return () => {
       window.removeEventListener("keydown", handleKeyDown);
       if (timeoutId) clearTimeout(timeoutId);
     };
   }, [modoLecturaRFID]);

  const previewUsername = useMemo(() => {
    if (!formData.nombre.trim() && !formData.apellido.trim()) return "@sin_asignar";
    const pNom = (formData.nombre.trim().split(" ")[0] || "").toLowerCase();
    const pApe = (formData.apellido.trim().split(" ")[0] || "").toLowerCase();
    return `@${pNom}_${pApe}`;
  }, [formData.nombre, formData.apellido]);

  const previewPassword = useMemo(() => {
    if (!formData.nombre.trim() && !formData.ci.trim()) return "nombreci*";
    const pNom = (formData.nombre.trim().split(" ")[0] || "").toLowerCase();
    const ciNum = formData.ci.trim().replace(/\D/g, "");
    return `${pNom}${ciNum}*`;
  }, [formData.nombre, formData.ci]);

  const cursosDisponibles = useMemo(() => {
    if (!formData.facultad_id) return [];
    const fac = facultades.find((f) => String(f.facultad_id) === String(formData.facultad_id));
    return fac?.cursos || [];
  }, [facultades, formData.facultad_id]);

  const qrStringValue = useMemo(() => {
    const nombreCompleto = `${formData.nombre} ${formData.apellido}`.trim();
    const ci = formData.ci || "S/CI";
    const monto = Number(formData.monto_abonado || 0).toFixed(2);
    const hash = formData.hashBoleta || "PENDIENTE_HASH";
    return `NOMBRE: ${nombreCompleto} | CI: ${ci} | MONTO PAGADO: Bs. ${monto} | HASH: ${hash}`;
  }, [formData.nombre, formData.apellido, formData.ci, formData.monto_abonado, formData.hashBoleta]);

  const fetchData = async (keepSelectedId = null) => {
    setLoading(true);
    try {
      const [inscripcionesData, facultadesData, catalogosData] = await Promise.all([
        inscripcionesService.getAll().catch(() => []),
        facultadesService.getAll().catch(() => []),
        catalogoService.getAll().catch(() => ({ turnos: [], medios_pago: [], estados_pago: [] })),
      ]);

      setFacultades(facultadesData);
      setCatalogos(catalogosData);

      const groupedByPostulante = {};
      inscripcionesData.forEach(ins => {
        const pId = ins.postulante_id || ins.postulante?.postulante_id || `temp-${ins.inscripcion_id}`;
        if (!groupedByPostulante[pId]) groupedByPostulante[pId] = [];
        groupedByPostulante[pId].push(ins);
      });

      const mapeados = Object.values(groupedByPostulante).map((grupo, index) => {
        const ins = grupo[0];
        const postulanteObj = ins.postulante || ins.postulantes || {};
        const usuarioObj = postulanteObj.usuario || ins.usuario || {};
        
        const todosLosPagos = grupo.flatMap(g => g.pagos || []);
        const pagosOrdenados = [...todosLosPagos].sort((a, b) => new Date(a.fecha_pago || 0) - new Date(b.fecha_pago || 0));
        const ultimoPago = pagosOrdenados[pagosOrdenados.length - 1];

        const totalPagado = todosLosPagos.reduce((acc, p) => acc + Number(p.monto_abonado || 0), 0);
        const costoTotalCursos = grupo.reduce((acc, g) => acc + Number(g.curso?.costo || 450.0), 0);
        const saldoFaltante = Math.max(0, costoTotalCursos - totalPagado);

        const historialPagos = pagosOrdenados.map((p) => ({
          pago_id: p.pago_id,
          fecha: p.fecha_pago ? p.fecha_pago.split("T")[0] : "",
          monto: Number(p.monto_abonado || 0).toFixed(2),
          recibo: p.recibo_nro || "REC-VENTANILLA",
          concepto: p.concepto || "Abono",
          medio: p.medio_pago || "Presencial",
          estado: p.estado_pago || "",
        }));

        let facId = ins.curso?.facultad_id ? String(ins.curso?.facultad_id) : "";
        if (!facId && ins.curso_id) {
          const foundFac = facultadesData.find((f) => (f.cursos || []).some((c) => String(c.curso_id) === String(ins.curso_id)));
          if (foundFac) facId = String(foundFac.facultad_id);
        }

       const cursosExtras = grupo.slice(1).map((g, i) => {
          let extraFacId = g.curso?.facultad_id ? String(g.curso?.facultad_id) : "";
          if (!extraFacId && g.curso_id) {
            const foundFac = facultadesData.find((f) => (f.cursos || []).some((c) => String(c.curso_id) === String(g.curso_id)));
            if (foundFac) extraFacId = String(foundFac.facultad_id);
          }
          return { id: g.inscripcion_id || Date.now() + i, facultad_id: extraFacId, curso_id: String(g.curso_id) };
        }).filter((ext, idx, self) => 
          // Filtramos para que no se duplique con el curso principal ni se repita entre los extras
          String(ext.curso_id) !== String(ins.curso_id) && 
          idx === self.findIndex(e => String(e.curso_id) === String(ext.curso_id))
        );

        const estadoPagoGuardado = ultimoPago?.estado_pago || ins.estado_pago || "";
        const verificacionPago = ultimoPago?.verificacion || "pendiente";
        const rawUuid = ins.uuid || usuarioObj.uuid || ins.rfid_uid || "";

        return {
          ...blankStudent(),
          pago_id: ultimoPago?.pago_id || null,
          inscripcion_id: Number(ins.inscripcion_id || ins.id || index + 1),
          postulante_id: Number(ins.postulante_id || postulanteObj.postulante_id || index + 1),
          curso_id: ins.curso_id ? String(ins.curso_id) : "",
          facultad_id: facId,
          cursos_adicionales: cursosExtras,
          nombre: (usuarioObj.nombre || usuarioObj.nombres || ins.nombre || "").trim(),
          apellido: (usuarioObj.apellido || usuarioObj.apellidos || ins.apellido || "").trim(),
          ci: usuarioObj.ci || usuarioObj.carnet || ins.ci || "",
          celular: usuarioObj.celular || usuarioObj.telefono || ins.celular || "",
          username: usuarioObj.username || "",
          codigo_inscripcion: ins.codigo_inscripcion || `INS-2026-${index + 100}`,
          uuid: rawUuid ? String(rawUuid) : "",
          turno: ins.turno || catalogosData.turnos?.[0]?.nombre || "Mañana",
          observaciones: ins.observaciones || "",
          reciboNro: ultimoPago?.recibo_nro || `REC-BCP-2026-${index + 1000}`,
          monto_abonado: ultimoPago ? Number(ultimoPago.monto_abonado || 0).toFixed(2) : (saldoFaltante > 0 ? saldoFaltante.toFixed(2) : "450.00"),
          concepto_pago: ultimoPago?.concepto || "Matrícula e Inscripción Inicial",
          medio_pago: ultimoPago?.medio_pago || catalogosData.medios_pago?.[0]?.nombre || "Pago Presencial en Ventanilla",
          estado_pago: estadoPagoGuardado,
          fotoComprobante: ultimoPago?.foto_comprobante || ultimoPago?.foto_comprobante_base64 || null,
          verificacion: verificacionPago,
          montoPagoTotal: totalPagado.toFixed(2),
          montoFaltante: saldoFaltante.toFixed(2),
          fechaPago: obtenerFechaLocal(ultimoPago?.fecha_pago),
          historial: historialPagos,
          hashBoleta: ins.hash_boleta || ins.hash_blockchain || "",
          bloque: ins.bloque_id || null,
          emitidoBlockchain: Boolean(ins.hash_boleta || ins.hash_blockchain),
        };
      });

      setEstudiantes(mapeados);

      if (mapeados.length > 0) {
        const targetId = keepSelectedId || selectedId || mapeados[0].inscripcion_id;
        const targetStudent = mapeados.find((s) => s.inscripcion_id === targetId) || mapeados[0];
        setSelectedId(targetStudent.inscripcion_id);
        setFormData({ ...targetStudent, uuid: String(targetStudent.uuid || ""), password: "" });
        setIsNew(false);
      } else {
        handleNewClick(null, facultadesData, catalogosData);
      }
    } catch (error) {
      showFeedback("Error de Carga", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = estudiantes.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      const fullName = `${s.nombre} ${s.apellido}`.toLowerCase();
      const matchQ =
        !q ||
        fullName.includes(q) ||
        s.ci.includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.codigo_inscripcion.toLowerCase().includes(q) ||
        (s.uuid && String(s.uuid).toLowerCase().includes(q));
      
      const matchFacultad = filterFacultad === "TODAS" || String(s.facultad_id) === String(filterFacultad);
      const matchFinanciero = filterFinanciero === "TODOS" || s.estado_pago === filterFinanciero;
      const matchTab = tabLista === "con_comprobante" ? !!s.fotoComprobante : !s.fotoComprobante;

      return matchQ && matchFacultad && matchFinanciero && matchTab;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "deuda") return Number(b.montoFaltante) - Number(a.montoFaltante);
      if (sortBy === "reciente") return new Date(b.fechaPago || 0) - new Date(a.fechaPago || 0);
      return 0;
    });

    return list;
  }, [estudiantes, searchQuery, filterFacultad, filterFinanciero, sortBy, tabLista]);

  const stats = useMemo(() => {
    const total = estudiantes.length;
    const deuda = estudiantes.reduce((acc, s) => acc + Number(s.montoFaltante || 0), 0);
    const pagados = estudiantes.filter((s) => s.estado_pago && s.estado_pago !== "").length;
    const ingresosTotal = estudiantes.reduce((acc, s) => acc + Number(s.montoPagoTotal || 0), 0);
    return { total, deuda, pagados, ingresosTotal };
  }, [estudiantes]);

  const selectStudent = (s) => {
    setSelectedId(s.inscripcion_id);
    setFormData({
      ...s,
      facultad_id: String(s.facultad_id || ""),
      curso_id: String(s.curso_id || ""),
      cursos_adicionales: s.cursos_adicionales || [],
      uuid: String(s.uuid || ""),
      turno: s.turno || (catalogos.turnos?.[0]?.nombre || "Mañana"),
      medio_pago: s.medio_pago || (catalogos.medios_pago?.[0]?.nombre || "Pago Presencial en Ventanilla"),
      estado_pago: s.estado_pago || "",
      monto_abonado: s.monto_abonado || "0.00",
      password: "",
    });
    setIsNew(false);
    setShowHistorial(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => {
      const updated = { ...f, [name]: value };
      if (name === "facultad_id") {
        const fac = facultades.find((item) => String(item.facultad_id) === String(value));
        const firstCurso = fac?.cursos?.[0]?.curso_id ? String(fac.cursos[0].curso_id) : "";
        updated.facultad_id = value;
        updated.curso_id = firstCurso;
      }
      return updated;
    });
  };

  const handleAddCursoExtra = () => {
    setFormData((prev) => ({
      ...prev,
      cursos_adicionales: [
        ...(prev.cursos_adicionales || []),
        { id: Date.now(), facultad_id: "", curso_id: "" }
      ]
    }));
  };

  const handleRemoveCursoExtra = (idExtra) => {
    setFormData((prev) => ({
      ...prev,
      cursos_adicionales: (prev.cursos_adicionales || []).filter((item) => item.id !== idExtra)
    }));
  };

  const handleCursoExtraChange = (idExtra, field, value) => {
    setFormData((prev) => ({
      ...prev,
      cursos_adicionales: (prev.cursos_adicionales || []).map((item) => {
        if (item.id === idExtra) {
          const updated = { ...item, [field]: value };
          if (field === "facultad_id") {
            const fac = facultades.find((f) => String(f.facultad_id) === String(value));
            updated.curso_id = fac?.cursos?.[0] ? String(fac.cursos[0].curso_id) : "";
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const handleNewClick = (e, customFacultades = null, customCatalogos = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const facs = customFacultades || facultades;
    const cats = customCatalogos || catalogos;

    const blank = blankStudent();
    if (facs.length > 0) {
      blank.facultad_id = String(facs[0].facultad_id);
      blank.curso_id = facs[0].cursos?.[0]?.curso_id ? String(facs[0].cursos[0].curso_id) : "";
    }
    if (cats.turnos?.length > 0) blank.turno = cats.turnos[0].nombre;
    if (cats.medios_pago?.length > 0) blank.medio_pago = cats.medios_pago[0].nombre;
    blank.estado_pago = "";

    setFormData(blank);
    setSelectedId(null);
    setIsNew(true);
    setShowHistorial(false);
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.ci.trim()) {
      showFeedback("Campos Incompletos", "Nombre, Apellido y C.I. son obligatorios.", "error");
      return;
    }

    if (!formData.curso_id) {
      showFeedback("Curso Requerido", "Debe seleccionar una facultad y un curso válido.", "error");
      return;
    }

    const listaCursosTarget = [
      parseInt(formData.curso_id, 10),
      ...(formData.cursos_adicionales || []).map((c) => parseInt(c.curso_id, 10)).filter(Boolean)
    ];

    const tieneDuplicados = new Set(listaCursosTarget).size !== listaCursosTarget.length;
    if (tieneDuplicados) {
      showFeedback("Curso Repetido", "No puedes seleccionar el mismo curso dos veces para el mismo estudiante.", "error");
      return;
    }

    if (saving) return;

    setSaving(true);
    try {
      let activeInsId = formData.inscripcion_id;
      const montoAbono = Number(formData.monto_abonado || 0);
      const uuidString = String(formData.uuid || "").trim();

      if (isNew) {
        let primerInsId = null;
        let postulanteGeneradoId = null;
        let creds = null;

        for (let i = 0; i < listaCursosTarget.length; i++) {
          const cId = listaCursosTarget[i];
          const payloadInscripcion = {
            postulante_id: postulanteGeneradoId,
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            ci: formData.ci.trim(),
            celular: formData.celular ? formData.celular.trim() : null,
            curso_id: cId,
            turno: formData.turno,
            uuid: uuidString ? uuidString : null,
            observaciones: formData.observaciones || null,
          };

          const resInscripcion = await inscripcionesService.create(payloadInscripcion);
          const nuevaIns = resInscripcion.inscripcion;
          
          if (i === 0) {
            primerInsId = nuevaIns?.inscripcion_id;
            postulanteGeneradoId = nuevaIns?.postulante_id || nuevaIns?.postulante?.postulante_id;
            creds = resInscripcion.credenciales_generadas;
          }
        }

        activeInsId = primerInsId;

        if (montoAbono > 0 && activeInsId) {
          await pagosService.create({
            inscripcion_id: activeInsId,
            monto: montoAbono,
            concepto: formData.concepto_pago || "Inscripción y Pago Presencial",
            medio_pago: formData.medio_pago || "Pago Presencial en Ventanilla",
            estado_pago: formData.estado_pago,
            verificacion: "verificado",
          });
        }

        showFeedback(
          "Registro Exitoso",
          `Estudiante inscrito en ${listaCursosTarget.length} programa(s) con éxito. Pago asignado por ${money(montoAbono)}. ${creds ? `Credenciales: ${creds.username} / ${creds.password_inicial}` : ''}`,
          "success"
        );
      } else {
        const payloadUpdate = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          ci: formData.ci.trim(),
          celular: formData.celular ? formData.celular.trim() : null,
          username: formData.username.trim(),
          curso_id: parseInt(formData.curso_id, 10),
          turno: formData.turno,
          uuid: uuidString ? uuidString : null,
          observaciones: formData.observaciones || null,
          cursos_totales: listaCursosTarget
        };

        if (formData.password && formData.password.trim()) {
          payloadUpdate.password = formData.password.trim();
        }

        await inscripcionesService.update(formData.inscripcion_id, payloadUpdate);

        const pagoIdActual =
          formData.pago_id ||
          (Array.isArray(formData.historial) && formData.historial.length > 0
            ? formData.historial[formData.historial.length - 1]?.pago_id
            : null);

        if (pagoIdActual) {
          const payloadPago = {
            monto_abonado: montoAbono,
            medio_pago: formData.medio_pago,
            concepto: formData.concepto_pago,
            estado_pago: formData.estado_pago,
            verificacion: "verificado",
          };

          try {
            await pagosService.update(pagoIdActual, payloadPago);
          } catch (err) {
            if (montoAbono > 0) {
              await pagosService.create({
                inscripcion_id: formData.inscripcion_id,
                monto: montoAbono,
                concepto: formData.concepto_pago || "Abono de cuota / Saldo",
                medio_pago: formData.medio_pago || "Pago Presencial en Ventanilla",
                estado_pago: formData.estado_pago,
                verificacion: "verificado",
              });
            }
          }
        } else if (montoAbono > 0) {
          await pagosService.create({
            inscripcion_id: formData.inscripcion_id,
            monto: montoAbono,
            concepto: formData.concepto_pago || "Abono de cuota / Saldo",
            medio_pago: formData.medio_pago || "Pago Presencial en Ventanilla",
            estado_pago: formData.estado_pago,
            verificacion: "verificado",
          });
        }

        showFeedback(
          "Actualización Exitosa",
          `La ficha, los cursos en lote y datos de ${formData.nombre} han sido sincronizados correctamente.`,
          "success"
        );
      }

      await fetchData(activeInsId);
    } catch (error) {
      showFeedback("Error al Procesar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (id, nombre, apellido, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetId = id || formData.inscripcion_id || formData.postulante_id;
    if (!targetId) return;

    const studentName = nombre ? `${nombre} ${apellido || ""}`.trim() : `${formData.nombre} ${formData.apellido}`.trim();
    setDeleteModalState({ isOpen: true, targetId, studentName });
  };

  const executeDelete = async () => {
    const targetId = deleteModalState.targetId;
    if (!targetId) return;

    setSaving(true);
    try {
      await inscripcionesService.delete(targetId);
      showFeedback("Registro Eliminado", "Se procesó la eliminación de forma correcta incluyendo toda su ficha.", "success");
      await fetchData();
    } catch (error) {
      showFeedback("Error al Eliminar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExportSinglePDF = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    generarPDFIndividual(formData);
    showFeedback("Generando PDF", "Descargando ficha institucional del estudiante...", "info");
  };

 // REEMPLAZAR DESDE LÍNEA 461
  const generarQRDataURL = async () => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");

      // Buscar el QR exacto de la modal (siempre correcto) o usar el de reserva
      const svgElement = document.getElementById("modal-qr-svg") || document.getElementById("boleta-qr-svg");
      if (!svgElement) return resolve(null);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      const svgActual = new XMLSerializer().serializeToString(svgElement);
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgActual)));
    });
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

 // REEMPLAZAR DESDE LÍNEA 536
  const generarPDFBoletaOficial = async (estudiante, hashCalculadoLocal, txHash) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoData = await cargarLogoBase64("/logo_sumo.png");
    const fondoMarcasAguaUrl = await generarFondoMarcasDeAgua(logoData, estudiante.ci || "S/CI", pageWidth, pageHeight);

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

    doc.text(`Nombre Completo: ${estudiante.nombre} ${estudiante.apellido}`, 12, currentY);
    doc.text(`Cédula de Identidad: ${estudiante.ci}`, 125, currentY);

    const facultadesConCursos = {};

    const fMain = facultades.find((f) => String(f.facultad_id) === String(estudiante.facultad_id));
    const mainFacName = fMain ? fMain.nombre : "Facultad General";
    let mainCourseName = "Programa Académico";
    if (fMain) {
       const cMain = fMain.cursos?.find((c) => String(c.curso_id) === String(estudiante.curso_id));
       if (cMain) mainCourseName = cMain.nombre || cMain.codigo;
    }

    facultadesConCursos[mainFacName] = [mainCourseName];

    (estudiante.cursos_adicionales || []).forEach(ext => {
      const f = facultades.find(fac => String(fac.facultad_id) === String(ext.facultad_id));
      const facName = f ? f.nombre : "Facultad General";
      const c = f?.cursos?.find(cur => String(cur.curso_id) === String(ext.curso_id));
      const courseName = c ? (c.nombre || c.codigo) : null;

      if (courseName) {
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

    doc.text(`Turno: ${(estudiante.turno || "Sin Turno").replace(/Ma.ana/g, "Mañana")}`, 12, currentY);
    doc.text(`Código Inscripción: ${estudiante.codigo_inscripcion || "N/A"}`, 125, currentY);

    if (estudiante.observaciones) {
      currentY += 6;
      const obsLines = doc.splitTextToSize(`Observaciones: ${estudiante.observaciones}`, 190);
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
    doc.text(`Concepto: ${estudiante.concepto_pago || "Abono / Matrícula"}`, 16, currentY);
    doc.text(`Medio de Pago: ${(estudiante.medio_pago || "Ventanilla").includes("QR") || (estudiante.medio_pago || "Ventanilla").includes("M") ? "Pago Móvil QR" : estudiante.medio_pago}`, 125, currentY);

    currentY += 6;
    doc.text(`Fecha de Transacción: ${estudiante.fechaPago || new Date().toISOString().split("T")[0]}`, 16, currentY);
    doc.text(`Estado del Pago: ${estudiante.estado_pago || "Completado"}`, 125, currentY);

    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK.emerald);
    doc.text(`Monto Abonado Consolidado: Bs. ${Number(estudiante.monto_abonado || 0).toFixed(2)}`, 16, currentY);

    currentY += 18;
    doc.setFontSize(11);
    doc.setTextColor(...INK.navy);
    doc.text("3. CÓDIGO QR Y VALIDACIÓN DE SEGURIDAD (VINCULADO A SUS CURSOS)", 12, currentY);

    currentY += 6;

    // Llamada directa, sin esperas de setTimeout
    const qrDataUrl = await generarQRDataURL();
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 12, currentY, 38, 38);
    }

    doc.save(`boleta_pago_${estudiante.ci}_${(estudiante.nombre || "").toLowerCase()}.pdf`);
  };

  const handleCertificarYPreguntarImpresion = async (e, overrideStudent = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const targetStudent = overrideStudent || formData;

    if (!targetStudent.inscripcion_id && isNew) {
      showFeedback("Atención", "Debe guardar el registro del estudiante antes de emitir su boleta.", "error");
      return;
    }

    setDownloadingBoleta(true);

    try {
      const facObj = facultades.find((f) => String(f.facultad_id) === String(targetStudent.facultad_id));
      const cursoObj = facObj?.cursos?.find((c) => String(c.curso_id) === String(targetStudent.curso_id));
      const mainCourseName = cursoObj ? (cursoObj.nombre || cursoObj.codigo) : "Curso General";

      const extraCoursesNames = (targetStudent.cursos_adicionales || []).map(ext => {
        const f = facultades.find(fac => String(fac.facultad_id) === String(ext.facultad_id));
        const c = f?.cursos?.find(cur => String(cur.curso_id) === String(ext.curso_id));
        return c ? (c.nombre || c.codigo) : null;
      }).filter(Boolean);

      const stringTodosLosCursos = [mainCourseName, ...extraCoursesNames].join(" | ");

      // 1. Calcular el Hash Local con SHA-256
      const hashCalculadoLocal = await calcularHashBoletaJS(targetStudent, facultades);

      // 2. Enviar el payload incluyendo el hash calculado
      const boletaPayload = {
        postulanteId: targetStudent.postulante_id || targetStudent.inscripcion_id,
        nombreCompleto: `${targetStudent.nombre} ${targetStudent.apellido}`.trim(),
        ci: targetStudent.ci,
        uuid: targetStudent.uuid || "",
        reciboNro: targetStudent.reciboNro || `REC-BCP-2026-${targetStudent.inscripcion_id}`,
        montoAbonado: targetStudent.monto_abonado || "0.00",
        concepto: targetStudent.concepto_pago || "Pago Presencial",
        medioPago: targetStudent.medio_pago || "Ventanilla",
        fechaPago: targetStudent.fechaPago || new Date().toISOString().split("T")[0],
        codigoInscripcion: targetStudent.codigo_inscripcion || "",
        curso: stringTodosLosCursos,
        hashCalculado: hashCalculadoLocal 
      };

      const respuesta = await blockchainBoletaService.certificar(boletaPayload);

      // 3. Obtener el Hash real dictado por el backend
      const hashReal = respuesta.hashBoletin || respuesta.hash || hashCalculadoLocal;
      const txHash = respuesta.txHash || hashReal;
      const yaExistia = respuesta.yaExistia || false;
      const messageResponse = respuesta.message || (yaExistia ? "El registro ya se encontraba previamente verificado en el libro contable inmutable." : "El registro ha sido firmado y almacenado de forma permanente.");

      // 4. Actualizar usando hashReal en lugar de hashCalculadoLocal
      const updatedStudent = {
        ...targetStudent,
        hashBoleta: hashReal,
        emitidoBlockchain: true
      };

      setEstudiantes((prev) =>
        prev.map((s) =>
          s.inscripcion_id === targetStudent.inscripcion_id
            ? { ...s, hashBoleta: hashReal, emitidoBlockchain: true }
            : s
        )
      );

      if (targetStudent.inscripcion_id === formData.inscripcion_id) {
        setFormData(updatedStudent);
      }

      setBlockchainModalState({
        isOpen: true,
        modalData: {
          estudiante: updatedStudent,
          hashReal: hashReal,
          yaExistia: yaExistia,
          message: messageResponse,
        },
        // 5. Pasar hashReal a la función de PDF
        onConfirmPrint: () => generarPDFBoletaOficial(updatedStudent, hashReal, txHash),
      });

    } catch (error) {
      showFeedback("Error al Certificar", error.message || "No se pudo conectar con el servicio Blockchain.", "error");
    } finally {
      setDownloadingBoleta(false);
    }
  };

  const handleToggleEstadoVerificacionPago = async () => {
    if (!pagoModalData || !pagoModalData.pago_id) return;
    
    setPagoModalSaving(true);
    try {
      const nuevoEstado = pagoModalData.verificacion === 'verificado' ? 'rechazado' : 'verificado';
      
      await pagosService.update(pagoModalData.pago_id, { verificacion: nuevoEstado });
      
      showFeedback("Verificación Actualizada", `El comprobante de pago ha sido marcado como ${nuevoEstado.toUpperCase()}.`, "success");
      
      setPagoModalData((prev) => ({ ...prev, verificacion: nuevoEstado }));
      await fetchData(pagoModalData.inscripcion_id);
    } catch (error) {
      showFeedback("Error", error.message || "No se pudo cambiar la verificación del pago.", "error");
    } finally {
      setPagoModalSaving(false);
    }
  };

  const clearFilters = () => {
    setFilterFacultad("TODAS");
    setFilterFinanciero("TODOS");
    setSearchQuery("");
    setSortBy("nombre");
  };

  const getCursosModal = (studentData) => {
    if (!studentData) return [];
    const result = [];
    
    const fMain = facultades.find((f) => String(f.facultad_id) === String(studentData.facultad_id));
    if (fMain) {
      const cMain = fMain.cursos?.find((c) => String(c.curso_id) === String(studentData.curso_id));
      if (cMain) result.push(cMain.nombre || cMain.codigo);
    }

    (studentData.cursos_adicionales || []).forEach(ext => {
      const f = facultades.find(fac => String(fac.facultad_id) === String(ext.facultad_id));
      const c = f?.cursos?.find(cur => String(cur.curso_id) === String(ext.curso_id));
      if (c && !result.includes(c.nombre || c.codigo)) {
        result.push(c.nombre || c.codigo);
      }
    });

    return result.length > 0 ? result : ["Sin cursos asignados"];
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-orange-50/40 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-6 p-4 sm:p-8 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40 shadow-sm">
      
      <div className="hidden">
        <QRCodeSVG
          id="boleta-qr-svg"
          value={qrStringValue}
          size={200}
          level="H"
        />
      </div>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-orange-200/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Registro y Cobro de Estudiantes
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-0.5">
              SECRETARÍA ACADÉMICA · CONTROL SIMULTÁNEO DE ADMISIÓN Y PAGOS
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-full sm:w-72 items-center rounded-xl border border-orange-200/70 bg-white px-3 py-2.5 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por C.I., nombre, UUID..."
              className="ml-2 w-full bg-transparent text-sm outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          <button
            type="button"
            onClick={handleNewClick}
            className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
          >
            <Plus size={18} /> Nuevo Estudiante
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <StatCard
          icon={Users}
          label="Inscritos Totales"
          value={stats.total}
          accent="text-orange-600 bg-orange-100/80 border border-orange-200/50"
        />
        
        <StatCard
          icon={ShieldCheck}
          label="Registros con Pago"
          value={stats.pagados}
          accent="text-emerald-600 bg-emerald-100/80 border border-emerald-200/50"
        />
      </div>

      <div className="rounded-2xl border border-orange-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Filter size={14} /> Filtrar por:
            </span>

            <select
              value={filterFacultad}
              onChange={(e) => setFilterFacultad(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="TODAS">Todas las facultades</option>
              {facultades.map((f) => (
                <option key={f.facultad_id} value={String(f.facultad_id)}>
                  {f.nombre}
                </option>
              ))}
            </select>

            <select
              value={filterFinanciero}
              onChange={(e) => setFilterFinanciero(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="TODOS">Todos los estados de pago</option>
              {catalogos.estados_pago.map((ep) => (
                <option key={ep.estado_pago_id} value={ep.codigo}>
                  {ep.nombre}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="nombre">Ordenar: Nombre</option>
                <option value="deuda">Ordenar: Deuda</option>
                <option value="reciente">Ordenar: Pago reciente</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Limpiar filtros
            </button>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="flex flex-col rounded-2xl border border-orange-200/70 bg-white shadow-sm lg:col-span-5 overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Listado de Estudiantes</h3>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
              Postulantes Inscritos
            </span>
          </div>

          <div className="flex bg-slate-50 border-b border-slate-100 px-2 pt-2">
            <button
              onClick={() => setTabLista("sin_comprobante")}
              className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-2.5 border-b-2 transition-all ${
                tabLista === "sin_comprobante" 
                  ? "border-orange-500 text-orange-600 bg-white rounded-t-lg" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sin Comprobante
            </button>
            <button
              onClick={() => setTabLista("con_comprobante")}
              className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-2.5 border-b-2 transition-all ${
                tabLista === "con_comprobante" 
                  ? "border-emerald-500 text-emerald-600 bg-white rounded-t-lg" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Con Comprobante
            </button>
          </div>

          <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-sm font-medium text-slate-400">
                Ningún estudiante coincide con los filtros aplicados.
              </p>
            ) : (
              filtered.map((s) => {
                const active = s.inscripcion_id === selectedId;
                const facNombre = facultades.find((f) => String(f.facultad_id) === String(s.facultad_id))?.nombre || "Facultad";

                return (
                  <div
                    key={s.inscripcion_id}
                    className={`group relative flex items-center justify-between gap-3 p-3.5 transition-all ${
                      active ? "bg-orange-50/90 border shadow-sm" : "hover:bg-slate-50/80 border border-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectStudent(s)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-inner ${
                          active ? "bg-orange-500 text-white" : "bg-[#0B1120] text-orange-400 "
                        }`}
                      >
                        {initials(`${s.nombre} ${s.apellido}`)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-slate-900 uppercase">
                            {s.nombre} {s.apellido}
                          </p>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-600 uppercase tracking-wider">
                            {s.verificacion || "S/E"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                          C.I. {s.ci} · {s.cursos_adicionales?.length > 0 ? `(${s.cursos_adicionales.length + 1} Programas)` : facNombre} 
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPagoModalData(s); }}
                        title="Ver Comprobante de Pago"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100/60 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCertificarYPreguntarImpresion(e, s)}
                        title="Certificar y Emitir Boleta QR"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/60 rounded-lg transition-colors"
                      >
                        <QrCode size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => selectStudent(s)}
                        title="Editar registro"
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100/60 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      <button
                        type="button"
                        onClick={(e) => openDeleteModal(s.inscripcion_id, s.nombre, s.apellido, e)}
                        title="Eliminar Estudiante"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100/60 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-6 text-white shadow-xl">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-orange-500/10 pointer-events-none" />
            <div className="absolute -right-2 bottom-0 h-24 w-24 rounded-full bg-orange-500/10 pointer-events-none" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                  Credencial Estudiantil · {formData.codigo_inscripcion || "PENDIENTE"}
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight leading-tight uppercase">
                  {formData.nombre || formData.apellido
                    ? `${formData.nombre} ${formData.apellido}`
                    : "Nuevo Estudiante"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  C.I. {formData.ci || "—"} · Usuario: <span className="font-mono text-orange-300">{isNew ? previewUsername : formData.username}</span>
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-orange-400/60 bg-white/5 text-xl font-black text-orange-300 shadow-inner">
                {formData.nombre ? (
                  initials(`${formData.nombre} ${formData.apellido}`)
                ) : (
                  <User size={26} />
                )}
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between border-t border-dashed border-white/15 pt-4">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-300 uppercase tracking-wide">
                <ShieldCheck size={14} /> Pago: {formData.estado_pago || "Registrado"}
              </span>

              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-black/40 px-3 py-1 rounded-lg border border-slate-700">
                <Radio size={13} className={formData.uuid ? "text-emerald-400" : "text-amber-400"} />
                RFID: {formData.uuid || "SIN ASIGNAR"}
              </span>

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ID #{formData.inscripcion_id ?? "NUEVO"}
              </span>
            </div>
          </div>

          <Section icon={User} title="Identidad del Estudiante y Credencial RFID">
            <Field label="Nombres *">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Ana María"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>
            <Field label="Apellidos *">
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ej. Torrez Mamani"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>
            <Field label="Carnet de Identidad *" icon={CreditCard}>
              <input
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleInputChange}
                placeholder="0000000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>
            <Field label="Número Celular" icon={Phone}>
              <input
                type="text"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="600 00 000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl text-white ${modoLecturaRFID ? "bg-emerald-600" : "bg-slate-700"}`}>
                    {modoLecturaRFID ? <Wifi size={16} className="animate-pulse" /> : <Keyboard size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Asignación Código UUID / Tarjeta RFID
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500">
                      {modoLecturaRFID
                        ? "Modo Lectura Activo: Acerque la tarjeta al lector de hardware"
                        : "Modo Teclado: Ingrese manualmente el código UUID"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModoLecturaRFID((prev) => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm transition-all active:scale-95 ${
                    modoLecturaRFID
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {modoLecturaRFID ? (
                    <>
                      <Wifi size={14} className="text-emerald-600" /> Cambiar a Manual
                    </>
                  ) : (
                    <>
                      <Keyboard size={14} className="text-slate-500" /> Cambiar a Escaneo RFID
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="uuid"
                  value={formData.uuid}
                  onChange={handleInputChange}
                  readOnly={modoLecturaRFID}
                  placeholder={
                    modoLecturaRFID
                      ? "Esperando lectura de tarjeta RFID..."
                      : "Ingrese el UUID manualmente..."
                  }
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono font-bold outline-none transition-colors ${
                    modoLecturaRFID
                      ? "bg-emerald-50/50 border-emerald-300 text-emerald-900 cursor-not-allowed"
                      : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
                  }`}
                />
                {modoLecturaRFID && (
                  <span className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Listo para lectura
                  </span>
                )}
              </div>
            </div>

            {isNew ? (
              <div className="md:col-span-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                  <Sparkles size={15} /> Credenciales Iniciales Autogeneradas
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 font-mono">
                  <span className="bg-white px-3 py-2 rounded-lg border border-amber-200/80 shadow-sm">
                    Usuario: <strong>{previewUsername}</strong>
                  </span>
                  <span className="bg-white px-3 py-2 rounded-lg border border-amber-200/80 shadow-sm">
                    Contraseña: <strong>{previewPassword}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <>
                <Field label="Nombre de Usuario (Auth) *" icon={User}>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="@ana_torrez"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
                  />
                </Field>
                <Field label="Cambiar Contraseña (Opcional)" icon={Lock}>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Dejar vacío para conservar actual"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
                  />
                </Field>
              </>
            )}
          </Section>

          <Section icon={BookOpen} title="Asignación Académica (Programas)">
            <div className="md:col-span-2 flex items-end gap-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Facultad *
                  </label>
                  <select
                    name="facultad_id"
                    value={formData.facultad_id}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
                  >
                    <option value="">Seleccione una facultad</option>
                    {facultades.map((f) => (
                      <option key={f.facultad_id} value={String(f.facultad_id)}>
                        {f.codigo} — {f.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Curso / Programa *
                  </label>
                  <select
                    name="curso_id"
                    value={formData.curso_id}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
                  >
                    <option value="">Seleccione un curso</option>
                    {cursosDisponibles.map((c) => (
                      <option key={c.curso_id} value={String(c.curso_id)}>
                        {c.codigo} — {c.nombre || "Programa"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCursoExtra}
                title="Añadir otro curso a este estudiante"
                className="flex items-center justify-center p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all active:scale-95 mb-0.5"
              >
                <Plus size={20} />
              </button>
            </div>

            {(formData.cursos_adicionales || []).map((extra, idx) => {
              const facExtra = facultades.find((f) => String(f.facultad_id) === String(extra.facultad_id));
              const cursosExtraList = facExtra?.cursos || [];

              return (
                <div key={extra.id || idx} className="md:col-span-2 flex items-end gap-2 bg-orange-50/50 p-3 rounded-2xl border border-orange-200/60 animate-in fade-in duration-200">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                        Facultad Extra #{idx + 2}
                      </label>
                      <select
                        value={extra.facultad_id}
                        onChange={(e) => handleCursoExtraChange(extra.id, "facultad_id", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-400"
                      >
                        <option value="">Seleccione facultad</option>
                        {facultades.map((f) => (
                          <option key={f.facultad_id} value={String(f.facultad_id)}>
                            {f.codigo} — {f.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                        Curso Extra #{idx + 2}
                      </label>
                      <select
                        value={extra.curso_id}
                        onChange={(e) => handleCursoExtraChange(extra.id, "curso_id", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-400"
                      >
                        <option value="">Seleccione curso</option>
                        {cursosExtraList.map((c) => (
                          <option key={c.curso_id} value={String(c.curso_id)}>
                            {c.codigo} — {c.nombre || "Programa"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCursoExtra(extra.id)}
                    title="Remover este curso extra"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors mb-0.5"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            <Field label="Turno Académico">
              <select
                name="turno"
                value={formData.turno}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
                {catalogos.turnos.map((t) => (
                  <option key={t.turno_id} value={t.nombre}>
                    {t.codigo === "MANANA" ? "Mañana" : t.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Observaciones de Admisión" icon={AlignLeft} span2>
              <textarea
                name="observaciones"
                rows="2"
                value={formData.observaciones}
                onChange={handleInputChange}
                placeholder="Observaciones de la inscripción, documentación..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white resize-none"
              />
            </Field>
          </Section>

          <Section icon={DollarSign} title="Registro de Pago y Liquidación">
            <Field label="Monto a Cobrar / Abonar (Bs.) *">
              <input
                type="number"
                step="0.50"
                name="monto_abonado"
                value={formData.monto_abonado !== "" && formData.monto_abonado !== null && !isNaN(formData.monto_abonado) ? parseFloat(formData.monto_abonado) : ""}
                onChange={handleInputChange}
                placeholder="450.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-black text-emerald-700 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Medio de Pago">
              <select
                name="medio_pago"
                value={formData.medio_pago}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
               {catalogos.medios_pago.map((m) => {
  // Limpiamos el texto si contiene la palabra QR o Móvil
  let textoMostrado = m.nombre;
  if (m.nombre.includes("QR") || m.nombre.includes("M") || m.nombre.includes("Móvil")) {
    textoMostrado = "Pago Móvil QR";
  }

  return (
    <option key={m.medio_pago_id} value={m.nombre}>
      {textoMostrado}
    </option>
  );
})}
              </select>
            </Field>

            <Field label="Concepto de Cobro">
              <input
                type="text"
                name="concepto_pago"
                value={formData.concepto_pago}
                onChange={handleInputChange}
                placeholder="Inscripción y Primera Cuota"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Estado de la Cuenta">
              <select
                name="estado_pago"
                value={formData.estado_pago}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
                <option value="">Seleccione estado de pago</option>
                {catalogos.estados_pago.map((ep) => (
                  <option key={ep.estado_pago_id} value={ep.codigo}>
                    {ep.nombre}
                  </option>
                ))}
              </select>
            </Field>

            {!isNew && (
              <div className="md:col-span-2 mt-2">
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mb-2">
                  <span className="text-xs font-bold text-slate-600">Historial de Transacciones</span>
                  <button
                    type="button"
                    onClick={() => setShowHistorial((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1.5 rounded-lg"
                  >
                    <History size={14} /> {showHistorial ? "Ocultar historial" : "Ver historial de pagos"}
                  </button>
                </div>

                {showHistorial && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50 p-1">
                    {Array.isArray(formData.historial) && formData.historial.length === 0 ? (
                      <p className="p-4 text-center text-xs font-medium text-slate-400">Sin cobros previos registrados.</p>
                    ) : (
                      (formData.historial || []).map((h, i) => (
                        <div key={h.pago_id || i} className="flex items-center justify-between p-3 text-xs">
                          <div>
                            <span className="font-bold text-[#0B1120] block">{h.recibo} · {h.medio}</span>
                            <span className="text-slate-500 font-medium">{h.concepto} ({h.fecha})</span>
                          </div>
                          <span className="font-black text-emerald-600 text-sm">+{money(h.monto)}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </Section>

          <div className="rounded-2xl border border-orange-200 bg-orange-100/60 p-5 shadow-inner">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
              <Settings size={16} /> Panel de Control de Secretaría Académica
            </h3>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Check size={18} />
                    {isNew ? "Registrar Estudiante y Cobrar" : "Actualizar Registro y Liquidar"}
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleNewClick}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-white py-2.5 text-xs font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50 active:scale-[0.98]"
                >
                  <Plus size={15} /> Nuevo
                </button>

              

                <button
                  type="button"
                  onClick={(e) => handleCertificarYPreguntarImpresion(e)}
                  disabled={isNew || downloadingBoleta}
                  title="Certificar en Blockchain y Abrir Modal de Impresión"
                  className="group relative flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {downloadingBoleta ? (
                    <Loader2 size={15} className="animate-spin text-white" />
                  ) : (
                    <>
                      <QrCode size={15} className="text-emerald-200 transition-transform group-hover:scale-110" />
                      <span>Boleta QR</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => openDeleteModal(formData.inscripcion_id, formData.nombre, formData.apellido, e)}
                  disabled={isNew || saving}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={15} /> Eliminar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modalState.isOpen}
        onClose={closeFeedback}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        studentName={deleteModalState.studentName}
      />

      <BlockchainEmisionModal
        isOpen={blockchainModalState.isOpen}
        onClose={() => setBlockchainModalState((prev) => ({ ...prev, isOpen: false }))}
        modalData={blockchainModalState.modalData}
        onConfirmPrint={blockchainModalState.onConfirmPrint}
      />

    {pagoModalData && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => { setPagoModalData(null); setShowFullImage(false); }}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-slate-800 border-b pb-3 flex items-center gap-2">
              <Eye className="text-orange-500" size={22} /> Detalles de Pago y Comprobante
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Información del Estudiante</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="block text-slate-500 text-[11px]">Estudiante</span>
                    <strong className="text-slate-800 uppercase">{pagoModalData.nombre} {pagoModalData.apellido}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Inscripción / CI</span>
                    <strong className="text-slate-800">{pagoModalData.codigo_inscripcion} · CI {pagoModalData.ci}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Abono Reportado</span>
                    <strong className="text-emerald-600">Bs. {Number(pagoModalData.monto_abonado)}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Estado de Verificación</span>
                    <strong className={`uppercase text-[11px] px-2 py-0.5 rounded ${
                      pagoModalData.verificacion === 'verificado' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : pagoModalData.verificacion === 'rechazado' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pagoModalData.verificacion || "PENDIENTE"}
                    </strong>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <span className="block text-slate-500 text-[11px] mb-1">Cursos Tomados en esta Inscripción</span>
                  <ul className="list-disc list-inside text-[11px] font-bold text-slate-700">
                    {getCursosModal(pagoModalData).map((cName, i) => (
                      <li key={i} className="truncate">{cName}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {pagoModalData.fotoComprobante ? (
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 self-start">Comprobante Adjunto</p>
                  <button
                    type="button"
                    onClick={() => setShowFullImage(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Eye size={16} /> Ver Comprobante en Grande
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 flex flex-col items-center text-center">
                  <span className="p-3 bg-white shadow-sm rounded-full mb-2">
                    <FileText size={24} className="text-slate-300" />
                  </span>
                  <p className="text-sm font-bold text-slate-500">Sin Comprobante de Pago</p>
                  <p className="text-xs text-slate-400 mt-1">El estudiante no subió una foto del comprobante para este pago.</p>
                </div>
              )}
            </div>

            {pagoModalData.fotoComprobante && (
              <div className="border-t pt-4 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-medium">Revisión por Secretaría:</span>
                <div className="flex gap-2">
                  {pagoModalData.verificacion !== 'rechazado' && (
                    <button
                      onClick={handleToggleEstadoVerificacionPago}
                      disabled={pagoModalSaving}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        pagoModalData.verificacion === 'verificado'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      }`}
                    >
                      {pagoModalSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          {pagoModalData.verificacion === 'verificado' ? <Ban size={14} /> : <Check size={14} />} 
                          {pagoModalData.verificacion === 'verificado' ? 'Rechazar Pago' : 'Aprobar Pago'}
                        </>
                      )}
                    </button>
                  )}
                  {pagoModalData.verificacion === 'rechazado' && (
                    <button
                      onClick={handleToggleEstadoVerificacionPago}
                      disabled={pagoModalSaving}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                    >
                      {pagoModalSaving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Aprobar Pago</>}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* MODAL SECUNDARIA PARA VER LA IMAGEN EN GRANDE */}
            {showFullImage && pagoModalData.fotoComprobante && createPortal(
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="relative max-w-4xl max-h-[95vh] flex flex-col items-center">
                  <button
                    onClick={() => setShowFullImage(false)}
                    className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                  >
                    <X size={22} />
                  </button>
                  <img
                    src={pagoModalData.fotoComprobante.startsWith('data:') ? pagoModalData.fotoComprobante : `data:image/jpeg;base64,${pagoModalData.fotoComprobante}`}
                    alt="Comprobante Ampliado"
                    className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 bg-black/40"
                  />
                  <button
                    onClick={() => setShowFullImage(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cerrar Imagen
                  </button>
                </div>
              </div>,
              document.body
            )}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.01]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${accent}`}>
        <Icon size={21} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-lg font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-orange-200/70 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3 text-base font-bold text-slate-800">
        <Icon className="text-orange-500" size={21} /> {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, span2, children }) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {Icon && <Icon size={14} className="text-slate-400" />} {label}
      </label>
      {children}
    </div>
  );
}