import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Key,
  Phone,
  ArrowUpDown,
  Check,
  Lock,
  Loader2,
  Settings,
  User,
  Sparkles,
} from "lucide-react";
import { adminService } from "../../services/admin/adminService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const blankAdmin = () => ({
  usuario_id: null,
  nombre: "",
  apellido: "",
  ci: "",
  celular: "",
  username: "",
  password: "",
  rol: "administrador",
});

const initials = (nombre = "", apellido = "") =>
  `${nombre[0] || ""}${apellido[0] || ""}`.toUpperCase();

export const Administradores = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(blankAdmin());
  const [isNew, setIsNew] = useState(true);

  // Modal de notificación de feedback
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("nombre");

  const showFeedback = (title, message, type = "success") => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeFeedback = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Preview dinámico de credenciales automáticas solo durante la creación
  const previewUsername = useMemo(() => {
    if (!formData.nombre.trim() && !formData.apellido.trim()) return "@sin_asignar";
    const pNom = formData.nombre.trim().split(" ")[0].toLowerCase();
    const pApe = formData.apellido.trim().split(" ")[0].toLowerCase();
    return `@${pNom}_${pApe}`;
  }, [formData.nombre, formData.apellido]);

  const previewPassword = useMemo(() => {
    if (!formData.nombre.trim() && !formData.ci.trim()) return "nombreci*";
    const pNom = formData.nombre.trim().split(" ")[0].toLowerCase();
    const ciNum = formData.ci.trim().replace(/\D/g, "");
    return `${pNom}${ciNum}*`;
  }, [formData.nombre, formData.ci]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAll();
      setAdmins(data);
      if (data.length > 0) {
        setSelectedId(data[0].usuario_id);
        setFormData({ ...data[0], password: "" });
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
    fetchAdmins();
  }, []);

  const filtered = useMemo(() => {
    let list = admins.filter((a) => {
      const fullName = `${a.nombre} ${a.apellido}`.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      return (
        !q ||
        fullName.includes(q) ||
        a.ci.includes(q) ||
        a.username.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "ci") return a.ci.localeCompare(b.ci);
      return 0;
    });

    return list;
  }, [admins, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = admins.length;
    const conCelular = admins.filter((a) => a.celular && a.celular.trim() !== "").length;
    return { total, conCelular };
  }, [admins]);

  const selectAdmin = (a) => {
    setSelectedId(a.usuario_id);
    setFormData({ ...a, password: "" });
    setIsNew(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleNewClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormData(blankAdmin());
    setSelectedId(null);
    setIsNew(true);
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.ci.trim()) {
      showFeedback("Campos Incompletos", "Nombre, Apellido y Carnet de Identidad (CI) son obligatorios.", "error");
      return;
    }

    if (!isNew && !formData.username.trim()) {
      showFeedback("Username Requerido", "El nombre de usuario no puede quedar vacío.", "error");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const payload = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          ci: formData.ci,
          celular: formData.celular || null,
          rol: "administrador",
        };

        const res = await adminService.create(payload);
        const nuevoUsuario = res.usuario;
        const creds = res.credenciales_generadas;

        setAdmins((prev) => [nuevoUsuario, ...prev]);
        setSelectedId(nuevoUsuario.usuario_id);
        setFormData({ ...nuevoUsuario, password: "" });
        setIsNew(false);

        showFeedback(
          "Administrador Creado",
          `Usuario: ${creds.username} | Contraseña: ${creds.password_inicial}`,
          "success"
        );
      } else {
        const payload = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          ci: formData.ci,
          celular: formData.celular || null,
          username: formData.username,
        };

        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        const res = await adminService.update(formData.usuario_id, payload);
        const actualizado = res.usuario || { ...formData, ...payload };

        setAdmins((prev) =>
          prev.map((a) => (a.usuario_id === formData.usuario_id ? actualizado : a))
        );
        setFormData({ ...actualizado, password: "" });

        showFeedback(
          "Actualización Exitosa",
          `Los datos y usuario de ${payload.nombre} fueron actualizados correctamente.`,
          "success"
        );
      }
    } catch (error) {
      showFeedback("Error al Guardar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.usuario_id) return;

    setSaving(true);
    try {
      await adminService.delete(formData.usuario_id);
      const restantes = admins.filter((a) => a.usuario_id !== formData.usuario_id);
      setAdmins(restantes);

      if (restantes.length > 0) {
        selectAdmin(restantes[0]);
      } else {
        handleNewClick();
      }

      showFeedback(
        "Usuario Eliminado",
        "La cuenta de administrador ha sido revocada del sistema.",
        "error"
      );
    } catch (error) {
      showFeedback("Error al Eliminar", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-5 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestión de Administradores
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide">
              ACCESO PRIVILEGIADO · EDICIÓN Y GESTIÓN DE CREDENCIALES
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
              placeholder="Buscar por nombre, CI, usuario..."
              className="ml-2 w-full bg-transparent text-sm outline-none text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          <button
            type="button"
            onClick={handleNewClick}
            className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
          >
            <Plus size={17} /> Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          icon={Lock}
          label="Total Administradores"
          value={stats.total}
          accent="text-orange-600 bg-orange-100"
        />
        <StatCard
          icon={Phone}
          label="Con Contacto Telefónico"
          value={stats.conCelular}
          accent="text-emerald-600 bg-emerald-100"
        />
      </div>

      {/* Barra de Filtros */}
      <div className="rounded-2xl border border-orange-200/70 bg-white/70 p-3 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
          >
            <option value="nombre">Nombre</option>
            <option value="ci">Cédula de Identidad</option>
          </select>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Directorio Lateral */}
        <div className="flex flex-col rounded-2xl border border-slate-200/60 bg-white shadow-sm lg:col-span-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700">Lista de Administradores</h3>
            
          </div>

          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm font-medium text-slate-400">
                Ningún administrador coincide con los filtros establecidos.
              </p>
            ) : (
              filtered.map((a) => {
                const active = a.usuario_id === selectedId;
                return (
                  <button
                    type="button"
                    key={a.usuario_id}
                    onClick={() => selectAdmin(a)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                      active ? "bg-orange-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black  ${
                        active ? "bg-orange-500 text-white" : "bg-[#0B1120] text-orange-400"
                      }`}
                    >
                      {initials(a.nombre, a.apellido)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800 uppercase">
                        {a.nombre} {a.apellido}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        CI: {a.ci} · {a.username}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Tarjeta + Formulario */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-5 text-white shadow-lg">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-500/10" />
            <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-orange-500/10" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
                  CUENTA DE ADMINISTRACIÓN
                </p>
                <p className="mt-1 text-xl font-black leading-tight uppercase">
                  {formData.nombre || formData.apellido
                    ? `${formData.nombre} ${formData.apellido}`
                    : "Nuevo Administrador"}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  CI: {formData.ci || "—"} · Usuario: {isNew ? previewUsername : formData.username}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-orange-400/60 bg-white/5 text-lg font-black text-orange-300">
                {formData.nombre ? (
                  initials(formData.nombre, formData.apellido)
                ) : (
                  <ShieldAlert size={24} />
                )}
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between border-t border-dashed border-white/15 pt-3">
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700">
                <ShieldCheck size={12} /> Rol Administrador
              </span>

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                ID #{formData.usuario_id ?? "NUEVO"}
              </span>
            </div>
          </div>

          {/* Formulario de Datos */}
          <Section icon={Key} title="Identidad y Credenciales">
            <Field label="Nombres *">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Carlos"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Apellidos *">
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ej. Montaño"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Carnet de Identidad (CI) *">
              <input
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleInputChange}
                placeholder="4587123"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            <Field label="Teléfono Celular" icon={Phone}>
              <input
                type="text"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="71234567"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
              />
            </Field>

            {/* Campo Username y Password Condicionales */}
            {isNew ? (
              <div className="md:col-span-2 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-800 mb-1">
                  <Sparkles size={14} /> Credenciales Iniciales Autogeneradas
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono">
                  <span className="bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    Usuario: <strong>{previewUsername}</strong>
                  </span>
                  <span className="bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-200">
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
                    placeholder="@carlos_montano"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono font-bold text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
                  />
                </Field>

                <Field label="Cambiar Contraseña (Opcional)" icon={Lock}>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Dejar vacío para conservar actual"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white"
                  />
                </Field>
              </>
            )}
          </Section>

          {/* Panel de Botones */}
          <div className="rounded-2xl border border-orange-200 bg-orange-100/60 p-5 shadow-inner">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
              <Settings size={16} /> Panel de Control de Administrador
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
                    {isNew ? "Aprovisionar Administrador" : "Actualizar Privilegios"}
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
                  <Trash2 size={16} /> Revocar Acceso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Centrada con Portal */}
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
    <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm backdrop-blur-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate text-base font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

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