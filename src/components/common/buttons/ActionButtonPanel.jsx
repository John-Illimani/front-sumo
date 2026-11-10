import React from "react";
import { Plus, Copy, Trash2, Check, Loader2, Settings, FileText } from "lucide-react";

export const ActionButtonPanel = ({
  isNew,
  saving,
  onSave,
  onNew,
  onDuplicate,
  onDelete,
  onExportPDF,
  saveTextNew = "Registrar Estudiante",
  saveTextEdit = "Actualizar Registro",
  deleteText = "Eliminar Registro",
}) => {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-100/60 p-5 shadow-inner">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
        <Settings size={16} /> Acciones del sistema
      </h3>

      <div className="flex flex-col gap-3">
        {/* Botón Principal Guardar / Actualizar */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(e);
          }}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Check size={18} />
              {isNew ? saveTextNew : saveTextEdit}
            </>
          )}
        </button>

        {/* Acciones Secundarias */}
        <div className={`grid ${onExportPDF ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNew(e);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-white py-2.5 text-xs font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            <Plus size={16} /> Nuevo
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDuplicate(e);
            }}
            disabled={isNew}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-white py-2.5 text-xs font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy size={16} /> Duplicar
          </button>

          {onExportPDF && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onExportPDF(e);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-white py-2.5 text-xs font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50 active:scale-[0.98]"
            >
              <FileText size={16} /> Ficha PDF
            </button>
          )}
        </div>

        {/* Botón Peligroso Eliminar */}
        <div className="mt-1 border-t border-orange-200/80 pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(e);
            }}
            disabled={isNew || saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={17} /> {deleteText}
          </button>
        </div>
      </div>
    </div>
  );
};