import { Download } from "lucide-react";
import React from "react";

export const ButtonReportesPDF = ({fun}) => {
  return (
    <div>
      <button
        onClick={fun}
        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
        title="Exportar listado visible a PDF"
      >
        <Download size={17} className="text-orange-500" />
        <span className="hidden sm:inline">Reporte General</span>
      </button>
    </div>
  );
};
