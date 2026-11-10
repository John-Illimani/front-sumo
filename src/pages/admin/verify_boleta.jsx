import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode } from "html5-qrcode";
import * as pdfjsLib from "pdfjs-dist";
import {
  ShieldCheck,
  Camera,
  FileUp,
  Search,
  Check,
  X,
  User,
  Loader2,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  Radio,
  ExternalLink,
  CreditCard,
  GraduationCap,
  KeyRound,
  IdCard
} from "lucide-react";

import { blockchainBoletaService } from "../../services/admin/blockchainBoletaService";
import { blockchainService } from "../../services/admin/blockchainService";

if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  } catch (e) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
}

// --- SERVICIOS AÑADIDOS SEGÚN REQUERIMIENTO ---

const API_URL = import.meta.env.VITE_API_URL+'/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const studentService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener estudiantes');
    return data; 
  }
};
// ----------------------------------------------

async function generarHashInscripcionJS(datos, textoCertificadoParam = "") {
  const textoFinal = String(
    textoCertificadoParam || datos.textoCertificado || datos.texto_certificado || ""
  ).trim();

  const payload = {
    ci: String(datos.ci || "").trim(),
    curso: String(datos.programa || datos.curso || "").trim().toUpperCase(),
    facultad: String(datos.facultad || "").trim().toUpperCase(),
    nombreCompleto: String(datos.nombreCompleto || datos.nombres || datos.nombre_completo || "").trim().toUpperCase(),
    textoCertificado: textoFinal,
  };

  const payloadOrdenado = Object.keys(payload)
    .sort()
    .reduce((obj, key) => {
      obj[key] = payload[key];
      return obj;
    }, {});

  const payloadString = JSON.stringify(payloadOrdenado);
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generarHashBoletaJS(datos) {
  const rawString = [
    String(datos.nombreCompleto || datos.nombre_completo || datos.nombres || "").trim().toUpperCase(),
    String(datos.ci || "").trim(),
    String(datos.uuid || "").trim(),
    String(datos.reciboNro || datos.recibo_nro || "").trim(),
    Number(datos.montoAbonado || datos.monto_abonado || 0).toFixed(2),
    String(datos.concepto || "").trim(),
    String(datos.medioPago || datos.medio_pago || "").trim(),
    String(datos.fechaPago || datos.fecha_pago || "").trim(),
    String(datos.codigoInscripcion || datos.codigo_inscripcion || "").trim(),
    String(datos.curso || datos.programa || "").trim()
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// MODAL ORIGINAL: Para Blockchain/DB (QR y PDF)
const SoftFeedbackModal = ({ isOpen, onClose, resultadoData }) => {
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

  if (!render || !resultadoData) return null;

  const isSuccess = resultadoData.registrado;
  const data = resultadoData.data || {};
  const registro = data.registro || data.estudiante || data.boleta || {};

  const theme = isSuccess
    ? {
        badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
        glowColor: "bg-emerald-500/20",
        btnBg: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-700/25",
        title: "Documento Íntegro y Válido",
        subtitle: "Verificación Smart Contract Exitosa",
      }
    : {
        badge: "bg-red-500/10 text-red-600 border-red-500/20",
        iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
        glowColor: "bg-red-500/20",
        btnBg: "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-700/25",
        title: "No Encontrado o Alterado",
        subtitle: "Fallo en Verificación Criptográfica",
      };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none font-sans overflow-y-auto">
      <div
        className={`fixed inset-0 w-screen h-screen bg-[#0B1120]/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/95 p-7 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 z-10 my-auto ${
          visible ? "scale-100 opacity-100" : "opacity-0 scale-95"
        }`}
      >
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${theme.glowColor} blur-3xl pointer-events-none`} />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${theme.iconBg} text-white shadow-xl ring-4 ring-white`}>
              {isSuccess ? <CheckCircle2 size={40} strokeWidth={2.2} /> : <AlertCircle size={40} strokeWidth={2.2} />}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-widest ${theme.badge}`}>
            <Sparkles size={13} /> {theme.subtitle}
          </span>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {theme.title}
          </h3>

          {isSuccess ? (
            <div className="mt-4 w-full text-left space-y-2.5 bg-gradient-to-br from-slate-50 to-orange-50/30 p-4 sm:p-5 rounded-2xl border border-orange-100/80 text-xs text-slate-700">
              <div className="flex justify-between border-b border-orange-100/60 pb-2">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5 "><User size={14}/> Nombre Completo:</span>
                <span className="font-bold text-slate-900 uppercase">{registro.nombres || registro.nombreCompleto || registro.nombre_completo || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-orange-100/60 pb-2">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5"><CreditCard size={14}/> C.I.:</span>
                <span className="font-bold text-slate-900">{registro.ci || "N/A"}</span>
              </div>
              {(registro.celular || registro.telefono) && (
                <div className="flex justify-between border-b border-orange-100/60 pb-2">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5"><Phone size={14}/> Celular / Teléfono:</span>
                  <span className="font-bold text-slate-900">{registro.celular || registro.telefono}</span>
                </div>
              )}
              {(registro.programa || registro.curso) && (
                <div className="flex justify-between border-b border-orange-100/60 pb-2">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5"><GraduationCap size={14}/> Programa / Curso:</span>
                  <span className="font-bold text-slate-900">{registro.programa || registro.curso}</span>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 text-[11px]">Hash Transacción / Blockchain:</span>
                
                </div>
                <span className="block font-mono text-[10px] font-medium text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200/80 shadow-inner">
                  {resultadoData.hashCalculado || "0x..."}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 bg-red-50 p-4 rounded-2xl border border-red-100 w-full text-left">
              <p className="font-bold text-red-700 mb-1">El documento o Hash no coincide con los registros:</p>
              <p className="text-xs text-red-600 mb-3">{resultadoData.error}</p>
              <span className="block font-mono text-[10px] font-medium text-slate-800 break-all bg-white p-2 rounded-xl border border-red-200">
                Hash evaluado: {resultadoData.hashCalculado || "N/A"}
              </span>
            </div>
          )}
          <div className="mt-6 flex w-full items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`flex w-full items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${theme.btnBg}`}
            >
              Cerrar y Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// NUEVO MODAL: Exclusivo para verificación de UUID (Lectura RFID)
const RfidFeedbackModal = ({ isOpen, onClose, resultadoData }) => {
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

  if (!render || !resultadoData) return null;

  const isSuccess = resultadoData.encontrado;

  const theme = isSuccess
    ? {
        badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        glowColor: "bg-blue-500/20",
        btnBg: "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-blue-700/25",
        title: "Usuario Identificado",
        subtitle: "Lectura RFID Exitosa",
      }
    : {
        badge: "bg-red-500/10 text-red-600 border-red-500/20",
        iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
        glowColor: "bg-red-500/20",
        btnBg: "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-700/25",
        title: "UUID No Registrado",
        subtitle: "Fallo de Autenticación",
      };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none font-sans overflow-y-auto">
      <div
        className={`fixed inset-0 w-screen h-screen bg-[#0B1120]/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/95 p-7 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 z-10 my-auto ${
          visible ? "scale-100 opacity-100" : "opacity-0 scale-95"
        }`}
      >
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${theme.glowColor} blur-3xl pointer-events-none`} />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-90"
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${theme.iconBg} text-white shadow-xl ring-4 ring-white`}>
              {isSuccess ? <IdCard size={40} strokeWidth={2.2} /> : <AlertCircle size={40} strokeWidth={2.2} />}
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-widest ${theme.badge}`}>
            <Radio size={13} /> {theme.subtitle}
          </span>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            {theme.title}
          </h3>

          {isSuccess ? (
            <div className="mt-4 w-full text-left space-y-2.5 bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-5 rounded-2xl border border-blue-100/80 text-xs text-slate-700">
              <div className="flex justify-between border-b border-blue-100/60 pb-2">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5"><User size={14}/> Nombre:</span>
                <span className="font-bold text-slate-900 capitalize">{resultadoData.nombreCompleto}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100/60 pb-2">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5"><CreditCard size={14}/> C.I.:</span>
                <span className="font-bold text-slate-900">{resultadoData.ci}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5"><KeyRound size={14}/> UUID:</span>
                <span className="font-mono text-slate-800">{resultadoData.uuid}</span>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 bg-red-50 p-4 rounded-2xl border border-red-100 w-full text-left">
              <p className="font-bold text-red-700 mb-1">El UUID no coincide con ningún registro:</p>
              <p className="text-xs text-red-600 mb-3">{resultadoData.error}</p>
              <span className="block font-mono text-[10px] font-medium text-slate-800 break-all bg-white p-2 rounded-xl border border-red-200">
                UUID leído: {resultadoData.uuid || "N/A"}
              </span>
            </div>
          )}

          <div className="mt-6 flex w-full items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`flex w-full items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${theme.btnBg}`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};


export const VerificarBoleta = () => {
  const [metodo, setMetodo] = useState("qr_camara");
  const [inputValue, setInputValue] = useState("");
  const [rfidInput, setRfidInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  
  // Nuevos estados para el Modal RFID
  const [rfidModalOpen, setRfidModalOpen] = useState(false);
  const [rfidModalData, setRfidModalData] = useState(null);
  
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const rfidBufferRef = useRef("");
  const rfidTimerRef = useRef(null);
  const metodoActualRef = useRef(metodo);

  const notify = (message, tone = "ok") => setToast({ message, tone });

  useEffect(() => {
    metodoActualRef.current = metodo;
  }, [metodo]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (metodo === "qr_camara") {
      iniciarCamara();
    } else {
      detenerCamara();
    }
    return () => detenerCamara();
  }, [metodo]);

  // Listener global optimizado para lector RFID (simula teclado)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Evitar conflictos si el usuario está escribiendo en algún input activo
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "Enter") {
        if (rfidBufferRef.current.trim()) {
          const codeScanned = rfidBufferRef.current.trim();
          rfidBufferRef.current = "";
          setRfidInput(codeScanned);
          notify("Etiqueta detectada", "ok");
          
          // Lógica condicional: si estamos en modo rfid buscar UUID en base de datos.
          if (metodoActualRef.current === "rfid") {
            procesarRfidUuid(codeScanned);
          } else {
            procesarEntradaVerificacion(codeScanned);
          }
        }
      } else if (e.key.length === 1) {
        rfidBufferRef.current += e.key;
        if (rfidTimerRef.current) clearTimeout(rfidTimerRef.current);
        rfidTimerRef.current = setTimeout(() => {
          rfidBufferRef.current = "";
        }, 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const iniciarCamara = async () => {
    setTimeout(async () => {
      try {
        if (scannerRef.current) await detenerCamara();

        const html5QrCode = new Html5Qrcode("reader-camera-main");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
              if (scannerRef.current?.isScanning) {
                await scannerRef.current.pause(true);
              }
            } catch (e) {}

            await procesarEntradaVerificacion(decodedText);
            isProcessingRef.current = false;
          },
          () => {}
        );
      } catch (err) {
        notify("No se pudo iniciar la cámara", "error");
      }
    }, 300);
  };

  const detenerCamara = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {}
      scannerRef.current = null;
    }
  };

  const verificarEnDBYBlockchain = async (hash) => {
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      throw new Error(`El valor no es un Hash SHA-256 válido. Recibido: ${hash}`);
    }
    let dataRes = null;
    try {
      dataRes = await blockchainBoletaService.verificar(hash);
      if (dataRes && (dataRes.valid || dataRes.registrado || dataRes.boleta || dataRes.registro)) {
        return dataRes;
      }
    } catch (e1) {}

    try {
      dataRes = await blockchainService.verificar(hash);
      if (dataRes && (dataRes.valid || dataRes.registrado || dataRes.estudiante || dataRes.registro)) {
        return dataRes;
      }
    } catch (e2) {}

    throw new Error("El Hash de la firma no figura en los registros de la Base de Datos ni en Blockchain.");
  };

  const extraerYNormalizarHash = async (rawText) => {
    let text = rawText.trim();
    if (text.includes("http://") || text.includes("https://")) {
      try {
        const urlObj = new URL(text);
        const paramHash = urlObj.searchParams.get("hash") || urlObj.searchParams.get("id");
        if (paramHash) text = paramHash.trim();
      } catch (e) {}
    }
    if (text.includes("HASH:")) {
      const parteHash = text.split("HASH:")[1]?.trim();
      if (parteHash) {
        const matchHash = parteHash.match(/0x[a-fA-F0-9]{64}/i) || parteHash.match(/[a-fA-F0-9]{64}/i);
        if (matchHash) {
          const h = matchHash[0];
          return h.startsWith("0x") ? h.toLowerCase() : "0x" + h.toLowerCase();
        }
      }
    }
    const matchCon0x = text.match(/0x[a-fA-F0-9]{64}/i);
    if (matchCon0x) return matchCon0x[0].toLowerCase();
    const matchSin0x = text.match(/\b[a-fA-F0-9]{64}\b/i);
    if (matchSin0x) return "0x" + matchSin0x[0].toLowerCase();

    if (text.startsWith("{")) {
      try {
        const datos = JSON.parse(text);
        if (datos.hash && /^0x?[a-fA-F0-9]{64}$/.test(datos.hash)) {
          return datos.hash.startsWith("0x") ? datos.hash.toLowerCase() : "0x" + datos.hash.toLowerCase();
        }
        if (datos.reciboNro || datos.recibo_nro || datos.uuid) {
          return await generarHashBoletaJS(datos);
        }
        return await generarHashInscripcionJS(datos);
      } catch (e) {}
    }

    const cleaned = text.replace(/[^a-fA-F0-9]/g, "");
    if (cleaned.length === 64) {
      return "0x" + cleaned.toLowerCase();
    }
    return text;
  };

  const procesarEntradaVerificacion = async (cadenaTexto) => {
    let rawText = (cadenaTexto || inputValue).trim();
    if (!rawText) {
      notify("Ingrese un Hash o seleccione una opción de escaneo", "error");
      return;
    }
    setIsScanning(true);
    try {
      const hashFinalCalculado = await extraerYNormalizarHash(rawText);
      setInputValue(hashFinalCalculado);
      const data = await verificarEnDBYBlockchain(hashFinalCalculado);
      setModalData({ registrado: true, data: data, hashCalculado: hashFinalCalculado });
      setModalOpen(true);
      notify("Documento verificado correctamente", "ok");
    } catch (error) {
      setModalData({ registrado: false, error: error.message || "No se encontró coincidencia en el sistema ni en Blockchain.", hashCalculado: rawText });
      setModalOpen(true);
      notify("Documento no registrado o alterado", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // NUEVA FUNCIÓN: Búsqueda específica por UUID de la base de datos mostrada en image_362ac9.png
  const procesarRfidUuid = async (uuidScanned) => {
    let targetUuid = (uuidScanned || rfidInput).trim();
    if (!targetUuid) {
      notify("Ingrese o escanee un UUID válido", "error");
      return;
    }
    setIsScanning(true);
    try {
      const usuarios = await studentService.getAll();
      
      // Busca coincidencias usando la estructura definida (nombre, apellido, ci, uuid)
      const usuarioEncontrado = usuarios.find(u => String(u.uuid) === String(targetUuid));

      if (usuarioEncontrado) {
        setRfidModalData({
          encontrado: true,
          nombreCompleto: `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`,
          ci: usuarioEncontrado.ci,
          uuid: targetUuid
        });
        setRfidModalOpen(true);
      } else {
        setRfidModalData({
          encontrado: false,
          error: "El UUID ingresado no pertenece a ningún usuario activo.",
          uuid: targetUuid
        });
        setRfidModalOpen(true);
      }
    } catch (error) {
      setRfidModalData({
        encontrado: false,
        error: error.message || "Error de conexión con el servicio de estudiantes.",
        uuid: targetUuid
      });
      setRfidModalOpen(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubirPDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsScanning(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textoCompletoPDF = "";
      let qrDetectado = null;
      const escalasAProbar = [2.0];

      for (let i = 1; i <= pdf.numPages; i++) {
        if (qrDetectado) break; 
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        textoCompletoPDF += pageText + "\n";

        for (const scale of escalasAProbar) {
          if (qrDetectado) break;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { willReadFrequently: true });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
          if (!blob) continue;
          const imageFile = new File([blob], `page_${i}_s${scale}.png`, { type: "image/png" });
          const html5QrCode = new Html5Qrcode("reader-hidden-main");
          try {
            const decodedResult = await html5QrCode.scanFile(imageFile, false);
            if (decodedResult) {
              qrDetectado = decodedResult;
            }
          } catch (qrErr) {
          } finally {
            try {
              await html5QrCode.clear();
            } catch (e) {}
          }
        }
      }

      const contenidoFinal = qrDetectado || textoCompletoPDF;
      if (contenidoFinal.trim()) {
        await procesarEntradaVerificacion(contenidoFinal);
      } else {
        throw new Error("No se extrajo ningún texto o QR válido del archivo PDF.");
      }
    } catch (err) {
      setIsScanning(false);
      setModalData({ registrado: false, error: err.message || "Error al procesar el archivo PDF.", hashCalculado: "Error de lectura" });
      setModalOpen(true);
      notify("No se encontró firma en el PDF", "error");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {}
    }
  };

  const handleReset = () => {
    setInputValue("");
    setRfidInput("");
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-5 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40">
      <div
        id="reader-hidden-main"
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "320px",
          height: "320px",
          overflow: "hidden",
        }}
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.tone === "error" ? "bg-red-600" : "bg-[#0B1120]"}`}>
          {toast.tone === "error" ? <X size={16} /> : <Check size={16} />}
          {toast.message}
        </div>
      )}

      {/* CABECERA */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Verificación</h2>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
        
        {/* SELECTOR DE MÉTODOS */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-orange-200/80 bg-orange-50/50 p-1.5">
          <button
            onClick={() => { setMetodo("qr_camara"); handleReset(); }}
            className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${metodo === "qr_camara" ? "bg-orange-500 text-white shadow" : "text-slate-600 hover:bg-orange-100/50"}`}
          >
            <Camera size={15} /> QR por Cámara
          </button>
          <button
            onClick={() => { setMetodo("qr_doc"); handleReset(); }}
            className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${metodo === "qr_doc" ? "bg-orange-500 text-white shadow" : "text-slate-600 hover:bg-orange-100/50"}`}
          >
            <FileUp size={15} /> PDF / Documento
          </button>
          <button
            onClick={() => { setMetodo("rfid"); handleReset(); }}
            className={`flex flex-1 justify-center items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${metodo === "rfid" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-orange-100/50"}`}
          >
            <Radio size={15} /> Lectura RFID (UUID)
          </button>
        </div>

        {/* MÉTODOS DE CAPTURA */}
        {metodo === "qr_camara" && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 p-6 text-center text-white">
            <p className="text-xs font-semibold text-slate-300">Apunta con la cámara al código QR del certificado o boleta</p>
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-orange-400 bg-black shadow-2xl">
              <div id="reader-camera-main" className="w-full h-64" />
            </div>
          </div>
        )}

        {metodo === "qr_doc" && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 p-8 text-center">
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleSubirPDF} className="hidden" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
              <FileUp size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Selecciona el documento PDF a verificar</p>
              {uploadedFileName && <p className="mt-1 text-xs font-mono text-orange-600 font-bold">{uploadedFileName}</p>}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-600 transition-all"
            >
              {isScanning ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
              {isScanning ? "Escaneando PDF..." : "Examinar Documento PDF"}
            </button>
          </div>
        )}

        {metodo === "rfid" && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-slate-50 py-10 px-6 text-center shadow-inner min-h-[280px]">
            <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-md border border-blue-100">
              <Radio size={36} className="text-blue-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-400/20 animate-ping"></div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Lectura por Lector o Búsqueda Manual</h3>
              <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                Aproxima la tarjeta al lector RFID conectado o ingresa el UUID manualmente en el campo inferior.
              </p>
            </div>

            {/* SECCIÓN DE BÚSQUEDA MANUAL AÑADIDA */}
            <div className="flex w-full max-w-md items-center gap-2 mt-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <KeyRound size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Ingrese el UUID manualmente..."
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      procesarRfidUuid(rfidInput);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => procesarRfidUuid(rfidInput)}
                disabled={isScanning}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Buscar
              </button>
            </div>

            {isScanning && (
              <div className="text-xs font-bold text-blue-600 flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin" /> Buscando coincidencia...
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL ORIGINAL (QR/PDF) */}
      <SoftFeedbackModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        resultadoData={modalData}
      />
      
      {/* NUEVO MODAL PARA UUID (RFID) */}
      <RfidFeedbackModal
        isOpen={rfidModalOpen}
        onClose={() => setRfidModalOpen(false)}
        resultadoData={rfidModalData}
      />
    </div>
  );
};