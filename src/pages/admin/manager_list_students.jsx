import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  Users,
  Layers,
  Loader2,
  Landmark,
  Phone,
  CreditCard
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Servicios
import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { facultadesService } from "../../services/admin/facultadesService";
import { FeedbackModal } from "../../components/common/FeedbackModal";

const money = (n) => `Bs. ${Number(n || 0).toFixed(2)}`;

export const ListasPorAreaPDF = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtros de Área y Curso
  const [filterFacultad, setFilterFacultad] = useState("TODAS");
  const [filterCurso, setFilterCurso] = useState("TODOS");
  const [includeOfficialSignatures, setIncludeOfficialSignatures] = useState(true);

  // Estados de Datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [facultades, setFacultades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const showFeedback = (title, message, type = "success") => setModalState({ isOpen: true, title, message, type });
  const closeFeedback = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  // Carga de Estudiantes y Facultades
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [estData, facData] = await Promise.all([
        inscripcionesService.getAll().catch(() => []),
        facultadesService.getAll().catch(() => []),
      ]);

      setFacultades(facData);

      const mapEst = estData.map((ins) => {
        const u = ins.postulante?.usuario || ins.usuario || {};
        const c = ins.curso || {};
        const pagosIns = ins.pagos || [];
        const pagado = pagosIns.reduce((acc, p) => acc + Number(p.monto_abonado || 0), 0);
        
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
          ci: u.ci || ins.ci || "S/C",
          nombre: `${u.nombre || ins.nombre || ""} ${u.apellido || ins.apellido || ""}`.trim() || "Sin Nombre",
          celular: u.celular || ins.celular || "Sin celular",
          facultad_id: facId,
          facultad_nombre: facObj?.nombre || "Facultad General",
          curso_id: c.curso_id ? String(c.curso_id) : "",
          curso_nombre: c.codigo || c.nombre || "Curso General",
          pagado: pagado,
          deuda: Math.max(0, Number(c.costo || 450) - pagado),
          estado: pagado >= Number(c.costo || 450) ? "Al día" : "Pendiente",
        };
      });

      setEstudiantes(mapEst);
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

  // Cabeceras fijas para listas por Área y Curso
  const tableHeaders = ["Cédula (C.I.)", "Estudiante", "Celular", "Área / Facultad", "Curso / Programa", "Estado"];

  // Construcción de Datos Filtrados
  const previewData = useMemo(() => {
    let rawData = estudiantes.filter((e) => {
      const matchFac = filterFacultad === "TODAS" || String(e.facultad_id) === String(filterFacultad);
      const matchCurso = filterCurso === "TODOS" || String(e.curso_id) === String(filterCurso);
      return matchFac && matchCurso;
    }).map((e) => ({
      id: e.id,
      col1: e.ci,
      col2: e.nombre,
      col3: e.celular,
      col4: e.facultad_nombre,
      col5: e.curso_nombre,
      estado: e.estado,
      _searchName: e.nombre.toLowerCase(),
      _searchCi: e.ci.toLowerCase(),
      _searchCel: e.celular.toLowerCase(),
    }));

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      rawData = rawData.filter(item => {
        return item._searchName.includes(q) ||
               item._searchCi.includes(q) ||
               item._searchCel.includes(q) ||
               item.col4.toLowerCase().includes(q) ||
               item.col5.toLowerCase().includes(q);
      });
    }

    return rawData;
  }, [estudiantes, filterFacultad, filterCurso, searchQuery]);

  // Generación del PDF
  const handleExportPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF("landscape");

        // Encabezado institucional
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("INSTITUTO SUMO", 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(234, 88, 12);
        doc.text("SISTEMA DE GESTIÓN INSTITUCIONAL", 14, 32);

        // Título del reporte
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("LISTA DE ESTUDIANTES POR ÁREA Y CURSO", 14, 48);

        const tableBody = previewData.map(item => [
          item.col1,
          item.col2,
          item.col3,
          item.col4,
          item.col5,
          item.estado.toUpperCase()
        ]);

        autoTable(doc, {
          startY: 55,
          head: [tableHeaders],
          body: tableBody,
          theme: 'grid',
          styles: { 
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4,
            textColor: [51, 65, 85],
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
          columnStyles: {
            0: { fontStyle: 'bold', halign: 'center' },
            2: { halign: 'center' },
            5: { fontStyle: 'bold', halign: 'center' }
          }
        });

        if (includeOfficialSignatures) {
          const finalY = doc.lastAutoTable.finalY + 40;
          if (finalY < doc.internal.pageSize.getHeight() - 30) {
            doc.setDrawColor(148, 163, 184);
            
            doc.line(40, finalY, 120, finalY);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(51, 65, 85);
            doc.text("SECRETARÍA ACADÉMICA", 52, finalY + 6);
            
            doc.line(180, finalY, 260, finalY);
            doc.text("DIRECCIÓN GENERAL", 195, finalY + 6);
          }
        }

        const fileName = `SUMO_Lista_Estudiantes_${new Date().toISOString().split('T')[0]}.pdf`;
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
              Listas de Estudiantes por Área
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-orange-700/80 tracking-wide mt-1">
              SECRETARÍA ACADÉMICA · REPORTES EN PDF
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
            {isGenerating ? "Generando..." : "Exportar Lista en PDF"}
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
        <StatCard
          icon={Users}
          label="Estudiantes Listados"
          value={`${previewData.length} inscritos`}
          accent="text-orange-600 bg-orange-100 border border-orange-200"
        />
        <StatCard
          icon={Layers}
          label="Filtro de Área"
          value={filterFacultad === "TODAS" ? "Todas las Áreas" : "Área Seleccionada"}
          accent="text-sky-600 bg-sky-100 border border-sky-200"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        
        {/* Columna Izquierda: Filtros de Búsqueda y Selección */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              <Filter size={14} className="text-orange-500" /> Parámetros de Selección
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
                    placeholder="Buscar por Nombre, C.I. o Celular..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Área / Facultad</label>
                <select
                  value={filterFacultad}
                  onChange={(e) => {
                    setFilterFacultad(e.target.value);
                    setFilterCurso("TODOS");
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:bg-white"
                >
                  <option value="TODAS">Todas las áreas / facultades</option>
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

        {/* Columna Derecha: Vista Previa del Documento */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-100/60 px-4 py-2.5 shadow-inner">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-800">
              <FileText size={16} /> Vista Previa de la Lista
            </span>
            <span className="text-[11px] font-bold text-orange-700">
              {previewData.length} estudiantes encontrados
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
                <p className="text-xs font-black text-slate-800">REF: LISTAS_AREA</p>
                <p className="text-[10px] text-slate-400">Emisión: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Título Central */}
            <div className="my-5 text-center">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
                Lista de Estudiantes por Área y Curso
              </h2>
            </div>

            {/* Tabla de Resultados */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1120] text-white">
                  <tr>
                    {tableHeaders.map((head, index) => (
                      <th key={index} className={`p-3 font-bold ${index === 5 ? 'text-center' : ''}`}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No se encontraron estudiantes para los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    previewData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-700">{item.col1}</td>
                        <td className="p-3 font-bold text-slate-900">{item.col2}</td>
                        <td className="p-3 font-mono text-slate-600">{item.col3}</td>
                        <td className="p-3 text-slate-600">{item.col4}</td>
                        <td className="p-3 font-semibold text-slate-700">{item.col5}</td>
                        <td className="p-3 text-center">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            item.estado.toLowerCase().includes('pendiente') 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
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
                    <p className="text-[10px] font-bold text-slate-700 mt-2 uppercase">Secretaría Académica</p>
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