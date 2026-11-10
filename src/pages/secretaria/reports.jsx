import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  Users,
  DollarSign,
  Award,
  Shield,
  Landmark,
  PieChart,
  Layers,
  Loader2,
  Calendar,
  CreditCard
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Servicios
import { secretariaService } from "../../services/admin/secretariaService";
import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { docentesService } from "../../services/admin/docenteService";
import { pagosService } from "../../services/admin/pagosService";
import { facultadesService } from "../../services/admin/facultadesService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const REPORT_TYPES = [
  {
    id: "INGRESOS_FINANCIEROS",
    title: "Reporte de Ingresos y Pagos",
    subtitle: "Detalle de recaudación, recibos, montos y medios de pago",
    icon: DollarSign,
    category: "Financiero",
  },
  {
    id: "ESTUDIANTES_GENERAL",
    title: "Reporte General de Estudiantes",
    subtitle: "Listado completo de estudiantes registrados en el sistema",
    icon: Users,
    category: "Padrón General",
  },
  {
    id: "ESTUDIANTES_FACULTAD_CURSO",
    title: "Estudiantes por Facultad y Curso",
    subtitle: "Listado segmentado de postulantes por programa",
    icon: Layers,
    category: "Padrón Académico",
  },
  {
    id: "DOCENTES_PLANTA",
    title: "Planta Docente",
    subtitle: "Consolidado de profesores, especialidades y contacto",
    icon: Award,
    category: "Plantel Académico",
  },
  {
    id: "SECRETARIAS_PERSONAL",
    title: "Personal de Secretarías",
    subtitle: "Control de personal administrativo y de atención",
    icon: Shield,
    category: "Personal Administrativo",
  },
];

const money = (n) => `Bs. ${Number(n || 0)}`;

