import React, { useState, useEffect } from "react";
import { 
  User, 
  CreditCard, 
  Phone, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  RefreshCw, 
  Eye, 
  EyeOff,
  UserCheck
} from "lucide-react";
import { studentService } from "../../services/admin/studentService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

export const ActualizarPerfilEstudiante = () => {
  const [formData, setFormData] = useState({
    usuario_id: null,
    nombre: "",
    apellido: "",
    ci: "",
    celular: "",
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const showFeedback = (title, message, type = "success") =>
    setModalState({ isOpen: true, title, message, type });

  const closeFeedback = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));

  // Cargar datos reales desde el endpoint /api/usuarios filtrando por CI o Username
  useEffect(() => {
    const cargarPerfilDesdeBD = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
        const authHeaders = {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };

        // Leer datos guardados en sesión para buscar en BD
        const savedUserStr = localStorage.getItem("user");
        let parsedUser = null;
        if (savedUserStr) {
          try {
            parsedUser = JSON.parse(savedUserStr);
          } catch {
            parsedUser = { username: savedUserStr };
          }
        }

        const sessionCi = parsedUser?.ci || parsedUser?.postulante?.ci;
        const sessionUsername = parsedUser?.username || localStorage.getItem("username");

        // Consultar /api/usuarios
        const response = await fetch(import.meta.env.VITE_API_URL + "/api/usuarios", { headers: authHeaders });
        if (!response.ok) throw new Error("Error al consultar la base de datos de usuarios.");
        
        const listaUsuarios = await response.json();

        // Buscar en la lista por carnet o username
        const usuarioEncontrado = Array.isArray(listaUsuarios)
          ? listaUsuarios.find(
              (u) =>
                (sessionCi && String(u.ci).trim() === String(sessionCi).trim()) ||
                (sessionUsername && String(u.username).toLowerCase().trim() === String(sessionUsername).toLowerCase().trim())
            )
          : null;

        if (usuarioEncontrado) {
          setFormData({
            usuario_id: usuarioEncontrado.usuario_id,
            nombre: usuarioEncontrado.nombre || "",
            apellido: usuarioEncontrado.apellido || "",
            ci: usuarioEncontrado.ci || "",
            celular: usuarioEncontrado.celular || "",
            username: usuarioEncontrado.username || "",
            password: "" // Se deja vacío por seguridad a menos que el usuario lo edite
          });
        } else if (parsedUser) {
          // Fallback en caso de no hallar coincidencia exacta en la lista
          setFormData({
            usuario_id: parsedUser.usuario_id || parsedUser.id,
            nombre: parsedUser.nombre || "",
            apellido: parsedUser.apellido || "",
            ci: parsedUser.ci || "",
            celular: parsedUser.celular || "",
            username: parsedUser.username || "",
            password: ""
          });
        }
      } catch (err) {
        showFeedback("Error de Carga", err.message || "No se pudieron obtener los datos del usuario desde la base de datos.", "error");
      } finally {
        setFetching(false);
      }
    };

    cargarPerfilDesdeBD();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.ci.trim() || !formData.username.trim()) {
      showFeedback("Campos Incompletos", "Por favor completa los campos obligatorios (Nombre, Apellido, C.I. y Username).", "error");
      return;
    }

    if (!formData.usuario_id) {
      showFeedback("Error de Identificación", "No se encontró el ID de usuario para actualizar.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        ci: formData.ci.trim(),
        celular: formData.celular ? formData.celular.trim() : null,
        username: formData.username.trim(),
        rol: "postulante"
      };

      // Si el estudiante ingresó una nueva contraseña, incluirla
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password.trim();
      }

      
      const res = await studentService.update(formData.usuario_id, payload);
      const usuarioActualizado = res.usuario || res.user || res;

      // Actualizar localStorage para sincronización instantánea
      if (usuarioActualizado) {
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const mergedUser = { ...localUser, ...usuarioActualizado, username: formData.username.trim() };
        localStorage.setItem("user", JSON.stringify(mergedUser));
        localStorage.setItem("username", formData.username.trim());
      }

      showFeedback(
        "Perfil Actualizado",
        "Tus datos personales, username y contraseña se han actualizado correctamente en la base de datos.",
        "success"
      );

      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      showFeedback("Error al Guardar", err.message || "No se pudieron guardar los cambios en el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-orange-50/30 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 sm:p-8 font-sans">
      <div className="rounded-3xl border border-orange-200/80 bg-white p-6 sm:p-10 shadow-sm">
        
        {/* ENCABEZADO */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] text-amber-400 shadow-md">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Actualizar Mis Datos
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              MODIFICA TU INFORMACIÓN PERSONAL Y CREDENCIALES DE ACCESO
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* NOMBRES Y APELLIDOS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nombres *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Juan"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ej. Perez"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* CI Y CELULAR */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Carnet de Identidad *
              </label>
              <div className="relative flex items-center">
                <CreditCard size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  name="ci"
                  required
                  value={formData.ci}
                  onChange={handleInputChange}
                  placeholder="Ej. 8765432"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Celular / WhatsApp
              </label>
              <div className="relative flex items-center">
                <Phone size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="Ej. 71234567"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* CREDENCIALES EDITABLES (USERNAME Y CONTRASEÑA) */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-amber-600" /> Credenciales de Acceso al Sistema
              </p>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                Editables
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre de Usuario *</label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="@usuario"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nueva Contraseña <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Escribe para cambiarla"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDADO */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#0B1120] hover:bg-slate-800 px-8 py-3 text-xs font-extrabold tracking-wide text-white shadow-md transition-all duration-200 active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <>
                  <UserCheck size={16} /> GUARDAR CAMBIOS
                </>
              )}
            </button>
          </div>

        </form>
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