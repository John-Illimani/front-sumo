import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Radio,
  Wifi,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  UserCheck,
  Building2,
  Clock,
  Calendar,
  Check,
  X,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Landmark,
  Sparkles,
  User,
  Banknote,
  Receipt,
  FileCheck2,
  QrCode,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Base de Datos de Alumnos en Ventanilla con RFID
// ---------------------------------------------------------------------------
const DB_ESTUDIANTES_VENTANILLA = [
  {
    rfidUid: "E2:80:68:94:0A:11",
    ci: "10072003",
    codigo: "EST-4758",
    nombres: "Gabriel Romario Quispe",
    celular: "68118346",
    facultad: "Fac. de Ingeniería",
    curso: "Preuniversitario de Ingeniería",
    horario: "08:00 - 11:00",
    aulaAsignada: "Aula 201 (Piso 2)",
    estadoMatricula: "habilitado",
    estadoPago: "Al día",
    montoPagado: "250.00",
    montoSaldo: "0.00",
    ultimoRecibo: "REC-2026-0891",
    fotoInitials: "GQ",
  },
  {
    rfidUid: "3A:4F:91:2C:B8:33",
    ci: "9834211",
    codigo: "EST-4759",
    nombres: "Valeria Fernanda Mamani",
    celular: "70112233",
    facultad: "Fac. de Medicina",
    curso: "Preuniversitario de Medicina Humana",
    horario: "07:30 - 12:30",
    aulaAsignada: "Auditorio Central de Medicina",
    estadoMatricula: "mora",
    estadoPago: "Cuota 2 Pendiente",
    montoPagado: "180.00",
    montoSaldo: "120.00",
    ultimoRecibo: "REC-2026-0892",
    fotoInitials: "VM",
  },
  {
    rfidUid: "7C:12:33:AA:99:FF",
    ci: "11209876",
    codigo: "EST-4761",
    nombres: "Daniela Sofía Apaza",
    celular: "69887766",
    facultad: "Normales Superiores (ESFM)",
    curso: "Admisión Normales Superiores",
    horario: "15:00 - 18:00",
    aulaAsignada: "Aula 104",
    estadoMatricula: "mora",
    estadoPago: "Cuota 2 Pendiente",
    montoPagado: "150.00",
    montoSaldo: "150.00",
    ultimoRecibo: "REC-2026-0760",
    fotoInitials: "DA",
  },
  {
    rfidUid: "88:B1:00:D4:55:12",
    ci: "8823456",
    codigo: "EST-4760",
    nombres: "Marcelo Andrés Choque",
    celular: "76554433",
    facultad: "Inst. Tec. Pedro Domingo Murillo",
    curso: "Nivelación Técnica Superior",
    horario: "14:30 - 17:30",
    aulaAsignada: "Taller Mecánico 2",
    estadoMatricula: "bloqueado",
    estadoPago: "Documentación Pendiente",
    montoPagado: "300.00",
    montoSaldo: "0.00",
    ultimoRecibo: "REC-2026-0845",
    fotoInitials: "MC",
  },
];

const money = (n) => `Bs. ${Number(n || 0).toFixed(2)}`;

