import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  Award,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Building2,
  Sparkles,
  QrCode,
  Landmark,
  Copy,
  Clock,
  BookOpen,
  ArrowRight,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Programas Académicos y Estado de Graduación del Estudiante
// ---------------------------------------------------------------------------
const ESTUDIANTE_ACTUAL = {
  nombres: "Gabriel Romario Quispe",
  ci: "10072003",
  codigoEstudiante: "EST-4758",
};

const PROGRAMAS_ESTUDIANTE = [
  {
    id: "PROG-ING-2026",
    facultad: "Fac. de Ingeniería",
    programa: "Preuniversitario de Ingeniería",
    estado: "completado", // completado | en_curso | pendiente
    fechaConclusion: "2026-07-28",
    promedioFinal: 88.5,
    totalHoras: 320,
    calificacionCualitativa: "Aprobado con Excelencia",
    materiasAprobadas: [
      { codigo: "CAL-101", nombre: "Cálculo I y Álgebra Lineal", nota: 92 },
      { codigo: "FIS-102", nombre: "Física Clásica y Mecánica", nota: 85 },
      { codigo: "QMC-103", nombre: "Química General Aplicada", nota: 89 },
    ],
    blockchain: {
      hashDiploma: "0x892aF0C3B5E0911762Cd44A17728B490E1F142D3C4B892019283749102938471",
      bloque: 20108920,
      timestamp: "2026-07-28 18:30:12",
      firmaNotarial: "SUMO-ACADEMIC-SEAL-ING-2026",
    },
  },
  {
    id: "PROG-INF-2026",
    facultad: "Carrera de Informática",
    programa: "Curso Propedéutico de Informática",
    estado: "en_curso",
    fechaConclusion: "Estimada: Septiembre 2026",
    promedioFinal: null,
    totalHoras: 280,
    calificacionCualitativa: "En avance académico (75%)",
    materiasAprobadas: [
      { codigo: "LOG-301", nombre: "Lógica Proposicional y Algoritmos", nota: 88 },
    ],
    blockchain: null,
    requisitoPendiente: "Completar la materia 'Estructuras Discretas' y presentar proyecto final.",
  },
  {
    id: "PROG-MED-2026",
    facultad: "Fac. de Medicina",
    programa: "Preuniversitario de Medicina Humana",
    estado: "pendiente",
    fechaConclusion: null,
    promedioFinal: null,
    totalHoras: 360,
    calificacionCualitativa: "No matriculado",
    materiasAprobadas: [],
    blockchain: null,
    requisitoPendiente: "Programa no iniciado en el plan de estudios del estudiante.",
  },
];

