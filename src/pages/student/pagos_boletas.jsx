import React, { useState, useMemo, useEffect } from "react";
import {
  Receipt,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Lock,
  Landmark,
  FileText,
  CreditCard,
  Building2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Historial de Pagos y Boletas Selladas en Blockchain (Estudiante)
// ---------------------------------------------------------------------------
const ESTUDIANTE_DATA = {
  nombres: "Gabriel Romario Quispe",
  ci: "10072003",
  codigoEstudiante: "EST-4758",
  facultad: "Fac. de Ingeniería",
};

const HISTORIAL_PAGOS = [
  {
    id: "PAY-001",
    recibo: "REC-BCP-2026-8910",
    fecha: "2026-06-24 11:45",
    concepto: "Toma de Materias Semestre II (Cálculo I + Física Clásica)",
    monto: 300.0,
    saldoRestante: 0.0,
    medio: "Pago Móvil QR BCP",
    banco: "Banco de Crédito de Bolivia (BCP)",
    estado: "completado",
    bloque: 19842210,
    hashBlockchain: "0x3f8a92bc7e4d89a1120f5c889a7123ef61a298c47b5e89d136a88df92e41abcd",
    smartContract: "0x892aF0C3B5E0911762Cd44A1...92ef",
    materias: ["CAL-101: Cálculo I y Álgebra Lineal", "FIS-102: Física Clásica y Mecánica"],
  },
  {
    id: "PAY-002",
    recibo: "REC-2026-0710",
    fecha: "2026-05-24 09:30",
    concepto: "Matrícula General e Inscripción Institucional",
    monto: 250.0,
    saldoRestante: 0.0,
    medio: "Efectivo en Ventanilla",
    banco: "Caja Central SUMO",
    estado: "completado",
    bloque: 19820412,
    hashBlockchain: "0x77c48ef01a998bc43d8a760efd4329a6723812dc55a9bfe443a992e10a23bcde",
    smartContract: "0x892aF0C3B5E0911762Cd44A1...92ef",
    materias: ["Inscripción Institucional Período 2026"],
  },
  {
    id: "PAY-003",
    recibo: "REC-2026-0540",
    fecha: "2026-04-15 16:20",
    concepto: "Curso Preparatorio / Nivelación Técnica",
    monto: 150.0,
    saldoRestante: 0.0,
    medio: "Transferencia Bancaria",
    banco: "Banco Unión / QR",
    estado: "completado",
    bloque: 19789120,
    hashBlockchain: "0x11ab9823ef0082da98cfae443298a0021cba5432deff8812304918237498cbaa",
    smartContract: "0x892aF0C3B5E0911762Cd44A1...92ef",
    materias: ["Nivelación Matemática Previa"],
  },
];

const money = (n) => `Bs. ${Number(n || 0).toFixed(2)}`;

export const MisPagosYBoletas = () => {
  const [selectedPagoId, setSelectedPagoId] = useState(HISTORIAL_PAGOS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (message, tone = "ok") => setToast({ message, tone });

  // Filtrado de recibos
  const filteredPagos = useMemo(() => {
    return HISTORIAL_PAGOS.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      return (
        !q ||
        p.recibo.toLowerCase().includes(q) ||
        p.concepto.toLowerCase().includes(q) ||
        p.medio.toLowerCase().includes(q) ||
        p.hashBlockchain.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // Boleta seleccionada
  const pagoDetalle = useMemo(() => {
    return (
      HISTORIAL_PAGOS.find((p) => p.id === selectedPagoId) || HISTORIAL_PAGOS[0]
    );
  }, [selectedPagoId]);

  // Resumen financiero personal
  const stats = useMemo(() => {
    const totalAbonado = HISTORIAL_PAGOS.reduce((acc, p) => acc + p.monto, 0);
    const boletasSelladas = HISTORIAL_PAGOS.length;
    const saldoPendiente = HISTORIAL_PAGOS.reduce((acc, p) => acc + p.saldoRestante, 0);

    return { totalAbonado, boletasSelladas, saldoPendiente };
  }, []);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    notify(`${label} copiado al portapapeles`);
  };

  const handleDescargarBoleta = () => {
    notify(`Descargando comprobante ${pagoDetalle.recibo}.pdf`);
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
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mis Pagos y Boletas Digitales
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide">
              HISTORIAL FINANCIERO · COMPROBANTES CERTIFICADOS EN SUMO-CHAIN
            </p>
          </div>
        </div>

        {/* Buscador de comprobantes */}
        <div className="flex w-full items-center rounded-xl border border-white bg-white px-3 py-2.5 shadow-sm ring-1 ring-black/[0.02] focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 sm:w-72">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por recibo o concepto..."
            className="ml-2 w-full bg-transparent text-sm outline-none text-slate-700 font-medium placeholder:font-normal"
          />
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero del Estudiante */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Total Histórico Abonado"
          value={money(stats.totalAbonado)}
          accent="text-emerald-600 bg-emerald-100"
        />
        <StatCard
          icon={ShieldCheck}
          label="Boletas Selladas en Blockchain"
          value={`${stats.boletasSelladas} certificadas`}
          accent="text-orange-600 bg-orange-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Saldo Pendiente Actual"
          value={money(stats.saldoPendiente)}
          accent="text-sky-600 bg-sky-100"
        />
      </div>

      {/* Grid Principal: Lista de Pagos (Izq) + Vista Previa de Boleta Sellada (Der) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Columna Izquierda: Historial de Comprobantes */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-700">
              Historial de Transacciones ({filteredPagos.length})
            </h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              PAGOS CONFIRMADOS
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredPagos.length === 0 && (
              <p className="p-6 text-center text-xs font-medium text-slate-400 bg-white rounded-2xl border border-slate-200">
                No se encontraron pagos con esos parámetros.
              </p>
            )}

            {filteredPagos.map((p) => {
              const active = p.id === selectedPagoId;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPagoId(p.id)}
                  className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                    active
                      ? "border-orange-400 bg-orange-50/80 shadow-sm"
                      : "border-slate-200/80 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#0B1120] px-1.5 py-0.5 text-[10px] font-mono font-bold text-orange-400">
                          {p.recibo}
                        </span>
                        <p className="truncate text-xs font-black text-slate-800">
                          {p.concepto}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">
                        {p.medio} · {p.fecha}
                      </p>
                    </div>

                    <span className="shrink-0 font-black text-emerald-700 text-sm">
                      {money(p.monto)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck size={12} /> Bloque #{p.bloque}
                    </span>
                    <span className="truncate max-w-[160px] text-slate-400">
                      {p.hashBlockchain}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Boleta Digital Oficial para Impresión / Descarga */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 shadow-md">
            {/* Encabezado de la Boleta */}
            <div className="flex items-start justify-between border-b-2 border-[#0B1120] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 font-black text-xl shadow-md">
                  <Landmark size={26} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                    INSTITUTO SUMO · BOLETA DE PAGO
                  </h1>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-600 mt-1">
                    CERTIFICACIÓN INMUTABLE BLOCKCHAIN
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-xs font-black text-slate-800">
                  {pagoDetalle.recibo}
                </p>
                <p className="text-[10px] text-slate-400">
                  {pagoDetalle.fecha}
                </p>
                <span className="inline-block mt-1 rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                  PAGO CONCILIADO
                </span>
              </div>
            </div>

            {/* Datos del Estudiante */}
            <div className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Estudiante:</span>
                <span className="text-sm font-black text-slate-900">
                  {ESTUDIANTE_DATA.nombres}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Cédula de Identidad:</span>
                <span className="font-mono font-black text-slate-800">
                  {ESTUDIANTE_DATA.ci}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Código Alumno:</span>
                <span className="font-mono font-bold text-orange-600">
                  {ESTUDIANTE_DATA.codigoEstudiante}
                </span>
              </div>
            </div>

            {/* Concepto y Materias Amparadas */}
            <div className="space-y-3 text-xs mb-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Concepto de Pago
                </span>
                <p className="font-bold text-slate-800">{pagoDetalle.concepto}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Procesado a través de: <strong>{pagoDetalle.medio}</strong> ({pagoDetalle.banco})
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Detalle de Módulos Cubiertos
                </span>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                  {pagoDetalle.materias.map((mat, i) => (
                    <li key={i} className="p-2.5 flex items-center justify-between text-slate-700 font-medium">
                      <span>{mat}</span>
                      <span className="text-emerald-700 font-bold text-[11px]">Habilitado</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Totalizador */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white p-3.5">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Monto Total Sellado:
                </span>
                <span className="text-xl font-black text-orange-400">
                  {money(pagoDetalle.monto)}
                </span>
              </div>
            </div>

            {/* Bloque Criptográfico y Código QR de Validación */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <QrCode size={100} className="text-orange-400" />
                </div>
                <span className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-700">
                  QR de Auditoría SUMO
                </span>
                <span className="text-[8px] text-slate-400 font-mono">
                  Escaneable en Ventanilla
                </span>
              </div>

              <div className="md:col-span-8 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <ShieldCheck size={16} /> Registro Inmutable en Bloque
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Hash de Transacción (Keccak-256):
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-slate-700 break-all bg-white px-2 py-1 rounded border border-slate-200 flex-1">
                      {pagoDetalle.hashBlockchain}
                    </span>
                    <button
                      onClick={() => copyToClipboard(pagoDetalle.hashBlockchain, "Hash")}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-orange-600 shadow-sm"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-1">
                  <div>
                    <span className="font-bold">Bloque:</span> #{pagoDetalle.bloque}
                  </div>
                  <div>
                    <span className="font-bold">Smart Contract:</span> SUMO-PoA
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-xl border border-orange-300 bg-white py-3 text-xs font-bold text-orange-700 shadow-sm hover:bg-orange-50 active:scale-95 transition-all"
              >
                <Printer size={16} /> Imprimir Comprobante
              </button>

              <button
                onClick={handleDescargarBoleta}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
              >
                <Download size={16} /> Descargar Boleta PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm backdrop-blur-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-base font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}