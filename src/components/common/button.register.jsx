import { RefreshCw } from "lucide-react";
import React from "react";

export const ButtonRegisterNew = ({fun},isNew) => {
  return (
    <>
      <button
        onClick={fun}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1120] py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
      >
        <RefreshCw size={17} />{" "}
        {isNew ? "Guardar nuevo registro" : "Actualizar registro"}
      </button>
    </>
  );
};