export const CertificadoConclusion = () => {
  const [selectedProgramaId, setSelectedProgramaId] = useState(PROGRAMAS_ESTUDIANTE[0].id);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (message, tone = "ok") => setToast({ message, tone });

  const programaSeleccionado = useMemo(() => {
    return (
      PROGRAMAS_ESTUDIANTE.find((p) => p.id === selectedProgramaId) ||
      PROGRAMAS_ESTUDIANTE[0]
    );
  }, [selectedProgramaId]);

  const esCompletado = programaSeleccionado.estado === "completado";

  const handleDescargarDiploma = () => {
    if (!esCompletado) {
      notify("El programa debe estar 100% completado para descargar el diploma", "error");
      return;
    }
    setIsGeneratingPDF(true);
    setTimeout(() => {
      setIsGeneratingPDF(false);
      notify(`Diploma de "${programaSeleccionado.programa}" descargado con éxito`);
    }, 1200);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    notify(`${label} copiado al portapapeles`);
  };

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-5 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
            toast.tone === "error" ? "bg-red-600" : "bg-[#0B1120]"
          }`}
        >
          {toast.tone === "error" ? <X size={16} /> : <Check size={16} />}
          {toast.message}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Certificados de Conclusión y Graduación
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide">
              ACREDITACIÓN DE EGRESO · DIPLOMAS ACADÉMICOS CON VALIDACIÓN CRIPTOGRÁFICA
            </p>
          </div>
        </div>

        {esCompletado && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-orange-300 bg-white px-3.5 py-2 text-xs font-bold text-orange-700 shadow-sm hover:bg-orange-50 active:scale-95"
            >
              <Printer size={15} /> Imprimir
            </button>
            <button
              onClick={handleDescargarDiploma}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download size={15} className={isGeneratingPDF ? "animate-bounce" : ""} />
              {isGeneratingPDF ? "Compilando PDF..." : "Descargar Diploma PDF"}
            </button>
          </div>
        )}
      </div>

      {/* Grid Principal: Programas (Izq) y Diploma Oficial de Graduación (Der) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Columna Izquierda: Programas Cursados */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <h3 className="text-sm font-bold text-slate-700 px-1 border-b border-slate-200/50 pb-2">
            Mis Programas y Facultades
          </h3>

          <div className="flex flex-col gap-3">
            {PROGRAMAS_ESTUDIANTE.map((prog) => {
              const isSelected = prog.id === selectedProgramaId;
              const isDone = prog.estado === "completado";

              return (
                <button
                  key={prog.id}
                  onClick={() => setSelectedProgramaId(prog.id)}
                  className={`flex flex-col gap-2.5 p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-orange-400 bg-orange-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        {prog.facultad}
                      </span>
                      <p className="font-black text-sm text-slate-800 leading-tight mt-0.5">
                        {prog.programa}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : prog.estado === "en_curso"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isDone ? "Graduado / Egresado" : prog.estado === "en_curso" ? "En Cursada" : "No iniciado"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-orange-500" /> {prog.totalHoras} Horas Académicas
                    </span>
                    {isDone && (
                      <span className="text-emerald-700 font-black text-xs">
                        Nota: {prog.promedioFinal}/100
                      </span>
                    )}
                  </div>

                  {!isDone && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200/60 p-2 text-[10px] font-medium text-amber-800 mt-1">
                      {prog.requisitoPendiente}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Diploma Oficial de Conclusión */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {!esCompletado ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
                <Lock size={32} />
              </div>
              <h4 className="text-base font-black text-slate-800">
                Certificado de Conclusión No Disponible
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 font-medium">
                Debes completar y aprobar todas las materias del programa <strong>{programaSeleccionado.programa}</strong> para desbloquear y sellar tu diploma en Blockchain.
              </p>
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-semibold">
                Estado: {programaSeleccionado.calificacionCualitativa}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-10 shadow-md">
              {/* Diploma Oficial A4 Estilizado */}
              <div className="relative border-8 border-double border-[#0B1120] p-6 sm:p-10 rounded-xl bg-gradient-to-b from-white via-orange-50/10 to-white">
                {/* Filigrana */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Landmark size={320} />
                </div>

                {/* Cabecera del Diploma */}
                <div className="relative text-center border-b-2 border-slate-800 pb-5 mb-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 font-black text-2xl shadow-md mb-3">
                    <Landmark size={30} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 leading-tight">
                    ACADEMIA SUPERIOR SUMO
                  </h1>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-600 mt-1">
                    DIRECCIÓN ACADÉMICA GENERAL · LA PAZ, BOLIVIA
                  </p>
                </div>

                {/* Título de Otorgación */}
                <div className="relative text-center my-6">
                  <p className="text-xs font-serif italic text-slate-500 mb-1">
                    Otorga el presente
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase underline decoration-orange-400 decoration-2 underline-offset-8">
                    Certificado de Conclusión
                  </h2>
                  <p className="text-xs font-serif italic text-slate-500 mt-3">
                    En favor de:
                  </p>
                </div>

                {/* Nombre del Estudiante */}
                <div className="relative text-center my-4">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                    {ESTUDIANTE_ACTUAL.nombres}
                  </p>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    C.I. N° {ESTUDIANTE_ACTUAL.ci} · Registro {ESTUDIANTE_ACTUAL.codigoEstudiante}
                  </p>
                </div>

                {/* Texto Acreditativo */}
                <div className="relative text-xs sm:text-sm text-slate-700 text-justify leading-relaxed my-6 font-medium space-y-3">
                  <p>
                    Por haber cumplido satisfactoriamente con la totalidad de la carga horaria ({programaSeleccionado.totalHoras} horas académicas) y haber aprobado con excelencia los módulos correspondientes a la <strong>{programaSeleccionado.facultad}</strong> en el programa:
                  </p>
                  <p className="text-center font-black text-base text-orange-950 uppercase my-2">
                    "{programaSeleccionado.programa}"
                  </p>
                  <p className="text-center text-xs font-bold text-emerald-800">
                    Promedio Final: {programaSeleccionado.promedioFinal} / 100 ({programaSeleccionado.calificacionCualitativa})
                  </p>
                </div>

                {/* Firmas Autorizadas */}
                <div className="relative mt-14 flex items-end justify-between px-4 sm:px-12 text-center">
                  <div className="flex-1">
                    <div className="mx-auto w-36 border-b border-slate-800 pb-8" />
                    <p className="text-[10px] font-bold text-slate-800 uppercase mt-1">
                      Coordinación Académica
                    </p>
                    <p className="text-[9px] text-slate-400">Facultad de Ingeniería</p>
                  </div>
                  <div className="flex-1">
                    <div className="mx-auto w-36 border-b border-slate-800 pb-8" />
                    <p className="text-[10px] font-bold text-slate-800 uppercase mt-1">
                      Dirección General
                    </p>
                    <p className="text-[9px] text-slate-400">Instituto SUMO</p>
                  </div>
                </div>

                {/* Sello Blockchain al Pie */}
                <div className="relative mt-10 rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-white border border-slate-200 rounded-lg">
                      <QrCode size={44} className="text-slate-900" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck size={14} /> Diploma Verificado en SUMO-Chain
                      </p>
                      <p className="text-[9px] font-mono text-slate-500 truncate max-w-[200px]">
                        TX: {programaSeleccionado.blockchain?.hashDiploma}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Bloque #{programaSeleccionado.blockchain?.bloque} · Sellado {programaSeleccionado.fechaConclusion}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(
                        programaSeleccionado.blockchain?.hashDiploma,
                        "Hash del diploma"
                      )
                    }
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:text-orange-600 shadow-sm"
                  >
                    <Copy size={11} /> Copiar Hash
                  </button>
                </div>
              </div>

              {/* Botón de Descarga Rápida */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleDescargarDiploma}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
                >
                  <Download size={16} /> Descargar Diploma Oficial en PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};