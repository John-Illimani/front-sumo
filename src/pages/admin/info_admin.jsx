import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Building2,
  BookOpen,
  DollarSign,
  Clock,
  QrCode,
  Plus,
  CheckCircle,
  X,
  CreditCard,
  Upload,
  Edit,
  Maximize2,
  Check,
  Eye,
  Trash2
} from "lucide-react";

import { studentService } from "../../services/admin/studentService";
import { cursosService } from "../../services/admin/cursosService";
import { pagosService } from "../../services/admin/pagosService";
import { qrInstitucionalService } from "../../services/admin/qrInstitucionalService";

export const DashboardInicio = ({ onNavigate = () => {} }) => {
  const [horaActual, setHoraActual] = useState(() =>
    new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursosActivos, setCursosActivos] = useState([]);
  const [pagosRecientes, setPagosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados QR / Cuentas
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrsList, setQrsList] = useState([]);
  const [tabModal, setTabModal] = useState("qr"); // 'qr' | 'cuenta'

  // Modal Formulario (Crear/Editar)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Modal Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);

  const [formQr, setFormQr] = useState({
    titular: "",
    banco: "",
    numero_cuenta: "",
    activo: true,
    qr_foto: null
  });

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(
        new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");

      const [dataEstudiantes, dataCursos, dataPagos, qrs, resUsuarios] = await Promise.all([
        studentService.getAll().catch(() => []),
        cursosService.getAll().catch(() => []),
        pagosService.getAll().catch(() => []),
        qrInstitucionalService.getAll().catch(() => []),
        fetch(import.meta.env.VITE_API_URL + "/api/usuarios", {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }).then((res) => (res.ok ? res.json() : [])).catch(() => [])
      ]);

      setEstudiantes(dataEstudiantes);
      setCursosActivos(dataCursos.filter((c) => c.estado === "activo"));
      setPagosRecientes(dataPagos);
      setQrsList(qrs);

      // Búsqueda del usuario en sesión por su 'username' exacto
      const savedUserStr = localStorage.getItem("user");
      let usernameTarget = null;

      if (savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          usernameTarget = parsedUser.username || parsedUser;
        } catch {
          usernameTarget = savedUserStr;
        }
      }

      if (!usernameTarget) {
        usernameTarget = localStorage.getItem("username");
      }

      if (usernameTarget && Array.isArray(resUsuarios) && resUsuarios.length > 0) {
        const usuarioEncontrado = resUsuarios.find(
          (u) => u.username?.toLowerCase() === String(usernameTarget).toLowerCase()
        );
        setUsuarioLogueado(usuarioEncontrado || null);
      } else {
        setUsuarioLogueado(null);
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  // FILTRO: Solo registros QUE TIENEN IMAGEN para la pestaña QR
  const qrsFiltrados = useMemo(() => {
    return qrsList.filter((item) => Boolean(item.qr_foto_base64 || item.qr_foto));
  }, [qrsList]);

  // FILTRO: Solo registros QUE NO TIENEN IMAGEN para la pestaña CUENTAS
  const cuentasFiltradas = useMemo(() => {
    return qrsList.filter((item) => !item.qr_foto_base64 && !item.qr_foto);
  }, [qrsList]);

  // Conteo de items activos
  const totalActivos = useMemo(() => {
    return qrsList.filter((q) => q.activo === true).length;
  }, [qrsList]);

  const ingresosMesTotal = useMemo(() => {
    return pagosRecientes.reduce((acc, p) => acc + (parseFloat(p.monto_abonado) || 0), 0);
  }, [pagosRecientes]);

  const cargarQrs = useCallback(async () => {
    try {
      const qrs = await qrInstitucionalService.getAll();
      setQrsList(qrs);
    } catch (error) {
      console.error("Error al re-cargar QRs:", error);
    }
  }, []);

  const handleActivarQr = async (id) => {
    try {
      await qrInstitucionalService.activar(id);
      await cargarQrs();
    } catch (error) {
      alert("Error al cambiar estado: " + error.message);
    }
  };

  const handleEliminarQr = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este registro?")) return;
    try {
      await qrInstitucionalService.delete(id);
      await cargarQrs();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Selecciona un archivo de imagen válido (PNG, JPG, JPEG)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
    setFormQr((prev) => ({ ...prev, qr_foto: file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const abrirModalCrear = () => {
    setEditingId(null);
    setFormQr({ titular: "", banco: "", numero_cuenta: "", activo: true, qr_foto: null });
    setPreviewImage(null);
    setShowFormModal(true);
  };

  const abrirModalEditar = (qr) => {
    const targetId = qr.qr_id || qr.id;
    setEditingId(targetId);
    setFormQr({
      titular: qr.titular || "",
      banco: qr.banco || "",
      numero_cuenta: qr.numero_cuenta || "",
      activo: Boolean(qr.activo),
      qr_foto: null
    });
    setPreviewImage(qr.qr_foto_base64 || qr.qr_foto || null);
    setShowFormModal(true);
  };

  const handleGuardarQr = async (e) => {
    e.preventDefault();
    
    if (tabModal === "qr" && !editingId && !formQr.qr_foto) {
      alert("Por favor selecciona una imagen para el código QR.");
      return;
    }

    const formData = new FormData();
    if (formQr.titular) formData.append("titular", formQr.titular);
    formData.append("activo", formQr.activo ? "1" : "0");

    if (formQr.banco) formData.append("banco", formQr.banco);
    if (formQr.numero_cuenta) formData.append("numero_cuenta", formQr.numero_cuenta);

    if (formQr.qr_foto instanceof File) {
      formData.append("qr_foto", formQr.qr_foto);
    }

    try {
      if (editingId) {
        await qrInstitucionalService.update(editingId, formData);
      } else {
        await qrInstitucionalService.create(formData);
      }
      setShowFormModal(false);
      await cargarQrs();
    } catch (error) {
      console.error("Error capturado al guardar:", error);
      alert("Error al procesar: " + error.message);
    }
  };

  const nombreUsuarioLogueado = usuarioLogueado
    ? `${usuarioLogueado.nombre || ""} ${usuarioLogueado.apellido || ""}`.trim()
    : "Administrador";

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-5 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40">
      
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1120] p-6 text-white shadow-lg">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Sistema Activo
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-400">
                Usuario: <strong className="text-white">{nombreUsuarioLogueado}</strong>
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Panel de Control General
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 px-4 py-3 text-xs font-bold text-white shadow-md transition-all active:scale-95"
            >
              <QrCode size={18} />
              <span>Gestionar QR / Cuentas</span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <Clock size={20} className="text-orange-400" />
              <span className="font-mono text-lg font-black text-orange-400">{horaActual}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Estudiantes</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{loading ? "..." : estudiantes.length}</p>
        </div>

        <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Ingresos del Mes</span>
          <p className="text-2xl font-black text-slate-900 mt-2">Bs. {loading ? "..." : ingresosMesTotal}</p>
        </div>

        <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Cursos Activos</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{loading ? "..." : `${cursosActivos.length} Cursos`}</p>
        </div>

        <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Métodos Activos</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {totalActivos} Activo{totalActivos !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tabla Pagos */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Pagos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Recibo</th>
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Medio</th>
                <th className="px-5 py-3">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagosRecientes.map((p, index) => (
                <tr key={p.pago_id || p.id || `pago-${index}`}>
                  <td className="px-5 py-3 font-bold">{p.recibo_nro}</td>
                  <td className="px-5 py-3">{p.concepto}</td>
                  <td className="px-5 py-3">{p.medio_pago}</td>
                  <td className="px-5 py-3 font-bold text-emerald-600">
        
        Bs. {Number(p.monto_abonado)}
      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PRINCIPAL GESTION DE QR / CUENTAS */}
      {showQrModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="text-orange-500" size={22} /> QR e Información Institucional
              </h2>
              <button 
                onClick={() => setShowQrModal(false)} 
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 my-4 border-b pb-2">
              <button
                onClick={() => setTabModal("qr")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  tabModal === "qr" ? "bg-orange-500 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <QrCode size={16} /> Ver Códigos QR
              </button>
              <button
                onClick={() => setTabModal("cuenta")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  tabModal === "cuenta" ? "bg-orange-500 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <CreditCard size={16} /> Ver Datos de Cuentas
              </button>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400">
                Total registrados: {tabModal === "qr" ? qrsFiltrados.length : cuentasFiltradas.length}
              </span>
              <button
                onClick={abrirModalCrear}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all"
              >
                <Plus size={16} /> {tabModal === "qr" ? "Subir Nuevo QR" : "Registrar Nueva Cuenta"}
              </button>
            </div>

            {/* VISTA 1: Códigos QR */}
            {tabModal === "qr" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto p-1 max-h-[50vh]">
                {qrsFiltrados.length === 0 ? (
                  <p className="col-span-2 text-center text-xs text-slate-400 py-6 font-bold">No hay códigos QR registrados.</p>
                ) : (
                  qrsFiltrados.map((qr) => {
                    const currentId = qr.qr_id || qr.id;
                    const imageSrc = qr.qr_foto_base64 || qr.qr_foto;

                    return (
                      <div
                        key={currentId}
                        className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${
                          qr.activo ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" : "border-slate-200 bg-white"
                        }`}
                      >
                        {qr.activo && (
                          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={12} /> Activo
                          </span>
                        )}

                        <div 
                          onClick={() => imageSrc && setLightboxImage(imageSrc)}
                          className="group relative w-44 h-44 flex items-center justify-center rounded-xl border bg-white p-2 shadow-sm overflow-hidden cursor-pointer hover:border-orange-400 transition-all"
                        >
                          <img src={imageSrc} alt={`QR ${qr.titular}`} className="max-h-full max-w-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity rounded-xl gap-1">
                            <Maximize2 size={20} />
                            <span>Ver Grande</span>
                          </div>
                        </div>
                        
                        <p className="mt-3 font-bold text-slate-800 text-xs text-center truncate w-full">
                          {qr.titular || "Sin Titular"}
                        </p>

                        <div className="mt-3 flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleActivarQr(currentId)}
                            className={`flex-1 py-1.5 rounded-xl border font-bold text-[11px] transition-colors ${
                              qr.activo ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" : "border-slate-300 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {qr.activo ? "Inactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => abrirModalEditar(qr)}
                            className="p-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminarQr(currentId)}
                            className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* VISTA 2: Cuentas Bancarias */}
            {tabModal === "cuenta" && (
              <div className="space-y-3 overflow-y-auto p-1 max-h-[50vh]">
                {cuentasFiltradas.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6 font-bold">No hay cuentas bancarias registradas.</p>
                ) : (
                  cuentasFiltradas.map((qr) => {
                    const currentId = qr.qr_id || qr.id;

                    return (
                      <div 
                        key={currentId} 
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                          qr.activo ? "border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/50" : "border-slate-200 bg-slate-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm">{qr.banco || "Sin Banco Especificado"}</p>
                            {qr.activo && (
                              <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Activo</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 font-medium">Titular: <strong className="text-slate-900">{qr.titular}</strong></p>
                          <p className="text-xs font-mono text-slate-600 bg-white/80 px-2 py-1 rounded-lg border border-slate-200 inline-block">
                            N° Cuenta: {qr.numero_cuenta || "No asignado"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleActivarQr(currentId)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                              qr.activo ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" : "border-slate-300 text-slate-600 hover:bg-white"
                            }`}
                          >
                            {qr.activo ? "Inactivar" : "Activar"}
                          </button>

                          <button
                            onClick={() => abrirModalEditar(qr)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
                          >
                            <Edit size={14} /> Editar
                          </button>

                          <button
                            onClick={() => handleEliminarQr(currentId)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      , document.body)}

      {/* MODAL CREAR / EDITAR */}
      {showFormModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-800">
                {editingId 
                  ? (tabModal === "qr" ? "Editar Imagen y Titular QR" : "Editar Datos de Cuenta") 
                  : (tabModal === "qr" ? "Registrar Nuevo QR" : "Registrar Nueva Cuenta")
                }
              </h3>
              <button onClick={() => setShowFormModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarQr} className="space-y-4">
              {tabModal === "qr" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Imagen del QR {!editingId && "(*)"}</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer ${
                        isDragging ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/50"
                      }`}
                    >
                      {previewImage ? (
                        <div className="relative flex flex-col items-center">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxImage(previewImage);
                            }}
                            className="group relative w-36 h-36 flex items-center justify-center rounded-xl border bg-white p-2 shadow-sm overflow-hidden"
                          >
                            <img src={previewImage} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity rounded-lg">
                              <Eye size={20} />
                            </div>
                          </div>
                          <span className="mt-2 text-[10px] font-bold text-orange-600">Haz clic o arrastra para reemplazar</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <Upload size={32} className="mb-2 text-slate-400" />
                          <p className="text-xs font-bold text-slate-600">Arrastra la imagen del QR aquí</p>
                          <p className="text-[10px] text-slate-400">o haz clic para examinar tus archivos</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Titular del QR</label>
                    <input
                      type="text"
                      placeholder="Nombre del Titular"
                      value={formQr.titular}
                      onChange={(e) => setFormQr({ ...formQr, titular: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </>
              )}

              {tabModal === "cuenta" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Titular de la Cuenta</label>
                    <input
                      type="text"
                      placeholder="Nombre del Titular de la cuenta"
                      value={formQr.titular}
                      onChange={(e) => setFormQr({ ...formQr, titular: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Banco</label>
                    <input
                      type="text"
                      placeholder="Ej. Banco Unión, BNB, Mercantil"
                      value={formQr.banco}
                      onChange={(e) => setFormQr({ ...formQr, banco: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">N° de Cuenta</label>
                    <input
                      type="text"
                      placeholder="Ej. 10000012345678"
                      value={formQr.numero_cuenta}
                      onChange={(e) => setFormQr({ ...formQr, numero_cuenta: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="activoCheckbox"
                  checked={formQr.activo}
                  onChange={(e) => setFormQr({ ...formQr, activo: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                />
                <label htmlFor="activoCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Establecer como activo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowFormModal(false)} className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all">
                  {editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}

      {/* LIGHTBOX */}
      {lightboxImage && createPortal(
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setLightboxImage(null)} className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors">
              <X size={24} />
            </button>
            <img src={lightboxImage} alt="QR Ampliado" className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      , document.body)}

    </div>
  );
};