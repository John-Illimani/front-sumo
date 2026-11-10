import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  User, 
  CreditCard, 
  Phone, 
  Lock, 
  UserCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Cloud,
  ShieldCheck,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { studentService } from "../../services/admin/studentService";
import { useNavigate } from "react-router-dom";

export const RegistroPostulanteInicio = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    celular: "",
    username: "",
    password: ""
    // uuid eliminado para que se envíe vacío o nulo por defecto
  });
  
  const navigate = useNavigate();
  
  function handleVolverLogin() {
    navigate("/");
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "nombre" || name === "apellido") {
        const pNom = (updated.nombre.trim().split(" ")[0] || "").toLowerCase();
        const pApe = (updated.apellido.trim().split(" ")[0] || "").toLowerCase();
        if (pNom || pApe) {
          updated.username = `@${pNom}_${pApe}`;
        }
      }

      if (name === "nombre" || name === "ci") {
        const pNom = (updated.nombre.trim().split(" ")[0] || "").toLowerCase();
        const ciClean = updated.ci.trim().replace(/\D/g, "");
        if (pNom && ciClean) {
          updated.password = `${pNom}${ciClean}*`;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.ci.trim()) {
      setError("Por favor completa los campos obligatorios (Nombre, Apellido y C.I.)");
      return;
    }

    setLoading(true);
    try {
      // Se envía el objeto sin generar UUID aleatorio (llega vacío / null al backend)
      const res = await studentService.create({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        ci: formData.ci.trim(),
        celular: formData.celular ? formData.celular.trim() : null,
        username: formData.username.trim(),
        password: formData.password.trim(),
        uuid: null // <-- Se manda vacío o nulo para registrarse después
      });

      const usuarioCreado = res.usuario || res.user || res;
      const token = res.access_token || res.token;

      if (usuarioCreado) {
        localStorage.setItem("user", JSON.stringify(usuarioCreado));
        localStorage.setItem("username", usuarioCreado.username || formData.username);
      }
      if (token) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);
      }

      setIsSuccessModalOpen(true);
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar tu cuenta de postulante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[url('/quienesSomos.webp')] bg-cover bg-center bg-no-repeat p-3 sm:p-6 font-sans relative overflow-x-hidden transition-all duration-500 ease-in-out">
      
      <div className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-[3px] transition-opacity duration-500" />

      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-2xl md:flex-row md:min-h-[620px] z-15 my-auto transition-all duration-500 ease-out transform scale-100 opacity-100">
        
        {/* --- PANEL IZQUIERDO --- */}
        <div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#0B1120] p-6 sm:p-10 text-white md:w-[42%] lg:p-12">
          
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 bottom-10 h-60 w-60 rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent blur-2xl pointer-events-none" />

          <Cloud className="absolute left-8 top-16 h-20 w-20 text-white/5 blur-[2px]" />

          <div className="relative z-10">
            <button
              type="button"
              onClick={handleVolverLogin}
              className="inline-flex items-center gap-2 mb-6 sm:mb-8 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all duration-300 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl w-fit border border-white/10 cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft size={16} /> Volver al Inicio / Login
            </button>

            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-inner border border-white/10">
              <img src="/logo_sumo.png" alt="sumo" className="rounded-xl object-contain" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-1">
              CREA TU CUENTA
            </h1>
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-amber-400 uppercase mb-3">
              CONSULTORA DE EXCELENCIA ACADÉMICA SUMO
            </h2>
            <p className="text-xs leading-relaxed text-slate-300 max-w-sm">
              Regístrate para postularte a nuestros programas especializados y cursos de preparación con acceso inmediato a la plataforma.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 hidden md:block space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="rounded-full bg-white/10 p-1.5 text-amber-400">
                <GraduationCap size={15} />
              </div>
              <span>Preparación para ingreso a ESFM</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="rounded-full bg-white/10 p-1.5 text-amber-400">
                <BookOpen size={15} />
              </div>
              <span>Taller de Tesis y Proyectos de Grado</span>
            </div>
          </div>
        </div>

        {/* --- PANEL DERECHO --- */}
        <div className="flex w-full flex-col justify-center bg-white p-5 sm:p-8 md:w-[58%] lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-md">
            
            <div className="mb-5 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Registro de Postulante
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa tus datos. El usuario y la contraseña se autogeneran de forma segura.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 transition-all duration-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    required
                    value={formData.apellido}
                    onChange={handleInputChange}
                    placeholder="Ej. Perez"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Carnet de Identidad *
                  </label>
                  <div className="relative flex items-center">
                    <CreditCard size={15} className="absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      name="ci"
                      required
                      value={formData.ci}
                      onChange={handleInputChange}
                      placeholder="Ej. 8765432"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Celular / WhatsApp
                  </label>
                  <div className="relative flex items-center">
                    <Phone size={15} className="absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      name="celular"
                      value={formData.celular}
                      onChange={handleInputChange}
                      placeholder="Ej. 71234567"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Credenciales de Acceso Autogeneradas */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3 space-y-2 mt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-600" /> Credenciales Vinculadas Automáticamente
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Usuario</label>
                    <div className="relative flex items-center">
                      <User size={13} className="absolute left-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="username"
                        readOnly
                        value={formData.username}
                        placeholder="Se genera solo"
                        className="w-full rounded-lg border border-slate-200 bg-white/80 py-2 pl-8 pr-2 text-xs font-mono font-bold text-slate-700 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Contraseña</label>
                    <div className="relative flex items-center">
                      <Lock size={13} className="absolute left-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="password"
                        readOnly
                        value={formData.password}
                        placeholder="Se genera solo"
                        className="w-full rounded-lg border border-slate-200 bg-white/80 py-2 pl-8 pr-2 text-xs font-mono font-semibold text-slate-700 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1120] py-3.5 text-xs font-extrabold tracking-wide text-white transition-all duration-300 hover:bg-[#0F172A] hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <>
                    <UserCheck size={18} /> COMPLETAR REGISTRO
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs font-medium text-slate-600">
              ¿Ya tienes una cuenta registrada?{' '}
              <button 
                type="button"
                onClick={handleVolverLogin}
                className="font-bold text-amber-600 hover:text-amber-700 hover:underline focus:outline-none cursor-pointer transition-colors duration-200"
              >
                Inicia Sesión aquí
              </button>
            </p>

          </div>
        </div>
        
      </div>

      {/* --- MODAL FLOTANTE DE ÉXITO --- */}
      {isSuccessModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500 ease-out animate-in fade-in">
          <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl text-center transition-all duration-300 ease-out transform scale-100 animate-in zoom-in-95">
            
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner transition-transform duration-500 hover:scale-105">
              <CheckCircle2 size={34} strokeWidth={2.2} />
            </div>

            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-200 mb-2">
              Registro Exitoso
            </span>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              ¡Cuenta creada correctamente!
            </h3>
            
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
              Tus credenciales y tu cuenta han sido registradas con éxito. Ya puedes dirigirte al login principal para ingresar al sistema.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleVolverLogin}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-700/20 hover:from-emerald-500 hover:to-teal-600 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                IR AL LOGIN AHORA
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};