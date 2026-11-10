import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  CreditCard,
  Phone,
  Mail,
  BookOpen,
  Award,
  ShieldCheck,
  ShieldAlert,
  Filter,
  ArrowUpDown,
  Users,
  Landmark,
  Loader2,
  Edit3,
  Trash2,
  Check,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { docentesService } from "../../services/admin/docenteService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const GRADOS_ACADEMICOS = [
  "Licenciatura",
  "Diplomado",
  "Especialidad",
  "Magíster",
  "Doctorado (Ph.D.)",
];

const blankDocente = () => ({
  docente_id: null,
  nombre: "",
  apellido: "",
  ci: "",
  celular: "",
  email: "",
  especialidad: "",
  grado_academico: "Licenciatura",
  activo: true,
  cursos: [],
  materias: [],
});

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export const Docentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(blankDocente());
  const [isNew, setIsNew] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrado, setFilterGrado] = useState("TODOS");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [sortBy, setSortBy] = useState("nombre");

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

  const fetchData = async (keepSelectedId = null) => {
    setLoading(true);
    try {
      const data = await docentesService.getAll();
      setDocentes(data);

      if (data.length > 0) {
        const targetId = keepSelectedId || selectedId || data[0].docente_id;
        const targetDoc = data.find((d) => d.docente_id === targetId) || data[0];
        setSelectedId(targetDoc.docente_id);
        setFormData({ ...targetDoc });
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

  const filtered = useMemo(() => {
    let list = docentes.filter((d) => {
      const q = searchQuery.trim().toLowerCase();
      const fullName = `${d.nombre} ${d.apellido}`.toLowerCase();
      const matchQ =
        !q ||
        fullName.includes(q) ||
        d.ci.includes(q) ||
        (d.especialidad && d.especialidad.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q));
      
      const matchGrado = filterGrado === "TODOS" || d.grado_academico === filterGrado;
      const matchEstado = filterEstado === "TODOS" || (filterEstado === "activo" ? d.activo : !d.activo);

      return matchQ && matchGrado && matchEstado;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "ci") return a.ci.localeCompare(b.ci);
      if (sortBy === "cursos") return (b.cursos?.length || 0) - (a.cursos?.length || 0);
      return 0;
    });

    return list;
  }, [docentes, searchQuery, filterGrado, filterEstado, sortBy]);

  const stats = useMemo(() => {
    const total = docentes.length;
    const activos = docentes.filter((d) => d.activo).length;
    const conCursos = docentes.filter((d) => d.cursos && d.cursos.length > 0).length;
    const totalCursos = docentes.reduce((acc, d) => acc + (d.cursos?.length || 0), 0);
    return { total, activos, conCursos, totalCursos };
  }, [docentes]);

  const selectDocente = (d) => {
    setSelectedId(d.docente_id);
    setFormData({ ...d });
    setIsNew(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleActivo = () => {
    setFormData((f) => ({ ...f, activo: !f.activo }));
  };

  const handleNewClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormData(blankDocente());
    setSelectedId(null);
    setIsNew(true);
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

    if (saving) return;

    setSaving(true);
    try {
      let activeId = formData.docente_id;

      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        ci: formData.ci.trim(),
        celular: formData.celular ? formData.celular.trim() : null,
        email: formData.email ? formData.email.trim() : null,
        especialidad: formData.especialidad ? formData.especialidad.trim() : null,
        grado_academico: formData.grado_academico,
        activo: formData.activo,
      };

      if (isNew) {
        const res = await docentesService.create(payload);
        const nuevoDoc = res.docente || res;
        activeId = nuevoDoc.docente_id;

        setDocentes((prev) => [nuevoDoc, ...prev]);
        setSelectedId(activeId);
        setFormData(nuevoDoc);
        setIsNew(false);

        showFeedback("Registro Exitoso", "El docente ha sido registrado correctamente.", "success");
      } else {
        const res = await docentesService.update(formData.docente_id, payload);
        const actualizado = res.docente || { ...formData, ...payload };

        setDocentes((prev) =>
          prev.map((d) => (d.docente_id === formData.docente_id ? actualizado : d))
        );
        setFormData(actualizado);

        showFeedback("Actualización Exitosa", "La ficha del docente fue actualizada correctamente.", "success");
      }

      await fetchData(activeId);
    } catch (error) {
      showFeedback("Error al Procesar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetId = id || formData.docente_id;
    if (!targetId) return;

    setSaving(true);
    try {
      await docentesService.delete(targetId);
      const restantes = docentes.filter((d) => d.docente_id !== targetId);
      setDocentes(restantes);

      if (restantes.length > 0) {
        selectDocente(restantes[0]);
      } else {
        handleNewClick();
      }

      showFeedback("Docente Eliminado", "El registro fue revocado del sistema.", "success");
    } catch (error) {
      showFeedback("Error al Eliminar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setFilterGrado("TODOS");
    setFilterEstado("TODOS");
    setSearchQuery("");
    setSortBy("nombre");
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
      
      {/* Cabecera Principal */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-orange-200/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestión de Docentes
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-0.5">
              PLANTA DOCENTE · ESPECIALIDADES Y ASIGNACIONES ACADÉMICAS
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
              placeholder="Buscar por nombre, CI, especialidad..."
              className="ml-2 w-full bg-transparent text-sm outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          <button
            type="button"
            onClick={handleNewClick}
            className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
          >
            <Plus size={18} /> Nuevo Docente
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <StatCard
          icon={Users}
          label="Total Docentes"
          value={stats.total}
          accent="text-orange-600 bg-orange-100/80 border border-orange-200/50"
        />
        
        <StatCard
          icon={BookOpen}
          label="Con Cursos Asignados"
          value={stats.conCursos}
          accent="text-sky-600 bg-sky-100/80 border border-sky-200/50"
        />
        
      </div>

      {/* Barra de Filtros */}
      <div className="rounded-2xl border border-orange-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Filter size={14} /> Filtrar por:
            </span>

            <select
              value={filterGrado}
              onChange={(e) => setFilterGrado(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="TODOS">Todos los grados</option>
              {GRADOS_ACADEMICOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="nombre">Ordenar: Nombre</option>
                <option value="ci">Ordenar: C.I.</option>
                <option value="cursos">Ordenar: Más cursos</option>
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
              {filtered.length} {filtered.length === 1 ? "docente" : "docentes"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        
        {/* Columna Izquierda: Listado de Docentes */}
        <div className="flex flex-col rounded-2xl border border-orange-200/70 bg-white shadow-sm lg:col-span-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Lista de Docentes</h3>
           
          </div>

          <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-sm font-medium text-slate-400">
                Ningún docente coincide con los criterios de búsqueda.
              </p>
            ) : (
              filtered.map((d) => {
                const active = d.docente_id === selectedId;

                return (
                  <div
                    key={d.docente_id}
                    className={`group relative flex items-center justify-between gap-3 p-3.5 transition-all ${
                      active ? "bg-orange-50/90 border border-orange-200 shadow-sm" : "hover:bg-slate-50/80 border border-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectDocente(d)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-inner ${
                          active ? "bg-orange-500 text-white" : "bg-[#0B1120] text-orange-400"
                        }`}
                      >
                        {initials(`${d.nombre} ${d.apellido}`)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-slate-900 uppercase">
                            {d.nombre} {d.apellido}
                          </p>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${d.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {d.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                          {d.grado_academico} · {d.especialidad || "Sin especialidad"}
                        </p>
                      </div>
                    </button>

                    {/* Botones de acción directa por fila */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => selectDocente(d)}
                        title="Editar docente"
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100/60 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(d.docente_id, e)}
                        title="Eliminar docente"
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

        {/* Columna Derecha: Tarjeta Visual + Formulario */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          
          {/* Tarjeta Visual de Resumen */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-6 text-white shadow-xl">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-orange-500/10 pointer-events-none" />
            <div className="absolute -right-2 bottom-0 h-24 w-24 rounded-full bg-orange-500/10 pointer-events-none" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                  Ficha Profesional del Docente
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight leading-tight uppercase">
                  {formData.nombre || formData.apellido
                    ? `${formData.nombre} ${formData.apellido}`
                    : "Nuevo Docente"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  C.I. {formData.ci || "—"} · Especialidad: <span className="text-orange-300">{formData.especialidad || "General"}</span>
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-orange-400/60 bg-white/5 text-xl font-black text-orange-300 shadow-inner">
                {formData.nombre ? (
                  initials(`${formData.nombre} ${formData.apellido}`)
                ) : (
                  <Award size={26} />
                )}
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between border-t border-dashed border-white/15 pt-4">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${formData.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                <ShieldCheck size={14} /> {formData.activo ? "Activo" : "Inactivo"}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-black/30 px-3 py-1 rounded-lg">
                Grado: {formData.grado_academico || "Licenciatura"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ID #{formData.docente_id ?? "NUEVO"}
              </span>
            </div>
          </div>

          {/* Sección 1: Datos Personales */}
          <Section icon={User} title="Información Personal">
            <Field label="Nombres *">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Walter"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Apellidos *">
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ej. Quispe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Carnet de Identidad *" icon={CreditCard}>
              <input
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleInputChange}
                placeholder="6543210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Número Celular" icon={Phone}>
              <input
                type="text"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="79887766"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Correo Electrónico" icon={Mail} span2>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="walter.quispe@docente.bo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>
          </Section>

          {/* Sección 2: Perfil Académico */}
          <Section icon={Award} title="Perfil Académico y Estado">
            <Field label="Grado Académico">
              <select
                name="grado_academico"
                value={formData.grado_academico}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              >
                {GRADOS_ACADEMICOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Especialidad">
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                placeholder="Ej. Sistemas Embebidos"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Estado en la Institución (Clic para cambiar)" span2>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${formData.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="text-sm font-bold text-slate-800">
                    {formData.activo ? 'Docente Activo' : 'Docente Inactivo'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleActivo}
                  className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm transition-all"
                >
                  {formData.activo ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
                  Cambiar estado
                </button>
              </div>
            </Field>
          </Section>

          {/* Panel de Control y Guardado */}
          <div className="rounded-2xl border border-orange-200 bg-orange-100/60 p-5 shadow-inner">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
              <Settings size={16} /> Panel de Control de Docentes
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
                    {isNew ? "Registrar Nuevo Docente" : "Guardar Modificaciones"}
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
                  onClick={(e) => handleDelete(formData.docente_id, e)}
                  disabled={isNew || saving}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} /> Eliminar Registro
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