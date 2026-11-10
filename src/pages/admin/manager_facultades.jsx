import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Landmark,
  Building2,
  Layers,
  CheckCircle2,
  PauseCircle,
  Filter,
  ArrowUpDown,
  Settings,
  Check,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { facultadesService } from "../../services/admin/facultadesService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const blankFacultad = () => ({
  facultad_id: null,
  nombre: "",
  codigo: "",
  estado: "activo",
  cursos: [],
});

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

export const Facultades = () => {
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(blankFacultad());
  const [isNew, setIsNew] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [sortBy, setSortBy] = useState("nombre");

  // Modal de notificación Feedback
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

  // Carga inicial sin recarga
  const fetchFacultades = async (keepSelectedId = null) => {
    setLoading(true);
    try {
      const data = await facultadesService.getAll();
      setFacultades(data);

      if (data.length > 0) {
        const targetId = keepSelectedId || selectedId || data[0].facultad_id;
        const targetFac = data.find((f) => f.facultad_id === targetId) || data[0];
        setSelectedId(targetFac.facultad_id);
        setFormData({
          facultad_id: targetFac.facultad_id,
          nombre: targetFac.nombre || "",
          codigo: targetFac.codigo || "",
          estado: targetFac.estado || "activo",
          cursos: targetFac.cursos || [],
        });
        setIsNew(false);
      } else {
        handleNewClick();
      }
    } catch (error) {
      showFeedback("Error de Conexión", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultades();
  }, []);

  // --- Filtros reactivos ---
  const filtered = useMemo(() => {
    let list = facultades.filter((f) => {
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        f.nombre.toLowerCase().includes(q) ||
        f.codigo.toLowerCase().includes(q);
      const matchEst = filterEstado === "TODOS" || f.estado === filterEstado;
      return matchQ && matchEst;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "codigo") return a.codigo.localeCompare(b.codigo);
      return 0;
    });

    return list;
  }, [facultades, searchQuery, filterEstado, sortBy]);

  // --- Estadísticas en tiempo real ---
  const stats = useMemo(() => {
    const totalFacultades = facultades.length;
    const totalCursos = facultades.reduce(
      (acc, f) => acc + Number(f.cursos?.length || 0),
      0
    );
    const activas = facultades.filter((f) => f.estado === "activo").length;

    return { totalFacultades, totalCursos, activas };
  }, [facultades]);

  // --- Manejadores de acciones ---
  const selectFacultad = (f) => {
    setSelectedId(f.facultad_id);
    setFormData({
      facultad_id: f.facultad_id,
      nombre: f.nombre || "",
      codigo: f.codigo || "",
      estado: f.estado || "activo",
      cursos: f.cursos || [],
    });
    setIsNew(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const toggleEstado = () => {
    setFormData((f) => ({
      ...f,
      estado: f.estado === "activo" ? "inactivo" : "activo",
    }));
  };

  const handleNewClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormData(blankFacultad());
    setSelectedId(null);
    setIsNew(true);
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formData.nombre.trim() || !formData.codigo.trim()) {
      showFeedback("Campos Incompletos", "El nombre y código de la facultad son obligatorios.", "error");
      return;
    }

    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        estado: formData.estado || "activo",
      };

      if (isNew) {
        const res = await facultadesService.create(payload);
        const nuevaFac = res.facultad || res;
        
        // Actualizar estado local sin recargar la página
        setFacultades((prev) => [nuevaFac, ...prev]);
        setSelectedId(nuevaFac.facultad_id);
        setFormData(nuevaFac);
        setIsNew(false);

        showFeedback("Facultad Registrada", "El área académica fue agregada exitosamente.", "success");
      } else {
        const res = await facultadesService.update(formData.facultad_id, payload);
        const actualizada = res.facultad || { ...formData, ...payload };

        // Actualizar estado local sin recargar la página
        setFacultades((prev) =>
          prev.map((f) => (f.facultad_id === formData.facultad_id ? actualizada : f))
        );
        setFormData(actualizada);

        showFeedback("Actualización Exitosa", "La facultad fue actualizada correctamente.", "success");
      }
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
    const targetId = id || formData.facultad_id;
    if (!targetId) return;

    setSaving(true);
    try {
      await facultadesService.delete(targetId);
      
      const restantes = facultades.filter((f) => f.facultad_id !== targetId);
      setFacultades(restantes);

      if (restantes.length > 0) {
        selectFacultad(restantes[0]);
      } else {
        handleNewClick();
      }

      showFeedback("Facultad Eliminada", "El registro fue revocado del sistema.", "success");
    } catch (error) {
      showFeedback("Error al Eliminar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
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
    <div className="relative flex w-full min-h-[85vh] flex-col gap-6 p-4 sm:p-8 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40 shadow-sm">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-orange-200/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] text-orange-400 shadow-md">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestión de Facultades y Áreas
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-0.5">
              DIVISIÓN ACADÉMICA · CATÁLOGO DE FACULTADES
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
              placeholder="Buscar facultad o código..."
              className="ml-2 w-full bg-transparent text-sm outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          <button
            type="button"
            onClick={handleNewClick}
            className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
          >
            <Plus size={18} /> Nueva Facultad
          </button>
        </div>
      </div>

     

      {/* Barra de Filtros */}
      <div className="rounded-2xl border border-orange-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Filter size={14} /> Filtrar por:
            </span>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="nombre">Ordenar: Nombre</option>
                <option value="codigo">Ordenar: Código</option>
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
              {filtered.length} {filtered.length === 1 ? "área" : "áreas"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        
        {/* Columna Izquierda: Listado con Acciones Directas */}
        <div className="flex flex-col rounded-2xl border border-orange-200/70 bg-white shadow-sm lg:col-span-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Listado de Facultades
            </h3>
          
          </div>

          <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-sm font-medium text-slate-400">
                Ninguna facultad coincide con el criterio de búsqueda.
              </p>
            ) : (
              filtered.map((f) => {
                const st = STATUS_META[f.estado] || STATUS_META["activo"];
                const active = f.facultad_id === selectedId;

                return (
                  <div
                    key={f.facultad_id}
                    className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all ${
                      active ? "bg-orange-50/90 border border-orange-200 shadow-sm" : "hover:bg-slate-50/80 border border-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectFacultad(f)}
                      className="flex items-center gap-3.5 text-left flex-1 min-w-0"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-xs text-orange-400 bg-[#0B1120] shadow-sm">
                        <Landmark size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 uppercase">
                          {f.nombre}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-500 mt-0.5">
                          Código: {f.codigo}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Layers size={11} className="text-orange-500" />
                            {f.cursos?.length || 0} cursos
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Botones de acción directa en fila */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => selectFacultad(f)}
                        title="Editar facultad"
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100/60 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(f.facultad_id, e)}
                        title="Eliminar facultad"
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

        {/* Columna Derecha: Formulario y Panel de Control */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          
          {/* Tarjeta Visual de Resumen */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-6 text-white shadow-xl">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-orange-500/10 pointer-events-none" />
            <div className="absolute -right-2 bottom-0 h-24 w-24 rounded-full bg-orange-500/10 pointer-events-none" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                  Unidad Académica Institucional
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight leading-tight uppercase">
                  {formData.nombre || "Nueva Facultad"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400 uppercase">
                  Código Oficial: <span className="font-mono text-orange-300">{formData.codigo || "—"}</span>
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-orange-400/60 text-2xl font-black text-orange-300 bg-white/5 shadow-inner">
                <Landmark size={26} />
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between border-t border-dashed border-white/15 pt-4">
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusMeta.badge}`}>
                <StatusIcon size={14} /> {statusMeta.label}
              </span>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Layers size={14} className="text-orange-400" />{" "}
                  {formData.cursos?.length || 0} Cursos Activos
                </span>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ID #{formData.facultad_id ?? "NUEVO"}
              </span>
            </div>
          </div>

          {/* Sección: Campos de la Tabla */}
          <Section icon={Building2} title="Información de la Facultad">
            <Field label="Nombre Oficial de la Facultad *" span2>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Facultad de Tecnología e Informática"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Código Oficial *" span2>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ej. FAC-TEC"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Estado Operativo (Clic para cambiar)" span2>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${formData.estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="text-sm font-bold text-slate-800 capitalize">
                    {formData.estado === 'activo' ? 'Facultad Activa' : 'Facultad Inactiva'}
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

          {/* Panel de Control y Guardado */}
          <div className="rounded-2xl border border-orange-200 bg-orange-100/60 p-5 shadow-inner">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
              <Settings size={16} /> Panel de Control Institucional
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
                    {isNew ? "Registrar Facultad en BD" : "Guardar Modificaciones"}
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
                  onClick={(e) => handleDelete(formData.facultad_id, e)}
                  disabled={isNew || saving}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} /> Eliminar Facultad
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
    <div className="flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.01]">
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
      <div className="grid grid-cols-1 gap-4">{children}</div>
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