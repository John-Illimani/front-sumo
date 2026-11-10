import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Building2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LayoutGrid,
  CalendarDays,
  Sparkles,
  Info
} from "lucide-react";

import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { cursosService } from "../../services/admin/cursosService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Validador universal de estado activo/inactivo[cite: 15]
const checkIsActivo = (estado) => {
  if (estado === true || estado === 1) return true;
  if (typeof estado === "string") {
    const lower = estado.toLowerCase().trim();
    return lower === "activo" || lower === "v" || lower === "t" || lower === "true" || lower === "1";
  }
  return false;
};

export const MisCursosYHorarios = () => {
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState("tarjetas"); // 'horario' | 'tarjetas'

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const showFeedback = (title, message, type = "info") =>
    setModalState({ isOpen: true, title, message, type });

  const closeFeedback = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));

  const fetchMisCursos = useCallback(async () => {
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

      const [inscripcionesRes, todosCursosRes, postulantesRes] = await Promise.all([
        inscripcionesService.getAll().catch(() => []),
        cursosService.getAll().catch(() => []),
        fetch(import.meta.env.VITE_API_URL + "/api/postulantes", { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      ]);

      let targetPostulanteId = parsedUser?.postulante_id || parsedUser?.usuario_id || parsedUser?.id;

      if (Array.isArray(postulantesRes) && postulantesRes.length > 0) {
        const matched = postulantesRes.find(
          (p) => Number(p.usuario_id) === Number(parsedUser?.usuario_id || parsedUser?.id)
        );
        if (matched) {
          targetPostulanteId = matched.postulante_id || targetPostulanteId;
        }
      }

      // Filtrar únicamente las inscripciones del estudiante[cite: 15]
      const misInscripciones = Array.isArray(inscripcionesRes)
        ? inscripcionesRes.filter(
            (ins) =>
              String(ins.postulante_id) === String(targetPostulanteId) ||
              String(ins.postulante?.usuario_id) === String(targetPostulanteId) ||
              String(ins.usuario_id) === String(targetPostulanteId)
          )
        : [];

      // Obtener todos los IDs de cursos asociados[cite: 15]
      const idsCursosTomados = new Set();
      misInscripciones.forEach((ins) => {
        if (ins.curso_id) idsCursosTomados.add(Number(ins.curso_id));
        if (Array.isArray(ins.cursos_totales)) {
          ins.cursos_totales.forEach((id) => idsCursosTomados.add(Number(id)));
        }
      });

      // Cruzar con la lista general de cursos[cite: 15]
      const detalleCursosInscritos = todosCursosRes.filter((c) =>
        idsCursosTomados.has(Number(c.curso_id))
      );

      setCursosInscritos(detalleCursosInscritos);
    } catch (error) {
      showFeedback("Error de Carga", error.message || "No se pudieron obtener tus cursos inscritos.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMisCursos();
  }, [fetchMisCursos]);

  // Organizar cursos por día de la semana analizando la cadena de texto de 'dias'[cite: 15]
  const horarioPorDia = useMemo(() => {
    const mapaDias = {
      Lunes: [],
      Martes: [],
      Miércoles: [],
      Jueves: [],
      Viernes: [],
      Sábado: []
    };

    cursosInscritos.forEach((curso) => {
      const diasTexto = (curso.dias || "").toLowerCase();

      DIAS_SEMANA.forEach((dia) => {
        const diaBase = dia.toLowerCase().replace("ércoles", "ercoles");
        if (
          diasTexto.includes(diaBase) ||
          diasTexto.includes(dia.toLowerCase()) ||
          (dia === "Miércoles" && (diasTexto.includes("miercoles") || diasTexto.includes("mie"))) ||
          (dia === "Lunes" && diasTexto.includes("lun")) ||
          (dia === "Martes" && diasTexto.includes("mar")) ||
          (dia === "Jueves" && diasTexto.includes("jue")) ||
          (dia === "Viernes" && diasTexto.includes("vie")) ||
          (dia === "Sábado" && diasTexto.includes("sab"))
        ) {
          mapaDias[dia].push(curso);
        }
      });
    });

    return mapaDias;
  }, [cursosInscritos]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-orange-50/40 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-[80vh] flex-col gap-6 p-4 sm:p-8 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/30 shadow-sm pb-20">
      
      {/* CABECERA Y CONTROLES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
            <CalendarDays size={26} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mis Cursos y Horario Académico
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-0.5">
              CONSULTA TUS PROGRAMAS INSCRITOS Y PLANIFICACIÓN SEMANAL
            </p>
          </div>
        </div>

        {/* SELECTOR DE VISTAS Y METRICAS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center shadow-sm">
           
            <button
              onClick={() => setVistaActual("tarjetas")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                vistaActual === "tarjetas"
                  ? "bg-[#0B1120] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <LayoutGrid size={16} /> Ver en Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-orange-200/80 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600 border border-orange-100">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cursos Registrados</p>
            <p className="text-lg font-black text-slate-800">{cursosInscritos.length} Cursos</p>
          </div>
        </div>

       

        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inversión Mensual Total</p>
            <p className="text-lg font-black text-slate-800">
              Bs. {cursosInscritos.reduce((acc, c) => acc + Number(c.precio_mensual || 450), 0)}
            </p>
          </div>
        </div>
      </div>

      {cursosInscritos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-orange-200 shadow-sm flex flex-col items-center justify-center">
          <Info size={40} className="text-orange-400 mb-3" />
          <h3 className="text-lg font-black text-slate-800">Aún no estás inscrito en ningún curso</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-md">
            Dirígete a la sección de Toma de Materias para seleccionar y registrar tus materias correspondientes a este periodo.
          </p>
        </div>
      ) : (
        <>
          {/* VISTA 1: GRILLA / HORARIO SEMANAL */}
          {vistaActual === "horario" && (
            <div className="rounded-3xl border border-orange-200/80 bg-white p-5 shadow-sm overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-6 gap-3 border-b border-slate-200 pb-3 mb-4 text-center">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia} className="bg-slate-100 py-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        {dia}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-6 gap-3 items-start min-h-[300px]">
                  {DIAS_SEMANA.map((dia) => {
                    const cursosDelDia = horarioPorDia[dia] || [];

                    return (
                      <div key={`col-${dia}`} className="space-y-3">
                        {cursosDelDia.length === 0 ? (
                          <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                            <span className="text-[10px] font-semibold text-slate-400">Sin Clases</span>
                          </div>
                        ) : (
                          cursosDelDia.map((curso) => {
                            const isActivo = checkIsActivo(curso.estado);

                            return (
                              <div
                                key={`dia-${dia}-${curso.curso_id}`}
                                className={`rounded-2xl border p-3 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                                  isActivo
                                    ? "bg-gradient-to-br from-orange-50/60 to-white border-orange-200"
                                    : "bg-slate-100 border-slate-300 opacity-70"
                                }`}
                              >
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-white font-mono text-[9px] font-black uppercase mb-1.5">
                                    {curso.codigo}
                                  </span>
                                  <h4 className="text-xs font-black text-slate-800 leading-snug mb-1">
                                    {curso.nombre}
                                  </h4>
                                  <p className="text-[10px] font-semibold text-slate-500 line-clamp-1">
                                    Docente: {curso.docente ? `${curso.docente.nombre} ${curso.docente.apellido}` : "A ser asignado"}
                                  </p>
                                </div>

                                <div className="mt-3 pt-2 border-t border-orange-100/80 space-y-1">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600">
                                    <Clock size={11} />
                                    <span>{curso.modalidad || "Presencial"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                                    <Building2 size={11} />
                                    <span className="truncate">{curso.facultad?.nombre || "Facultad"}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: TARJETAS DETALLADAS */}
          {vistaActual === "tarjetas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cursosInscritos.map((curso) => {
                const isActivo = checkIsActivo(curso.estado);

                return (
                  <div
                    key={curso.curso_id}
                    className={`rounded-3xl border p-5 bg-white shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                      isActivo ? "border-orange-200" : "border-slate-300 opacity-70 bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 ">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                          <Bookmark size={11} /> {curso.codigo}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                            isActivo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActivo ? "Inscrito / Activo" : "Inactivo"}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug mb-2  capitalize">
                        {curso.nombre}
                      </h3>

                      <p className="text-xs font-semibold text-slate-600 mb-4 flex items-center gap-1.5">
                        <User size={14} className="text-orange-500 shrink-0" />
                        <span>Docente: {curso.docente ? `${curso.docente.nombre} ${curso.docente.apellido}` : "A ser asignado"}</span>
                      </p>

                      <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-medium text-slate-700">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Calendar size={13} className="text-orange-500" /> Días de Clase:
                          </span>
                          <span className="font-bold text-slate-900">{curso.dias || "Sin asignar"}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Clock size={13} className="text-orange-500" /> Modalidad:
                          </span>
                          <span className="font-bold text-slate-900">{curso.modalidad || "Presencial"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Building2 size={13} className="text-orange-500" /> Facultad:
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[150px]">
                            {curso.facultad?.nombre || "Facultad General"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Costo Mensual</span>
                      <span className="text-sm font-black text-emerald-600">
                        Bs. {Number(curso.precio_mensual || 450)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <FeedbackModal
        isOpen={modalState.isOpen}
        onClose={closeFeedback}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};