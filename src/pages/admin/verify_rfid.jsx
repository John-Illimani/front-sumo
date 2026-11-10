import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Radio,
  Wifi,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
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
  Layers,
  ChevronRight,
  User,
  Sliders,
  DollarSign,
  BookOpen,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Base de Estudiantes Vinculados con Tarjeta RFID (SUMO-Access)
// ---------------------------------------------------------------------------
const DB_ESTUDIANTES_RFID = [
  {
    rfidUid: "E2:80:68:94:0A:11",
    ci: "10072003",
    codigo: "EST-4758",
    nombres: "Gabriel Romario Quispe",
    facultad: "Fac. de Ingeniería",
    curso: "Preuniversitario de Ingeniería",
    aulaAsignada: "Aula 201 (Pabellón A)",
    estadoMatricula: "habilitado", // habilitado | bloqueado | mora
    estadoPago: "Al día",
    montoSaldo: 0.0,
    fotoInitials: "GQ",
    ultimaEntrada: "2026-08-17 07:54:10",
  },
  {
    rfidUid: "3A:4F:91:2C:B8:33",
    ci: "9834211",
    codigo: "EST-4759",
    nombres: "Valeria Fernanda Mamani",
    facultad: "Fac. de Medicina",
    curso: "Preuniversitario de Medicina Humana",
    aulaAsignada: "Auditorio Central de Medicina",
    estadoMatricula: "habilitado",
    estadoPago: "Al día",
    montoSaldo: 0.0,
    fotoInitials: "VM",
    ultimaEntrada: "2026-08-17 08:02:15",
  },
  {
    rfidUid: "7C:12:33:AA:99:FF",
    ci: "11209876",
    codigo: "EST-4761",
    nombres: "Daniela Sofía Apaza",
    facultad: "Normales Superiores (ESFM)",
    curso: "Admisión Normales Superiores",
    aulaAsignada: "Aula 104",
    estadoMatricula: "mora",
    estadoPago: "Cuota 2 Pendiente",
    montoSaldo: 150.0,
    fotoInitials: "DA",
    ultimaEntrada: "2026-08-10 14:15:00",
  },
  {
    rfidUid: "88:B1:00:D4:55:12",
    ci: "8823456",
    codigo: "EST-4760",
    nombres: "Marcelo Andrés Choque",
    facultad: "Inst. Tec. Pedro Domingo Murillo",
    curso: "Nivelación Técnica Superior",
    aulaAsignada: "Taller Mecánico 2",
    estadoMatricula: "bloqueado",
    estadoPago: "Observado Disciplina",
    montoSaldo: 0.0,
    fotoInitials: "MC",
    ultimaEntrada: "2026-08-05 16:30:22",
  },
];

const SEED_LOGS = [
  {
    id: 1,
    rfidUid: "E2:80:68:94:0A:11",
    nombres: "Gabriel Romario Quispe",
    facultad: "Fac. de Ingeniería",
    hora: "07:54:10",
    torniquete: "Torniquete Principal (Puerta A)",
    resultado: "PERMITIDO",
  },
  {
    id: 2,
    rfidUid: "3A:4F:91:2C:B8:33",
    nombres: "Valeria Fernanda Mamani",
    facultad: "Fac. de Medicina",
    hora: "08:02:15",
    torniquete: "Torniquete 2 (Biomédica)",
    resultado: "PERMITIDO",
  },
  {
    id: 3,
    rfidUid: "7C:12:33:AA:99:FF",
    nombres: "Daniela Sofía Apaza",
    facultad: "Normales Superiores (ESFM)",
    hora: "08:15:40",
    torniquete: "Torniquete Principal (Puerta A)",
    resultado: "OBSERVADO_MORA",
  },
];

