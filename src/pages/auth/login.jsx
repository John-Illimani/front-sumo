import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from "react-dom";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  BookOpen, 
  GraduationCap, 
  Award,
  Cloud,
  AlertCircle,
  Loader2,
  CreditCard,
  Phone,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

import { authService } from '../../services/authService';
import { studentService } from '../../services/admin/studentService';

export const SumoLandingLogin = () => {
  const navigate = useNavigate();

  // Estados de vista
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Estados de Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estados de Registro
  const [regData, setRegData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    celular: "",
    username: "",
    password: ""
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setLoginError('');
    setRegError('');
  };

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await authService.login(loginUsername, loginPassword);
      if (response.usuario) {
        localStorage.setItem("user", JSON.stringify(response.usuario));
      }
      const rol = response.usuario.rol;

      if (rol === 'administrador') {
        navigate('/admin');
      } else if (rol === 'secretaria') {
        navigate('/secretaria');
      } else if (rol === 'postulante') {
        navigate('/estudiante');
      } else {
        navigate('/');
      }
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  
  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData((prev) => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regData.nombre.trim() || !regData.apellido.trim() || !regData.ci.trim()) {
      setRegError("Por favor completa los campos obligatorios (Nombre, Apellido y C.I.)");
      return;
    }

    setRegLoading(true);
    try {
      await studentService.create({
        nombre: regData.nombre.trim(),
        apellido: regData.apellido.trim(),
        ci: regData.ci.trim(),
        celular: regData.celular ? regData.celular.trim() : null,
        username: regData.username.trim(),
        password: regData.password.trim(),
        uuid: null // Se manda nulo para generar credencial después
      });

      // Rellenamos el login con las nuevas credenciales para facilitarle el ingreso
      setLoginUsername(regData.username);
      setLoginPassword(regData.password);
      
      setIsSuccessModalOpen(true);
    } catch (err) {
      setRegError(err.message || "Ocurrió un error al registrar tu cuenta de postulante.");
    } finally {
      setRegLoading(false);
    }
  };

  const closeSuccessAndLogin = () => {
    setIsSuccessModalOpen(false);
    setIsRegistering(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] p-4 font-sans">
      
      {/* --- FONDO ANIMADO MODERNO*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[50%] rounded-full bg-blue-900/40 blur-[120px] animate-[spin_40s_linear_infinite]" />
        <div className="absolute top-[20%] -right-[10%] h-[70%] w-[40%] rounded-full bg-amber-600/20 blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] rounded-full bg-emerald-900/30 blur-[100px] animate-[spin_30s_linear_infinite_reverse]" />
      </div>
      
      {/* Contenedor Principal */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl md:flex-row md:min-h-[650px] transform transition-all duration-500">
        
        {/* --- PANEL IZQUIERDO (Información y Branding) --- */}
        <div className="relative flex w-full flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#0B1120] p-10 text-white md:w-[45%] lg:p-14 transition-all">
          
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-20 blur-2xl pointer-events-none"></div>
          <div className="absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-gradient-to-tr from-[#1e293b] to-[#0B1120] border border-white/5 shadow-2xl pointer-events-none"></div>
          
          <Cloud className="absolute left-10 top-24 h-24 w-24 text-white/5 blur-[2px]" />
          <Cloud className="absolute right-12 top-40 h-32 w-32 text-amber-100/5 blur-[3px]" />

          <div className="relative z-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg">
              <img src="/logo_sumo.png" alt="sumo" className="rounded-2xl" />
            </div>
            
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
              SUMO
            </h1>
            <h2 className="mb-6 text-sm font-bold tracking-widest text-amber-400 uppercase">
              Consultora de Excelencia Académica
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-slate-300">
              Sucursal La Paz. Formando líderes y profesionales con los más altos estándares educativos. Impulsa tu futuro con nuestros programas especializados.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 text-amber-400 backdrop-blur-sm">
                  <GraduationCap size={20} />
                </div>
                <span className="text-sm font-medium text-slate-200">Preparación para ingreso a ESFM</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 text-amber-400 backdrop-blur-sm">
                  <BookOpen size={20} />
                </div>
                <span className="text-sm font-medium text-slate-200">Taller de Tesis y Proyectos de Grado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 text-amber-400 backdrop-blur-sm">
                  <Award size={20} />
                </div>
                <span className="text-sm font-medium text-slate-200">Cursos de Actualización Docente</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- PANEL DERECHO (Formularios Dinámicos) --- */}
        <div className="flex w-full flex-col justify-center bg-white p-8 md:w-[55%] lg:px-16 lg:py-12 transition-all duration-300 relative">
          
          {/* Botón superior derecho para cambiar de modo */}
          <div className="absolute top-6 right-6 lg:top-8 lg:right-10">
            <button 
              onClick={toggleMode}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors bg-slate-50 hover:bg-amber-50 px-4 py-2 rounded-full border border-slate-200 hover:border-amber-200 cursor-pointer"
            >
              {isRegistering ? 'Volver al Login' : 'Crear una cuenta'} <ArrowRight size={14} />
            </button>
          </div>

          <div className="mx-auto w-full max-w-sm mt-8 sm:mt-4">
            
            <h3 className="mb-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isRegistering ? 'Nuevo Postulante' : 'Iniciar Sesión'}
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              {isRegistering 
                ? 'Ingresa tus datos para generar tus credenciales.' 
                : 'Ingresa tus credenciales para acceder al sistema.'}
            </p>

            {/* --- FORMULARIO DE LOGIN --- */}
            {!isRegistering && (
              <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500" onSubmit={handleLogin}>
                
                {loginError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 border border-slate-200 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
                  <User size={20} className="text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nombre de usuario" 
                    className="w-full bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 border border-slate-200 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
                  <Lock size={20} className="text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Contraseña" 
                    className="w-full bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={loginLoading}
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#0B1120] py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-[#0F172A] hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loginLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : 'INGRESAR'}
                </button>
              </form>
            )}

            {/* --- FORMULARIO DE REGISTRO --- */}
            {isRegistering && (
              <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                
                {regError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nombres *</label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={regData.nombre}
                      onChange={handleRegChange}
                      placeholder="Ej. Juan"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-amber-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      name="apellido"
                      required
                      value={regData.apellido}
                      onChange={handleRegChange}
                      placeholder="Ej. Perez"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-amber-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">C.I. *</label>
                    <div className="relative flex items-center">
                      <CreditCard size={14} className="absolute left-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="ci"
                        required
                        value={regData.ci}
                        onChange={handleRegChange}
                        placeholder="Ej. 8765432"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-2 text-xs font-bold text-slate-800 outline-none focus:border-amber-400 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Celular</label>
                    <div className="relative flex items-center">
                      <Phone size={14} className="absolute left-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="celular"
                        value={regData.celular}
                        onChange={handleRegChange}
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-2 text-xs font-semibold text-slate-800 outline-none focus:border-amber-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Autogeneración */}
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 mt-2">
                  <p className="text-[10px] font-bold uppercase text-amber-800 mb-2 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-amber-600" /> Credenciales Generadas
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      readOnly
                      value={regData.username}
                      placeholder="Usuario"
                      className="w-full rounded-lg bg-white py-1.5 px-2 text-[11px] font-mono font-bold text-slate-600 border border-slate-200 outline-none cursor-not-allowed"
                    />
                    <input
                      type="text"
                      readOnly
                      value={regData.password}
                      placeholder="Contraseña"
                      className="w-full rounded-lg bg-white py-1.5 px-2 text-[11px] font-mono font-bold text-slate-600 border border-slate-200 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1120] py-3 text-xs font-extrabold tracking-wide text-white transition-all hover:bg-[#0F172A] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {regLoading ? <Loader2 size={16} className="animate-spin" /> : <><UserCheck size={16} /> REGISTRARME</>}
                </button>
              </form>
            )}

          </div>
        </div>
        
      </div>

      {/* --- MODAL FLOTANTE DE ÉXITO --- */}
      {isSuccessModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
            
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 size={34} strokeWidth={2.2} />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              ¡Cuenta creada con éxito!
            </h3>
            
            <p className="mt-2 text-sm text-slate-500">
              Tus credenciales han sido guardadas. Haz clic en continuar para iniciar sesión y entrar a tu portal de estudiante.
            </p>

            <button
              onClick={closeSuccessAndLogin}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              CONTINUAR AL LOGIN
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};