export const VerificacionRfidSecretaria = () => {
  const [rfidInput, setRfidInput] = useState("");
  const [registroVerificado, setRegistroVerificado] = useState(null);
  const [montoAbono, setMontoAbono] = useState("");
  const [medioCobro, setMedioCobro] = useState("Efectivo en Ventanilla");
  const [historialVentanilla, setHistorialVentanilla] = useState([
    {
      id: 1,
      hora: "08:15:30",
      nombres: "Gabriel Romario Quispe",
      ci: "10072003",
      facultad: "Fac. de Ingeniería",
      estado: "Al día",
    },
    {
      id: 2,
      hora: "08:24:10",
      nombres: "Valeria Fernanda Mamani",
      ci: "9834211",
      facultad: "Fac. de Medicina",
      estado: "Mora (Bs. 120.00)",
    },
  ]);

  const [toast, setToast] = useState(null);
  const inputRfidRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (message, tone = "ok") => setToast({ message, tone });

  // Mantener foco para el sensor USB de ventanilla
  useEffect(() => {
    if (inputRfidRef.current) {
      inputRfidRef.current.focus();
    }
  }, [registroVerificado]);

  // Lectura del UID
  const procesarUid = (uidRaw) => {
    const query = (uidRaw || rfidInput).trim().toUpperCase();
    if (!query) {
      notify("Pasa la tarjeta por el lector o ingresa el C.I.", "error");
      return;
    }

    const match = DB_ESTUDIANTES_VENTANILLA.find(
      (e) =>
        e.rfidUid.toUpperCase() === query ||
        e.ci === query ||
        e.codigo.toUpperCase() === query
    );

    const hora = new Date().toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (match) {
      setRegistroVerificado(match);
      setMontoAbono(match.montoSaldo > 0 ? match.montoSaldo : "");

      const nuevoLog = {
        id: Date.now(),
        hora,
        nombres: match.nombres,
        ci: match.ci,
        facultad: match.facultad,
        estado: match.montoSaldo > 0 ? `Mora (${money(match.montoSaldo)})` : "Al día",
      };
      setHistorialVentanilla((prev) => [nuevoLog, ...prev]);
      notify(`Ficha cargada: ${match.nombres}`);
    } else {
      setRegistroVerificado({
        error: "Tarjeta RFID no vinculada a ningún estudiante",
        raw: query,
      });
      notify("UID o Carnet no registrado", "error");
    }

    setRfidInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      procesarUid();
    }
  };

  // Cobro directo desde la tarjeta
  const handleRegistrarCobroVentanilla = () => {
    const monto = Number(montoAbono);
    if (!monto || monto <= 0) {
      notify("Ingresa un monto válido para cobrar", "error");
      return;
    }

    const nuevoRecibo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nuevoSaldo = Math.max(0, Number(registroVerificado.montoSaldo) - monto).toFixed(2);
    const nuevoPagado = (Number(registroVerificado.montoPagado) + monto).toFixed(2);

    const actualizado = {
      ...registroVerificado,
      montoSaldo: nuevoSaldo,
      montoPagado: nuevoPagado,
      estadoPago: Number(nuevoSaldo) === 0 ? "Al día" : "Cuota Parcial",
      estadoMatricula: Number(nuevoSaldo) === 0 ? "habilitado" : "mora",
      ultimoRecibo: nuevoRecibo,
    };

    setRegistroVerificado(actualizado);
    setMontoAbono("");
    notify(`Cobro de ${money(monto)} registrado. Recibo emitido: ${nuevoRecibo}`);
  };

  const handleReset = () => {
    setRegistroVerificado(null);
    setRfidInput("");
    setMontoAbono("");
    if (inputRfidRef.current) inputRfidRef.current.focus();
  };

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-4 sm:gap-5 p-3 sm:p-6 font-sans border border-orange-200/70 rounded-2xl sm:rounded-3xl bg-orange-50/40">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all ${
            toast.tone === "error" ? "bg-red-600" : "bg-[#0B1120]"
          }`}
        >
          {toast.tone === "error" ? <X size={16} /> : <Check size={16} />}
          {toast.message}
        </div>
      )}

      {/* Cabecera de Secretaría */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <Radio size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Identificación Rápida por Tarjeta RFID
            </h2>
            <p className="text-[10px] sm:text-xs font-semibold text-orange-700/80 tracking-wide mt-0.5">
              VENTANILLA DE SECRETARÍA · CONSULTA DE KARDEX, VALIDACIÓN Y COBRO INSTANTÁNEO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm">
            <Wifi size={15} className="text-emerald-600 animate-pulse" /> Lector USB Activo (13.56 MHz)
          </span>
        </div>
      </div>

      {/* Grid Principal: Lector e Historial (Izq) + Ficha de Atención y Caja (Der) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Columna Izquierda: Sensor y Consultas Recientes */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Lector RFID */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Sensor de Ventanilla</span>
              <span className="text-orange-600 font-mono">LISTO</span>
            </h3>

            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
                <Radio size={28} className="animate-pulse" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-900">
                  Pasa la Credencial RFID del Estudiante
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Abre automáticamente el historial de pagos y materias
                </p>
              </div>

              {/* Input receptor */}
              <div className="w-full flex items-center gap-2 mt-1">
                <input
                  ref={inputRfidRef}
                  type="text"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="UID de Tarjeta o C.I."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-orange-400 text-center"
                />
                <button
                  onClick={() => procesarUid()}
                  className="shrink-0 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Demos de prueba en ventanilla */}
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tarjetas de Estudiantes en Espera:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DB_ESTUDIANTES_VENTANILLA.map((est) => (
                  <button
                    key={est.rfidUid}
                    onClick={() => procesarUid(est.rfidUid)}
                    className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50 text-left hover:border-orange-200 hover:bg-orange-50/60 transition-all text-xs"
                  >
                    <span className="font-bold text-slate-800 truncate w-full">
                      {est.nombres.split(" ")[0]} {est.nombres.split(" ")[1]}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 truncate w-full">
                      CI: {est.ci}
                    </span>
                    <span
                      className={`text-[8px] font-bold mt-1 rounded px-1.5 py-0.2 ${
                        Number(est.montoSaldo) === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {Number(est.montoSaldo) === 0 ? "AL DÍA" : `DEBE ${money(est.montoSaldo)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Historial de Atención en el Turno */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <History size={14} className="text-orange-500" /> Atendidos Recientemente por Tarjeta
            </h3>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {historialVentanilla.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-slate-800 truncate">{log.nombres}</p>
                    <p className="text-[10px] text-slate-400">
                      {log.hora} · CI: {log.ci}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      log.estado.includes("Al día")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {log.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ficha Operativa de Ventanilla + Cobro Rápido */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {!registroVerificado ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-3">
                <Radio size={32} />
              </div>
              <h4 className="text-base font-black text-slate-800">
                Pasa una tarjeta para abrir la ficha
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 font-medium">
                La secretaria podrá revisar la matrícula, horario de cursada, emitir recibos y regularizar pagos pendientes al instante.
              </p>
            </div>
          ) : registroVerificado.error ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-red-300 bg-red-50/80 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3 shadow-inner">
                <ShieldAlert size={36} />
              </div>
              <h4 className="text-xl font-black text-red-800">Tarjeta No Registrada</h4>
              <p className="mt-1 text-sm font-bold text-red-600">{registroVerificado.error}</p>
              <div className="mt-3 rounded-xl bg-white border border-red-200 p-2.5 font-mono text-xs text-slate-700">
                UID: {registroVerificado.raw}
              </div>
              <button
                onClick={handleReset}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95"
              >
                <RotateCcw size={14} /> Intentar de Nuevo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Tarjeta de Identificación del Estudiante */}
              <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-5 text-white shadow-lg">
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-orange-400 bg-white/10 text-xl font-black text-orange-300 shadow-md">
                      {registroVerificado.fotoInitials}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-400">
                        {registroVerificado.codigo} · CI: {registroVerificado.ci}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {registroVerificado.nombres}
                      </h3>
                      <p className="text-xs font-medium text-slate-300 mt-0.5">
                        {registroVerificado.facultad}
                      </p>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                        Number(registroVerificado.montoSaldo) === 0
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {Number(registroVerificado.montoSaldo) === 0 ? "MATRÍCULA AL DÍA" : "PAGO PENDIENTE"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-dashed border-white/15 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Teléfono:</span>
                    <span className="font-bold text-white">{registroVerificado.celular}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Último Recibo:</span>
                    <span className="font-mono font-bold text-orange-300">
                      {registroVerificado.ultimoRecibo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">UID RFID:</span>
                    <span className="font-mono text-slate-300">{registroVerificado.rfidUid}</span>
                  </div>
                </div>
              </div>

              {/* Información de Curso y Horario */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-3">
                  Datos Académicos en Ventanilla
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Programa Inscrito
                    </span>
                    <p className="font-black text-slate-800">{registroVerificado.curso}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Horario y Aula
                    </span>
                    <p className="font-black text-slate-800">
                      {registroVerificado.horario} · {registroVerificado.aulaAsignada}
                    </p>
                  </div>
                </div>
              </div>

              {/* Módulo de Cobranza y Caja Rápida por Tarjeta */}
              <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-orange-200/80 pb-2 mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                    <Banknote size={16} className="text-orange-600" /> Cobro Rápido en Ventanilla
                  </h4>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Saldo Deudor: </span>
                    <span className="font-black text-red-600 text-sm">
                      {money(registroVerificado.montoSaldo)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Monto a Cobrar (Bs.)
                    </label>
                    <input
                      type="number"
                      value={montoAbono}
                      onChange={(e) => setMontoAbono(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-orange-300 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Medio de Pago
                    </label>
                    <select
                      value={medioCobro}
                      onChange={(e) => setMedioCobro(e.target.value)}
                      className="w-full rounded-xl border border-orange-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="Efectivo en Ventanilla">Efectivo en Ventanilla</option>
                      <option value="Transferencia QR BCP">Transferencia QR BCP</option>
                      <option value="Depósito Bancario">Depósito Bancario</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleRegistrarCobroVentanilla}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
                    >
                      <Receipt size={14} /> Cobrar y Emitir Recibo
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón para Siguiente Atención */}
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1120] py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all"
              >
                <RotateCcw size={14} className="text-orange-400" />
                Finalizar y Esperar Siguiente Tarjeta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};