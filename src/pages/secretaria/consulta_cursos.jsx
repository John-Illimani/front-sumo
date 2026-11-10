import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  BookOpen,
  GraduationCap,
  Users,
  DollarSign,
  CheckCircle2,
  PauseCircle,
  Filter,
  ArrowUpDown,
  Settings,
  ChevronRight,
  Layers,
  Loader2,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Building2,
} from "lucide-react";
import { cursosService } from "../../services/admin/cursosService";
import { facultadesService } from "../../services/admin/facultadesService";
import { docentesService } from "../../services/admin/docenteService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const MODALIDADES = [
  { code: "Presencial", label: "Presencial" },
  { code: "Virtual", label: "Virtual" },
  { code: "Semi-presencial", label: "Semi-presencial" },
];

const blankCourse = () => ({
  curso_id: null,
  nombre: "",
  codigo: "",
  facultad_id: "",
  docente_id: "",
  cupo_maximo: "40",
  precio_mensual: "250.00",
  modalidad: "Presencial",
  estado: "activo",
});

const money = (n) => `Bs. ${Number(n || 0)}`;

const STATUS_META = {
  activo: {
    label: "Activo",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  inactivo: {
    label: "Inactivo",
    icon: PauseCircle,
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
};

export const ConsultaCursosSecretaria = () => {
  const [cursos, setCursos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(blankCourse());
  const [isNew, setIsNew] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterFacultad, setFilterFacultad] = useState("TODAS");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [sortBy, setSortBy] = useState("nombre");
  const [showFilters, setShowFilters] = useState(true);

  // Modal de Feedback
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showFeedback = (title, message, type = "success") => {
    setModalState({ isOpen: true, title, message, type });
  };

  const closeFeedback = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Carga inicial de datos desde las 3 APIs
  const fetchData = async (keepSelectedId = null) => {
    setLoading(true);
    try {
      const [cursosData, facultadesData, docentesData] = await Promise.all([
        cursosService.getAll(),
        facultadesService.getAll(),
        docentesService.getAll(),
      ]);

      setCursos(cursosData);
      setFacultades(facultadesData);
      setDocentes(docentesData);

      if (cursosData.length > 0) {
        const targetId = keepSelectedId || selectedId || cursosData[0].curso_id;
        const targetCourse = cursosData.find((c) => c.curso_id === targetId) || cursosData[0];
        setSelectedId(targetCourse.curso_id);
        setFormData({
          ...targetCourse,
          facultad_id: targetCourse.facultad_id ? String(targetCourse.facultad_id) : "",
          docente_id: targetCourse.docente_id ? String(targetCourse.docente_id) : "",
        });
        setIsNew(false);
      } else {
        handleNewClick();
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

  // --- Filtros -------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = cursos.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      const facNombre = facultades.find((f) => f.facultad_id === c.facultad_id)?.nombre || "";
      const matchQ =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.codigo.toLowerCase().includes(q) ||
        facNombre.toLowerCase().includes(q);
      const matchFac =
        filterFacultad === "TODAS" || String(c.facultad_id) === filterFacultad;
      const matchEst = filterEstado === "TODOS" || c.estado === filterEstado;
      return matchQ && matchFac && matchEst;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "precio")
        return Number(b.precio_mensual) - Number(a.precio_mensual);
      return 0;
    });
    return list;
  }, [cursos, searchQuery, filterFacultad, filterEstado, sortBy, facultades]);

  // --- Estadísticas --------------------------------------------------------
  const stats = useMemo(() => {
    const totalCursos = cursos.length;
    const cuposTotales = cursos.reduce(
      (acc, c) => acc + Number(c.cupo_maximo || 0),
      0
    );
    const cursosActivos = cursos.filter((c) => c.estado === "activo").length;
    const recaudacionPotencial = cursos.reduce(
      (acc, c) => acc + Number(c.cupo_maximo || 0) * Number(c.precio_mensual || 0),
      0
    );

    return {
      totalCursos,
      cuposTotales,
      cursosActivos,
      recaudacionPotencial,
    };
  }, [cursos]);

  // --- Manejadores de acciones --------------------------------------------
  const selectCourse = (c) => {
    setSelectedId(c.curso_id);
    setFormData({
      ...c,
      facultad_id: c.facultad_id ? String(c.facultad_id) : "",
      docente_id: c.docente_id ? String(c.docente_id) : "",
    });
    setIsNew(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // Botón rápido para alternar estado activo/inactivo
  const toggleEstado = () => {
    setFormData((f) => ({
      ...f,
      estado: f.estado === "activo" ? "inactivo" : "activo",
    }));
  };

  const handleNewClick = () => {
    const blank = blankCourse();
    if (facultades.length > 0) blank.facultad_id = String(facultades[0].facultad_id);
    if (docentes.length > 0) blank.docente_id = String(docentes[0].docente_id);
    
    setFormData(blank);
    setSelectedId(null);
    setIsNew(true);
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formData.nombre.trim() || !formData.codigo.trim()) {
      showFeedback("Campos Incompletos", "El nombre y código del curso son obligatorios.", "error");
      return;
    }

    if (!formData.facultad_id || !formData.docente_id) {
      showFeedback("Asignación Requerida", "Debe seleccionar una facultad y un docente responsable.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        facultad_id: parseInt(formData.facultad_id),
        docente_id: parseInt(formData.docente_id),
        cupo_maximo: parseInt(formData.cupo_maximo || 40),
        precio_mensual: parseFloat(formData.precio_mensual || 0),
        modalidad: formData.modalidad,
        estado: formData.estado,
      };

      let activeId = formData.curso_id;

      if (isNew) {
        const res = await cursosService.create(payload);
        activeId = res.curso?.curso_id || res.curso_id;
        showFeedback("Curso Creado", "El programa académico fue publicado exitosamente.", "success");
      } else {
        await cursosService.update(formData.curso_id, payload);
        showFeedback("Actualización Exitosa", "Los datos del curso fueron actualizados correctamente.", "success");
      }

      await fetchData(activeId);
    } catch (error) {
      showFeedback("Error al Procesar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.curso_id) return;

    setSaving(true);
    try {
      await cursosService.delete(formData.curso_id);
      showFeedback("Curso Eliminado", "El programa fue retirado del catálogo.", "success");
      await fetchData();
    } catch (error) {
      showFeedback("Error al Eliminar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setFilterFacultad("TODAS");
    setFilterEstado("TODOS");
    setSearchQuery("");
    setSortBy("nombre");
  };

  const statusMeta = STATUS_META[formData.estado] || STATUS_META["activo"];
  const StatusIcon = statusMeta.icon;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-orange-50/40 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-5 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40 shadow-sm">
      
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Consulta de Cursos y Oferta Académica
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide">
              SECRETARÍA ACADÉMICA · CONSULTA DE PROGRAMAS Y REGISTRO
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-full items-center rounded-xl border border-white bg-white px-3 py-2.5 shadow-sm ring-1 ring-black/[0.02] focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 sm:w-64">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar curso, código o facultad…"
              className="ml-2 w-full bg-transparent text-sm outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          <button
            type="button"
            onClick={handleNewClick}
            className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
          >
            <Plus size={17} /> Nuevo Curso
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="rounded-2xl border border-orange-200/70 bg-white/70 p-3 backdrop-blur-sm">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex w-full items-center justify-between text-left lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Filter size={16} className="text-orange-500" /> Filtrar Cursos
          </span>
          <ChevronRight
            size={16}
            className={`text-slate-400 transition-transform ${
              showFilters ? "rotate-90" : ""
            }`}
          />
        </button>

        <div
          className={`${
            showFilters ? "flex" : "hidden"
          } lg:flex flex-wrap items-center gap-3 pt-3 lg:pt-0`}
        >
          <span className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 lg:flex">
            <Filter size={14} /> Filtrar
          </span>

          <select
            value={filterFacultad}
            onChange={(e) => setFilterFacultad(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 max-w-[220px] truncate"
          >
            <option value="TODAS">Todas las facultades</option>
            {facultades.map((f) => (
              <option key={f.facultad_id} value={String(f.facultad_id)}>
                {f.nombre}
              </option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <ArrowUpDown size={13} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="nombre">Ordenar: Nombre</option>
              <option value="precio">Ordenar: Mensualidad</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            Limpiar filtros
          </button>
          <span className="text-xs font-semibold text-slate-400">
            {filtered.length} curso{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Contenido principal: 2 Columnas */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        
        {/* Columna Izquierda: Lista de Cursos */}
        <div className="flex flex-col rounded-2xl border border-slate-200/60 bg-white shadow-sm lg:col-span-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700">
              Catálogo
            </h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-full">
              Habilitados
            </span>
          </div>

          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron cursos registrados.
              </p>
            ) : (
              filtered.map((c) => {
                const st = STATUS_META[c.estado] || STATUS_META["activo"];
                const active = c.curso_id === selectedId;
                const facObj = facultades.find((f) => f.facultad_id === c.facultad_id);
                const docObj = docentes.find((d) => d.docente_id === c.docente_id);

                return (
                  <button
                    type="button"
                    key={c.curso_id}
                    onClick={() => selectCourse(c)}
                    className={`flex w-full flex-col gap-2 p-4 text-left transition-colors ${
                      active ? "bg-orange-50/90 border-l-4 border-orange-500" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[#0B1120] px-1.5 py-0.5 text-[10px] font-black text-orange-400">
                            {c.codigo}
                          </span>
                          <p className="truncate text-sm font-bold text-slate-800 uppercase">
                            {c.nombre}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs font-medium text-slate-500">
                          {facObj ? facObj.nombre : "Sin Facultad"} · Tutor: {docObj ? `${docObj.nombre} ${docObj.apellido}` : "Por asignar"}
                        </p>
                      </div>

                      <span
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${st.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                        <Users size={12} className="text-orange-500" />
                        Cupo máx: {c.cupo_maximo}
                      </span>
                      <span className="font-bold text-emerald-600">
                        {money(c.precio_mensual)}/mes
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Visual + Formulario Detallado */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          
          {/* Tarjeta Visual de Curso / Programa */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-5 text-white shadow-lg">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/10" />
            <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-orange-500/10" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
                  {facultades.find((f) => String(f.facultad_id) === String(formData.facultad_id))?.nombre || "Facultad Académica"}
                </p>
                <p className="mt-1 text-xl font-black leading-tight uppercase">
                  {formData.nombre || "Nuevo Curso"}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Código: {formData.codigo || "—"} · Modalidad: {formData.modalidad}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-orange-400/60 bg-white/5 text-xl font-black text-orange-300">
                <BookOpen size={24} />
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between border-t border-dashed border-white/15 pt-3">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusMeta.badge}`}
              >
                <StatusIcon size={12} /> {statusMeta.label}
              </span>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="text-orange-400 font-bold">
                  {money(formData.precio_mensual)} / mes
                </span>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                ID #{formData.curso_id ?? "NUEVO"}
              </span>
            </div>
          </div>

          {/* Sección 1: Configuración del Programa */}
          <Section icon={BookOpen} title="Configuración del Programa">
            <Field label="Nombre del Curso / Módulo *" span2>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Diplomado en IoT y Blockchain"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Código Oficial *" icon={Layers}>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="CUR-IOT-01"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Modalidad de Clase">
              <select
                name="modalidad"
                value={formData.modalidad}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
                {MODALIDADES.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Facultad Destino *" icon={Building2} span2>
              <select
                name="facultad_id"
                value={formData.facultad_id}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
                <option value="">Seleccione una facultad</option>
                {facultades.map((f) => (
                  <option key={f.facultad_id} value={String(f.facultad_id)}>
                    {f.codigo} — {f.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Docente Titular *" icon={UserCheck} span2>
              <select
                name="docente_id"
                value={formData.docente_id}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
                <option value="">Seleccione un docente</option>
                {docentes.map((d) => (
                  <option key={d.docente_id} value={String(d.docente_id)}>
                    {d.nombre} {d.apellido} ({d.especialidad || d.grado_academico || 'Docente'})
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {/* Sección 2: Cupos y Costos */}
          <Section icon={Users} title="Cupos y Valores Financieros">
            <Field label="Cupo Máximo de Alumnos *" icon={Users}>
              <input
                type="number"
                name="cupo_maximo"
                value={formData.cupo_maximo}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Costo Mensual *" icon={DollarSign}>
              <input
                type="number"
                step="0.5"
                name="precio_mensual"
                value={Number(formData.precio_mensual)}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white font-black text-emerald-700"
              />
            </Field>

            <Field label="Estado Operativo (Clic para cambiar)" span2>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${formData.estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="text-sm font-bold text-slate-800 capitalize">
                    {formData.estado === 'activo' ? 'Curso Activo y Visible' : 'Curso Inactivo / Oculto'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleEstado}
                  className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm transition-all"
                >
                  {formData.estado === 'activo' ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
                  Cambiar estado
                </button>
              </div>
            </Field>
          </Section>

          {/* Panel de Control y Acciones */}
          <div className="rounded-2xl border border-orange-200 bg-orange-100/60 p-5 shadow-inner">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
              <Settings size={16} /> Panel de Control Académico
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
                    <CheckCircle2 size={18} />
                    {isNew ? "Registrar Curso en Base de Datos" : "Actualizar Curso Actual"}
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleNewClick}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-white py-2.5 text-xs font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50 active:scale-[0.98]"
                >
                  <Plus size={16} /> Limpiar / Nuevo
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isNew || saving}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} /> Eliminar Curso
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
    </div>
  );
};

// ---------------------------------------------------------------------------
// Subcomponentes reutilizables
// ---------------------------------------------------------------------------
function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-800">
        <Icon className="text-orange-500" size={20} /> {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, span2, children }) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {Icon && <Icon size={13} className="text-slate-400" />} {label}
      </label>
      {children}
    </div>
  );
}