// Función auxiliar para formatear la fecha a nivel local sin desfase UTC
const obtenerFechaLocal = (fechaStr) => {
  if (!fechaStr) return "S/F";
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return fechaStr.split("T")[0];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const ReportesGeneralesSecretaria = () => {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtros de Fechas
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  
  // Filtros Específicos
  const [filterMedioPago, setFilterMedioPago] = useState("TODOS");
  const [filterEstadoPago, setFilterEstadoPago] = useState("TODOS");
  const [filterFacultad, setFilterFacultad] = useState("TODAS");
  const [filterCurso, setFilterCurso] = useState("TODOS");
  const [includeOfficialSignatures, setIncludeOfficialSignatures] = useState(true);

  // Estados de Datos
  const [pagos, setPagos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [facultades, setFacultades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const showFeedback = (title, message, type = "success") => setModalState({ isOpen: true, title, message, type });
  const closeFeedback = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  // Carga Paralela
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [pagosData, estData, docData, secData, facData] = await Promise.all([
        pagosService.getAll().catch(() => []),
        inscripcionesService.getAll().catch(() => []),
        docentesService.getAll().catch(() => []),
        secretariaService.getAll().catch(() => []),
        facultadesService.getAll().catch(() => []),
      ]);

      setPagos(pagosData);
      setDocentes(docData);
      setSecretarias(secData);
      setFacultades(facData);

      // Calcular el pago total global por estudiante agrupado por C.I.
      const pagosPorEstudiante = {};
      estData.forEach((ins) => {
        const u = ins.postulante?.usuario || {};
        const ci = u.ci || "S/C";
        const pagosIns = ins.pagos || [];
        const montoInscripcion = pagosIns.reduce((acc, p) => acc + Number(p.monto_abonado || 0), 0);
        pagosPorEstudiante[ci] = (pagosPorEstudiante[ci] || 0) + montoInscripcion;
      });

      const mapEst = estData.map((ins) => {
        const u = ins.postulante?.usuario || {};
        const c = ins.curso || {};
        const ci = u.ci || "S/C";
        const totalAbonadoEstudiante = pagosPorEstudiante[ci] || 0;
        
        let facId = c.facultad_id ? String(c.facultad_id) : "";
        if (!facId && c.curso_id) {
          const foundFac = facData.find((f) =>
            (f.cursos || []).some((item) => String(item.curso_id) === String(c.curso_id))
          );
          if (foundFac) facId = String(foundFac.facultad_id);
        }
        const facObj = facData.find((f) => String(f.facultad_id) === String(facId));

        return {
          id: ins.inscripcion_id,
          ci: ci,
          nombre: `${u.nombre || ""} ${u.apellido || ""}`.trim() || "Sin Nombre",
          celular: u.celular || "Sin celular",
          facultad_id: facId,
          facultad_nombre: facObj?.nombre || "Facultad General",
          curso_id: c.curso_id ? String(c.curso_id) : "",
          curso_nombre: c.codigo || c.nombre || "Curso General",
          pagado: totalAbonadoEstudiante,
          deuda: Math.max(0, Number(c.costo || 450) - totalAbonadoEstudiante),
          estado: totalAbonadoEstudiante > 0 ? "Al día" : "Pendiente",
        };
      });

      setEstudiantes(mapEst);

      // Obtiene la fecha local en formato YYYY-MM-DD
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setFechaDesde(today);
      setFechaHasta(today);
    } catch (error) {
      showFeedback("Error de Carga", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const cursosDisponiblesFiltro = useMemo(() => {
    if (filterFacultad === "TODAS") return facultades.flatMap((f) => f.cursos || []);
    const fac = facultades.find((f) => String(f.facultad_id) === String(filterFacultad));
    return fac?.cursos || [];
  }, [facultades, filterFacultad]);

  // Cabeceras Dinámicas para asegurar coincidencia exacta UI <-> PDF
  const tableHeaders = useMemo(() => {
    if (selectedReport.id === "INGRESOS_FINANCIEROS") {
      return ["Nro. Recibo", "Concepto / Detalle", "Fecha", "Medio de Pago", "Monto"];
    } else if (selectedReport.id.includes("ESTUDIANTES")) {
      return ["Cédula (C.I.)", "Estudiante", "Celular", "Área / Facultad", "Curso / Programa", "Abonado"];
    } else {
      return ["Cédula (C.I.)", "Nombre Completo", "Celular", "Asignación / Rol", "Detalle Extra"];
    }
  }, [selectedReport]);

  // Construcción de Datos Universales (UI y PDF)
  const previewData = useMemo(() => {
    let rawData = [];

    if (selectedReport.id.includes("ESTUDIANTES")) {
      rawData = estudiantes.filter((e) => {
        if (selectedReport.id === "ESTUDIANTES_FACULTAD_CURSO") {
          const matchFac = filterFacultad === "TODAS" || String(e.facultad_id) === String(filterFacultad);
          const matchCurso = filterCurso === "TODOS" || String(e.curso_id) === String(filterCurso);
          return matchFac && matchCurso;
        }
        return true;
      }).map((e) => ({
        id: e.id,
        col1: e.ci,
        col2: e.nombre.toUpperCase(),
        col3: e.celular,
        col4: e.facultad_nombre.toUpperCase(),
        col5: e.curso_nombre,
        col6: money(e.pagado),
        estado: e.estado,
        _searchName: e.nombre.toLowerCase(),
        _rawPagado: e.pagado,
        _rawDeuda: e.deuda
      }));

    } else if (selectedReport.id === "INGRESOS_FINANCIEROS") {
      rawData = pagos.map((p) => {
        const u = p.postulante?.usuario || p.usuario || {};
        const nombrePostulante = `${u.nombre || ''} ${u.apellido || ''}`.trim() || "Desconocido";

        return {
          id: p.pago_id,
          col1: p.recibo_nro || `PAG-${p.pago_id}`,
          col2: (`${p.concepto || 'Abono'} \nEstudiante: ${nombrePostulante}`).toUpperCase(),
          col3: obtenerFechaLocal(p.fecha_pago),
          col4: p.medio_pago || "S/M",
          col5: money(p.monto_abonado),
          estado: p.estado_pago || "registrado",
          _rawFecha: obtenerFechaLocal(p.fecha_pago),
          _searchName: nombrePostulante.toLowerCase(),
          _rawMonto: Number(p.monto_abonado || 0)
        };
      });

      if (filterMedioPago !== "TODOS") rawData = rawData.filter(p => p.col4 === filterMedioPago);
      if (filterEstadoPago !== "TODOS") rawData = rawData.filter(p => (p.estado || "").toLowerCase() === filterEstadoPago.toLowerCase());
      if (fechaDesde) rawData = rawData.filter(p => p._rawFecha >= fechaDesde);
      if (fechaHasta) rawData = rawData.filter(p => p._rawFecha <= fechaHasta);

    } else if (selectedReport.id === "DOCENTES_PLANTA") {
      rawData = docentes.map(d => {
        const u = d.usuario || {};
        const nom = (d.nombre || u.nombre || "").trim();
        const ape = (d.apellido || u.apellido || "").trim();
        return {
          id: d.docente_id,
          col1: d.ci || u.ci || "S/C",
          col2: (`${nom} ${ape}`.trim() || "Sin Nombre").toUpperCase(),
          col3: d.celular || u.celular || "S/N",
          col4: d.grado_academico || "Licenciatura",
          col5: d.especialidad || "General",
          estado: d.activo ? "Activo" : "Inactivo"
        };
      });
    } else if (selectedReport.id === "SECRETARIAS_PERSONAL") {
      rawData = secretarias.map(s => {
        const u = s.usuario || s;
        const nom = (u.nombre || s.nombre || "").trim();
        const ape = (u.apellido || s.apellido || "").trim();
        return {
          id: s.secretaria_id || u.usuario_id,
          col1: u.ci || s.ci || "S/C",
          col2: (`${nom} ${ape}`.trim() || "Sin Nombre").toUpperCase(),
          col3: u.celular || s.celular || "S/N",
          col4: s.ventanilla_asignada || "Ventanilla",
          col5: `Turno: ${s.turno || "Mañana"}`,
          estado: "Operativa"
        };
      });
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      rawData = rawData.filter(item => {
        return (item.col1 && item.col1.toString().toLowerCase().includes(q)) ||
               (item.col2 && item.col2.toString().toLowerCase().includes(q)) ||
               (item.col4 && item.col4.toString().toLowerCase().includes(q)) ||
               (item.col5 && item.col5.toString().toLowerCase().includes(q)) ||
               (item._searchName && item._searchName.includes(q));
      });
    }

    // Cálculo de rowSpan por estudiante si es reporte de estudiantes
    if (selectedReport.id.includes("ESTUDIANTES")) {
      const grouped = [];
      let i = 0;
      while (i < rawData.length) {
        let current = rawData[i];
        let count = 1;
        
        while (i + count < rawData.length && rawData[i + count].col1 === current.col1) {
          count++;
        }

        for (let j = 0; j < count; j++) {
          grouped.push({
            ...rawData[i + j],
            rowSpan: j === 0 ? count : 0,
            isFirstInGroup: j === 0
          });
        }
        i += count;
      }
      return grouped;
    }

    return rawData;
  }, [selectedReport, pagos, estudiantes, docentes, secretarias, filterMedioPago, filterEstadoPago, fechaDesde, fechaHasta, filterFacultad, filterCurso, searchQuery]);

  const summary = useMemo(() => {
    const totalRegistros = previewData.length;
    let montoTotal = 0;

    if (selectedReport.id === "INGRESOS_FINANCIEROS") {
      montoTotal = previewData.filter(p => p.estado.toLowerCase() !== 'anulado').reduce((acc, i) => acc + (i._rawMonto || 0), 0);
    } else if (selectedReport.id.includes("ESTUDIANTES")) {
      const registrados = new Set();
      montoTotal = previewData.reduce((acc, curr) => {
        if (!registrados.has(curr.col1)) {
          registrados.add(curr.col1);
          return acc + (curr._rawPagado || 0);
        }
        return acc;
      }, 0);
    }
    return { totalRegistros, montoTotal };
  }, [previewData, selectedReport]);

  const handleExportPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF("landscape");

        // --- ENCABEZADO DEL DOCUMENTO ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("INSTITUTO SUMO", 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(234, 88, 12);
        doc.text("SISTEMA DE GESTIÓN INSTITUCIONAL", 14, 32);

        // --- TÍTULO DEL REPORTE ---
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(selectedReport.title.toUpperCase(), 14, 48);

        let startY = 55;
        if (selectedReport.id === "INGRESOS_FINANCIEROS") {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(`Período analizado: ${fechaDesde} al ${fechaHasta}`, 14, 55);
          startY = 62;
        }

        // --- TABLA DE DATOS ---
        const isEstudianteReport = selectedReport.id.includes("ESTUDIANTES");

        const tableBody = previewData.map(item => {
          if (isEstudianteReport) {
            const row = [
              item.col1,
              item.col2,
              item.col3,
              item.col4,
              item.col5
            ];
            if (item.rowSpan > 0) {
              row.push({
                content: item.col6,
                rowSpan: item.rowSpan,
                styles: { fontStyle: 'bold', halign: 'center', valign: 'middle', textColor: [4, 120, 87] }
              });
            }
            return row;
          }

          return [
            item.col1,
            item.col2.replace('\n', ' - '),
            item.col3,
            item.col4,
            item.col5,
            item.estado.toUpperCase()
          ];
        });

        autoTable(doc, {
          startY: startY,
          head: [tableHeaders],
          body: tableBody,
          theme: 'grid',
          styles: { 
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4,
            textColor: [51, 65, 85],
            valign: 'middle'
          },
          headStyles: { 
            fillColor: [11, 17, 32],
            textColor: [255, 255, 255], 
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: { 
            fillColor: [248, 250, 252] 
          },
          columnStyles: isEstudianteReport 
            ? { 0: { fontStyle: 'bold', halign: 'center' }, 2: { halign: 'center' } }
            : {
                0: { fontStyle: 'bold', halign: 'center' },
                4: { fontStyle: 'bold', textColor: [4, 120, 87] },
                5: { fontStyle: 'bold', halign: 'center' }
              }
        });

        // --- FIRMAS (Opcional) ---
        if (includeOfficialSignatures) {
          const finalY = doc.lastAutoTable.finalY + 40;
          
          if (finalY < doc.internal.pageSize.getHeight() - 30) {
            doc.setDrawColor(148, 163, 184);
            
            // Firma Izquierda
            doc.line(40, finalY, 120, finalY);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(51, 65, 85);
            doc.text("RECURSOS HUMANOS / FINANZAS", 45, finalY + 6);
            
            // Firma Derecha
            doc.line(180, finalY, 260, finalY);
            doc.text("DIRECCIÓN GENERAL", 195, finalY + 6);
          }
        }

        // --- GUARDADO ---
        const fileName = `SUMO_${selectedReport.id}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        showFeedback("Reporte Descargado", `El documento "${fileName}" fue generado con éxito.`, "success");
      } catch (error) {
        console.error(error);
        showFeedback("Error al Exportar", "Hubo un problema al crear el PDF. Asegúrate de tener registros visibles.", "error");
      } finally {
        setIsGenerating(false);
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-orange-50/40 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-5 p-4 sm:p-6 font-sans border border-orange-200/70 rounded-3xl bg-orange-50/40">
      
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Centro de Reportes de Secretaría
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-1">
              SISTEMA ADMINISTRATIVO Y FINANCIERO
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isGenerating || previewData.length === 0}
            className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 w-full justify-center sm:w-auto"
          >
            <Download size={18} className={isGenerating ? "animate-bounce text-orange-400" : "text-orange-400"} />
            {isGenerating ? "Procesando..." : `Exportar ${selectedReport.category}`}
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Registros Totales"
          value={selectedReport.id.includes("ESTUDIANTES") ? `${previewData.filter(d => d.isFirstInGroup).length} estudiantes` : `${summary.totalRegistros} filas`}
          accent="text-slate-600 bg-slate-100 border border-slate-200"
        />
        {selectedReport.id === "INGRESOS_FINANCIEROS" || selectedReport.id.includes("ESTUDIANTES") ? (
          <>
            <StatCard
              icon={DollarSign}
              label={selectedReport.id === "INGRESOS_FINANCIEROS" ? "Recaudación Válida" : "Recaudación Total"}
              value={money(summary.montoTotal)}
              accent="text-emerald-600 bg-emerald-100 border border-emerald-200"
            />
            <StatCard
              icon={PieChart}
              label={selectedReport.id === "INGRESOS_FINANCIEROS" ? "Filtro Fechas" : "Tipo de Padrón"}
              value={selectedReport.id === "INGRESOS_FINANCIEROS" ? (fechaDesde === fechaHasta ? fechaDesde : "Rango Seleccionado") : selectedReport.category}
              accent="text-sky-600 bg-sky-100 border border-sky-200"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Tipo de Padrón"
              value={selectedReport.category}
              accent="text-orange-600 bg-orange-100 border border-orange-200"
            />
            <StatCard
              icon={Shield}
              label="Estado"
              value="Sincronizado"
              accent="text-sky-600 bg-sky-100 border border-sky-200"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        
        {/* Columna Izquierda: Plantillas y Filtros */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Módulos de Reporte
            </h3>
            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map((rep) => {
                const Icon = rep.icon;
                const active = selectedReport.id === rep.id;
                return (
                  <button
                    type="button"
                    key={rep.id}
                    onClick={() => {
                      setSelectedReport(rep);
                      setSearchQuery("");
                    }}
                    className={`flex items-start gap-3 rounded-xl p-3 text-left transition-all ${
                      active
                        ? "bg-[#0B1120] text-white shadow-md"
                        : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black truncate">{rep.title}</p>
                      <p className={`text-[11px] leading-tight mt-0.5 line-clamp-2 ${active ? "text-slate-300" : "text-slate-400"}`}>
                        {rep.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtros Dinámicos */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              <Filter size={14} className="text-orange-500" /> Parámetros y Filtros
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Búsqueda General</label>
                <div className="relative mt-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {selectedReport.id === "ESTUDIANTES_FACULTAD_CURSO" && (
                <>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Facultad / Unidad</label>
                    <select
                      value={filterFacultad}
                      onChange={(e) => {
                        setFilterFacultad(e.target.value);
                        setFilterCurso("TODOS");
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                    >
                      <option value="TODAS">Todas las facultades</option>
                      {facultades.map((f) => (
                        <option key={f.facultad_id} value={String(f.facultad_id)}>
                          {f.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Curso / Programa</label>
                    <select
                      value={filterCurso}
                      onChange={(e) => setFilterCurso(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                    >
                      <option value="TODOS">Todos los cursos</option>
                      {cursosDisponiblesFiltro.map((c) => (
                        <option key={c.curso_id} value={String(c.curso_id)}>
                          {c.codigo} — {c.nombre || "Curso"}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {selectedReport.id === "INGRESOS_FINANCIEROS" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><Calendar size={12}/> Desde</label>
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><Calendar size={12}/> Hasta</label>
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><CreditCard size={12}/> Medio de Pago</label>
                    <select
                      value={filterMedioPago}
                      onChange={(e) => setFilterMedioPago(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                    >
                      <option value="TODOS">Todos los medios</option>
                      <option value="Pago Presencial en Ventanilla">Pago Presencial en Ventanilla</option>
                      <option value="Pago Móvil QR BCP">Pago Móvil QR BCP</option>
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Efectivo / Caja">Efectivo / Caja</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><Shield size={12}/> Estado del Pago</label>
                    <select
                      value={filterEstadoPago}
                      onChange={(e) => setFilterEstadoPago(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                    >
                      <option value="TODOS">Todos los estados</option>
                      <option value="confirmado">Confirmado / Completado</option>
                      <option value="anulado">Anulado</option>
                      <option value="pendiente">Pendiente</option>
                    </select>
                  </div>
                </>
              )}

              <div className="mt-2 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeOfficialSignatures}
                    onChange={(e) => setIncludeOfficialSignatures(e.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-400"
                  />
                  Incluir Espacios para Firma Oficial
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tabla y Vista Previa */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-100/60 px-4 py-2.5 shadow-inner">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-800">
              <FileText size={16} /> Vista Previa del Documento
            </span>
            <span className="text-[11px] font-bold text-orange-700">
              Mostrando {summary.totalRegistros} resultados
            </span>
          </div>

          <div className="min-h-[620px] rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 shadow-md">
            
            {/* Membrete Oficial */}
            <div className="flex items-start justify-between border-b-2 border-[#0B1120] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 font-black text-xl shadow-md">
                  <Landmark size={26} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                    INSTITUTO SUMO
                  </h1>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-600 mt-1">
                    SISTEMA DE GESTIÓN INSTITUCIONAL
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-black text-slate-800">REF: {selectedReport.id}</p>
                <p className="text-[10px] text-slate-400">Emisión: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Título Central */}
            <div className="my-5 text-center">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
                {selectedReport.title}
              </h2>
              {selectedReport.id === "INGRESOS_FINANCIEROS" && (
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Período: {fechaDesde} al {fechaHasta}
                </p>
              )}
            </div>

            {/* Tabla de Resultados */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0B1120] text-white">
                  <tr>
                    {tableHeaders.map((head, index) => (
                      <th key={index} className={`p-3 font-bold ${index === (selectedReport.id.includes("ESTUDIANTES") ? 5 : 4) ? 'text-center' : ''}`}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No se encontraron registros activos para los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    previewData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-700 border-b border-slate-100">{item.col1}</td>
                        <td className="p-3 font-bold text-slate-900 whitespace-pre-line border-b border-slate-100">{item.col2}</td>
                        <td className="p-3 font-mono font-semibold text-slate-600 border-b border-slate-100">{item.col3}</td>
                        <td className="p-3 text-slate-600 border-b border-slate-100">{item.col4}</td>
                        
                        {selectedReport.id.includes("ESTUDIANTES") ? (
                          <>
                            <td className="p-3 font-semibold text-slate-700 border-b border-slate-100">{item.col5}</td>
                            {item.rowSpan > 0 && (
                              <td
                                rowSpan={item.rowSpan}
                                className="p-3 font-bold text-emerald-700 text-center bg-slate-50/50 border-l border-b border-slate-200 align-middle"
                              >
                                {item.col6}
                              </td>
                            )}
                          </>
                        ) : (
                          <td className={`p-3 border-b border-slate-100 ${selectedReport.id.includes("INGRESOS") ? 'font-bold text-emerald-700' : 'text-slate-500'}`}>
                            {item.col5}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Firmas Autorizadas */}
            {includeOfficialSignatures && (
              <div className="mt-12 grid grid-cols-1 gap-6 border-t border-dashed border-slate-300 pt-10 sm:grid-cols-2">
                <div className="flex items-center justify-around gap-4 text-center col-span-full">
                  <div className="flex-1">
                    <div className="mx-auto w-40 border-b border-slate-400 pb-8" />
                    <p className="text-[10px] font-bold text-slate-700 mt-2 uppercase">Recursos Humanos / Finanzas</p>
                  </div>
                  <div className="flex-1">
                    <div className="mx-auto w-40 border-b border-slate-400 pb-8" />
                    <p className="text-[10px] font-bold text-slate-700 mt-2 uppercase">Dirección General</p>
                  </div>
                </div>
              </div>
            )}

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
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="truncate text-lg font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}