export const VerificacionRfidAdmin = () => {
  const [rfidInput, setRfidInput] = useState("");
  const [isReaderListening, setIsReaderListening] = useState(true);
  const [registroVerificado, setRegistroVerificado] = useState(null);
  const [historialLogs, setHistorialLogs] = useState(SEED_LOGS);
  const [selectedPuerta, setSelectedPuerta] = useState("Torniquete Principal (Puerta A)");
  const [toast, setToast] = useState(null);

  const inputRfidRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (message, tone = "ok") => setToast({ message, tone });

  // Mantener foco en el input para lectores de tarjeta físicos (HID Keyboard Emulators)
  useEffect(() => {
    if (isReaderListening && inputRfidRef.current) {
      inputRfidRef.current.focus();
    }
  }, [isReaderListening, registroVerificado]);

  // Procesar lectura RFID
  const procesarUidRfid = (uidToVerify) => {
    const raw = (uidToVerify || rfidInput).trim().toUpperCase();
    if (!raw) {
      notify("Pasa una tarjeta RFID o ingresa el UID", "error");
      return;
    }

    const match = DB_ESTUDIANTES_RFID.find(
      (e) => e.rfidUid.toUpperCase() === raw || e.ci === raw || e.codigo.toUpperCase() === raw
    );

    const horaLectura = new Date().toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (match) {
      setRegistroVerificado(match);

      let resultadoLog = "PERMITIDO";
      if (match.estadoMatricula === "bloqueado") resultadoLog = "DENEGADO_BLOQUEADO";
      if (match.estadoMatricula === "mora") resultadoLog = "OBSERVADO_MORA";

      const nuevoLog = {
        id: Date.now(),
        rfidUid: match.rfidUid,
        nombres: match.nombres,
        facultad: match.facultad,
        hora: horaLectura,
        torniquete: selectedPuerta,
        resultado: resultadoLog,
      };

      setHistorialLogs((prev) => [nuevoLog, ...prev]);

      if (match.estadoMatricula === "habilitado") {
        notify(`Acceso Autorizado: ${match.nombres}`);
      } else if (match.estadoMatricula === "mora") {
        notify(`Acceso con Advertencia (Mora): ${match.nombres}`, "error");
      } else {
        notify(`Acceso Denegado (Bloqueo): ${match.nombres}`, "error");
      }
    } else {
      setRegistroVerificado({
        error: `Tarjeta RFID no registrada [UID: ${raw}]`,
        rawUid: raw,
      });

      const nuevoLog = {
        id: Date.now(),
        rfidUid: raw,
        nombres: "Tarjeta No Registrada",
        facultad: "Desconocida",
        hora: horaLectura,
        torniquete: selectedPuerta,
        resultado: "DENEGADO_DESCONOCIDO",
      };

      setHistorialLogs((prev) => [nuevoLog, ...prev]);
      notify(`UID ${raw} no reconocido en SUMO-Access`, "error");
    }

    setRfidInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      procesarUidRfid();
    }
  };

  const handleReset = () => {
    setRegistroVerificado(null);
    setRfidInput("");
    if (inputRfidRef.current) inputRfidRef.current.focus();
  };

  // Métricas del torniquete en tiempo real
  const stats = useMemo(() => {
    const total = historialLogs.length;
    const autorizados = historialLogs.filter((l) => l.resultado === "PERMITIDO").length;
    const observados = historialLogs.filter(
      (l) => l.resultado === "OBSERVADO_MORA" || l.resultado.includes("DENEGADO")
    ).length;

    return { total, autorizados, observados };
  }, [historialLogs]);

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

      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <Radio size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Control de Acceso RFID · Administrador
            </h2>
            <p className="text-[10px] sm:text-xs font-semibold text-orange-700/80 tracking-wide mt-0.5">
              LECTOR EN VIVO DE TARJETAS Y VERIFICACIÓN INSTANTÁNEA EN TORNIQUETES
            </p>
          </div>
        </div>

        {/* Selector de Puerta / Torniquete */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-orange-200 shadow-sm w-full sm:w-auto">
          <Wifi size={16} className="text-emerald-600 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Punto:</span>
          <select
            value={selectedPuerta}
            onChange={(e) => setSelectedPuerta(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
          >
            <option value="Torniquete Principal (Puerta A)">Torniquete Principal (Puerta A)</option>
            <option value="Torniquete 2 (Biomédica)">Torniquete 2 (Biomédica)</option>
            <option value="Acceso Laboratorios (Piso 2)">Acceso Laboratorios (Piso 2)</option>
            <option value="Puerta Biblioteca Central">Puerta Biblioteca Central</option>
          </select>
        </div>
      </div>

      {/* Métricas de Flujo en el Acceso */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold">
            <Radio size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Validaciones</p>
            <p className="text-xl font-black text-slate-900">{stats.total} pases</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-slate-400">Accesos Permitidos</p>
            <p className="text-xl font-black text-emerald-700">{stats.autorizados} habilitados</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold">
            <ShieldAlert size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-slate-400">Accesos Observados / Bloqueados</p>
            <p className="text-xl font-black text-red-600">{stats.observados} alertas</p>
          </div>
        </div>
      </div>

      {/* Grid Principal: Lector Activo (Izq) + Ficha de Validación (Der) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Columna Izquierda: Lector RFID e Historial */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Tarjeta del Lector RFID */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold text-slate-800">Sensor RFID Receptor</h3>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                En Línea 13.56 MHz
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
                <Radio size={34} className="animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  Acerca la Tarjeta / Credencial RFID al Lector
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  El hardware enviará automáticamente el UID para validación instantánea
                </p>
              </div>

              {/* Input receptor (Oculto o visible para pruebas) */}
              <div className="w-full flex items-center gap-2">
                <input
                  ref={inputRfidRef}
                  type="text"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="UID RFID (Ej. E2:80:68:94:0A:11)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-orange-400 text-center"
                />
                <button
                  onClick={() => procesarUidRfid()}
                  className="shrink-0 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95"
                >
                  Validar
                </button>
              </div>
            </div>

            {/* Simulador de tarjetas de prueba rápida */}
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tarjetas Demo para Pruebas en Vivo:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DB_ESTUDIANTES_RFID.map((est) => (
                  <button
                    key={est.rfidUid}
                    onClick={() => procesarUidRfid(est.rfidUid)}
                    className="flex flex-col items-start p-2 rounded-xl border border-slate-100 bg-slate-50 text-left hover:border-orange-200 hover:bg-orange-50/50 transition-all text-xs"
                  >
                    <span className="font-bold text-slate-800 truncate w-full">{est.nombres.split(" ")[0]} {est.nombres.split(" ")[1]}</span>
                    <span className="font-mono text-[9px] text-slate-400 truncate w-full">{est.rfidUid}</span>
                    <span
                      className={`text-[8px] font-bold mt-0.5 rounded px-1 ${
                        est.estadoMatricula === "habilitado"
                          ? "bg-emerald-100 text-emerald-700"
                          : est.estadoMatricula === "mora"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {est.estadoMatricula.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Historial de Lecturas Recientes */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <History size={14} className="text-orange-500" /> Registro de Lecturas en Turno
            </h3>

            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {historialLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-slate-800 truncate">{log.nombres}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {log.hora} · {log.rfidUid}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      log.resultado === "PERMITIDO"
                        ? "bg-emerald-100 text-emerald-700"
                        : log.resultado === "OBSERVADO_MORA"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {log.resultado === "PERMITIDO"
                      ? "Pase OK"
                      : log.resultado === "OBSERVADO_MORA"
                      ? "Con Mora"
                      : "Denegado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ficha en Pantalla Gigante del Estudiante (Visualización de Seguridad) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {!registroVerificado ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-3">
                <Radio size={32} />
              </div>
              <h4 className="text-base font-black text-slate-800">Esperando Lectura de Tarjeta</h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 font-medium">
                Pasa la credencial del estudiante por el lector físico de acceso para desplegar su estado de matrícula, aula asignada y solvencia.
              </p>
            </div>
          ) : registroVerificado.error ? (
            /* Error / Tarjeta No Reconocida */
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-red-300 bg-red-50/80 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3 shadow-inner">
                <ShieldAlert size={36} />
              </div>
              <h4 className="text-xl font-black text-red-800">Acceso No Autorizado</h4>
              <p className="mt-1 text-sm font-bold text-red-600">{registroVerificado.error}</p>
              <div className="mt-4 rounded-xl bg-white border border-red-200 p-3 font-mono text-xs text-slate-700">
                UID Detectado: {registroVerificado.rawUid}
              </div>
              <button
                onClick={handleReset}
                className="mt-5 flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95"
              >
                <RotateCcw size={14} /> Nueva Lectura
              </button>
            </div>
          ) : (
            /* Ficha de Estudiante Verificado */
            <div className="flex flex-col gap-4">
              {/* Tarjeta de Estado de Acceso */}
              <div
                className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl ${
                  registroVerificado.estadoMatricula === "habilitado"
                    ? "bg-[#0B1120]"
                    : registroVerificado.estadoMatricula === "mora"
                    ? "bg-amber-950"
                    : "bg-red-950"
                }`}
              >
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Foto / Iniciales */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-orange-400 bg-white/10 text-2xl font-black text-orange-300 shadow-md">
                      {registroVerificado.fotoInitials}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-400">
                        {registroVerificado.codigo} · CI: {registroVerificado.ci}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {registroVerificado.nombres}
                      </h3>
                      <p className="text-xs font-medium text-slate-300 mt-0.5">
                        {registroVerificado.facultad}
                      </p>
                    </div>
                  </div>

                  {/* Badge de Autorización */}
                  <div className="self-end sm:self-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-md ${
                        registroVerificado.estadoMatricula === "habilitado"
                          ? "bg-emerald-500 text-white"
                          : registroVerificado.estadoMatricula === "mora"
                          ? "bg-amber-500 text-slate-900"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {registroVerificado.estadoMatricula === "habilitado" ? (
                        <>
                          <CheckCircle2 size={16} /> ACCESO PERMITIDO
                        </>
                      ) : registroVerificado.estadoMatricula === "mora" ? (
                        <>
                          <AlertTriangle size={16} /> CUOTA PENDIENTE
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={16} /> BLOQUEADO
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-dashed border-white/15 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">UID RFID:</span>
                    <span className="font-mono font-bold text-orange-300">{registroVerificado.rfidUid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Estado Financiero:</span>
                    <span className="font-bold text-white">{registroVerificado.estadoPago}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Último Ingreso:</span>
                    <span className="text-slate-300 font-medium">{registroVerificado.ultimaEntrada}</span>
                  </div>
                </div>
              </div>

              {/* Información de Ubicación y Curso */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-3">
                  Detalles de la Cursada y Logística
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Curso / Programa
                    </span>
                    <p className="font-black text-slate-800 text-sm">{registroVerificado.curso}</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Aula / Pabellón Asignado
                    </span>
                    <p className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Building2 size={16} className="text-orange-500 shrink-0" />
                      {registroVerificado.aulaAsignada}
                    </p>
                  </div>
                </div>

                {registroVerificado.estadoMatricula === "mora" && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center justify-between">
                    <span>
                      Saldo pendiente de regularización: <strong>Bs. {registroVerificado.montoSaldo.toFixed(2)}</strong>
                    </span>
                    <span className="font-bold text-[10px] uppercase bg-amber-200/80 px-2 py-0.5 rounded">
                      Notificar a Secretaría
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de Nueva Lectura */}
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1120] py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all"
              >
                <RotateCcw size={15} className="text-orange-400" />
                Listo para Siguiente Tarjeta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};