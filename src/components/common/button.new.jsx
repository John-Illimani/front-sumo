import React from "react";

export const ButtonNew = ({fun}) => {
  return (
    <div>
      <button
        onClick={fun}
        className="flex items-center gap-2 rounded-xl bg-[#0B1120] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
      >
        <Plus size={17} /> Nuevo
      </button>
    </div>
  );
};
