import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  GraduationCap,
  X,
  Check,
  Loader2,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

import { facultadesService } from "../../services/admin/facultadesService";
import { inscripcionesService } from "../../services/admin/inscripcionesService";
import { blockchainService } from "../../services/admin/blockchainService";
import { BlockchainEmisionModal } from "../../components/common/BlockchainEmisionModal";

const INK = {
  navy: [11, 17, 32],
  navy2: [20, 30, 50],
  gold: [217, 119, 6],
  slate: [71, 85, 105],
  emerald: [16, 185, 129],
  paper: [250, 248, 242],
  ink: [30, 41, 59],
};

/** Algoritmo Canónico JS idéntico a HashUtil::generarHashInscripcion en PHP */
async function generarHashInscripcionJS(datos, textoCertificado) {
  const payload = {
    ci: String(datos.ci || "").trim(),
    curso: String(datos.programa || datos.curso || "").trim().toUpperCase(),
    facultad: String(datos.facultad || "").trim().toUpperCase(),
    nombreCompleto: String(datos.nombres || datos.nombreCompleto || "").trim().toUpperCase(),
    textoCertificado: String(textoCertificado || "").trim(),
  };

  const payloadOrdenado = Object.keys(payload)
    .sort()
    .reduce((obj, key) => {
      obj[key] = payload[key];
      return obj;
    }, {});

  const payloadString = JSON.stringify(payloadOrdenado);
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const cargarLogoBase64 = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = "/logo_sumo.png";
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
  });
};

// 1. Marca de agua con visibilidad corregida y distribución diagonal
const generarFondoMarcasDeAgua = (logoBase64, ciEstudiante, widthMM, heightMM) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const scale = 3;
    canvas.width = widthMM * 3.78 * scale;
    canvas.height = heightMM * 3.78 * scale;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#FAF8F2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderPattern = (imgObj) => {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((-25 * Math.PI) / 180);

      const rowStep = 75 * scale;
      const colStep = 170 * scale;
      const logoSize = 24 * scale;

      ctx.font = `bold ${13 * scale}px Helvetica, Arial, sans-serif`;
      ctx.fillStyle = "#0F172A";

      const startX = -canvas.width * 1.5;
      const endX = canvas.width * 1.5;
      const startY = -canvas.height * 1.5;
      const endY = canvas.height * 1.5;

      for (let y = startY, rowIndex = 0; y < endY; y += rowStep, rowIndex++) {
        const offsetX = (rowIndex % 2) * (colStep / 2);
        for (let x = startX + offsetX; x < endX; x += colStep) {
          if (imgObj) {
            ctx.globalAlpha = 0.16;
            ctx.drawImage(imgObj, x, y, logoSize, logoSize);
          }
          ctx.globalAlpha = 0.14;
          ctx.fillText(`SUMO  C.I. ${ciEstudiante}`, x + logoSize + (6 * scale), y + (17 * scale));
        }
      }
      ctx.restore();
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };

    if (logoBase64) {
      const logoImg = new Image();
      logoImg.onload = () => renderPattern(logoImg);
      logoImg.onerror = () => renderPattern(null);
      logoImg.src = logoBase64;
    } else {
      renderPattern(null);
    }
  });
};

export const GeneradorCertificados = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emittingBlockchain, setEmittingBlockchain] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [filterFacultad, setFilterFacultad] = useState("TODAS");

  const [textoCertificado, setTextoCertificado] = useState(
    "Ha cumplido satisfactoriamente con todos los requisitos académicos, legales y disposiciones del plan de estudios vigente, por cuanto se le otorga el presente Certificado de Conclusión de Estudios."
  );

  const [filter, setFilter] = useState({ estudiante: "", paralelo: "todos" });
  const [modalInfo, setModalInfo] = useState(null);
  const [pendingPrint, setPendingPrint] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (message, tone = "ok") => setToast({ message, tone });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [estData, facData] = await Promise.all([
          inscripcionesService.getAll().catch(() => []),
          facultadesService.getAll().catch(() => []),
        ]);

        const mapEst = await Promise.all(
          estData.map(async (ins, index) => {
            const postulanteObj = ins.postulante || ins.postulantes || {};
            const usuarioObj = postulanteObj.usuario || ins.usuario || {};
            const cursoObj = ins.curso || {};

            const datosEst = {
              id: Number(ins.inscripcion_id || ins.id || index + 1),
              postulanteId: Number(ins.postulante_id || postulanteObj.postulante_id || index + 1),
              cursoId: Number(cursoObj.curso_id || ins.curso_id || 1),
              codigoInscripcion: String(
                ins.codigo_inscripcion || ins.codigoInscripcion || `INS-2026-${index + 100}`
              ).trim(),
              nombres: `${usuarioObj.nombre || usuarioObj.nombres || ""} ${usuarioObj.apellido || usuarioObj.apellidos || ""}`.trim() || ins.estudiante || "Estudiante Ejemplo",
              ci: String(usuarioObj.ci || usuarioObj.carnet || ins.ci || "1234567").trim(),
              facultad: ins.facultad || "Facultad General de Tecnología",
              programa: cursoObj.nombre || ins.programa || "Programa Académico Avanzado",
              totalHoras: ins.total_horas || cursoObj.horas,
              fechaConclusion: ins.fecha_aprobacion || ins.fecha_conclusion || "2026-08-25",
              hashDiploma: ins.hash_blockchain || "",
              emitidoBlockchain: Boolean(ins.hash_blockchain),
              paralelo: ins.paralelo || "PARALELO A",
            };

            if (!datosEst.hashDiploma) {
              datosEst.hashDiploma = await generarHashInscripcionJS(datosEst, textoCertificado);
            }

            return datosEst;
          })
        );

        setEstudiantes(mapEst);
        setFacultades(facData);
        if (mapEst.length > 0) setSelectedId(mapEst[0].id);
      } catch (error) {
        notify("Error cargando los registros", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEstudiantes = useMemo(() => {
    const fEst = filter.estudiante.toLowerCase().trim();
    return estudiantes.filter((e) => {
      const matchFac = filterFacultad === "TODAS" || String(e.facultad_id) === String(filterFacultad);
      const coincideEstudiante =
        !fEst || e.nombres.toLowerCase().includes(fEst) || e.ci.toLowerCase().includes(fEst);
      return matchFac && coincideEstudiante;
    });
  }, [estudiantes, filterFacultad, filter]);

  const estudianteActual = useMemo(() => {
    return (
      estudiantes.find((e) => e.id === selectedId) ||
      estudiantes[0] || {
        postulanteId: 0,
        nombres: "NOMBRE ESTUDIANTE",
        ci: "0000000",
        facultad: "Facultad General",
        programa: "Programa Académico",
        totalHoras: 320,
        hashDiploma: "",
        emitidoBlockchain: false,
      }
    );
  }, [estudiantes, selectedId]);

  const generarQRDataURL = async (logoUrl, options = {}) => {
    const { scale = 5, logoRatio = 0.22, timeoutMs = 8000 } = options;

    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const safetyTimer = setTimeout(() => finish(null), timeoutMs);

      const svgElement = document.getElementById("certificate-qr-svg");
      if (!svgElement) {
        clearTimeout(safetyTimer);
        return finish(null);
      }

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();

      img.onload = () => {
        const baseSize = img.naturalWidth || img.width || 250;
        const canvas = document.createElement("canvas");
        canvas.width = baseSize * scale;
        canvas.height = baseSize * scale;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const finalize = () => {
          clearTimeout(safetyTimer);
          finish(canvas.toDataURL("image/png"));
        };

        if (!logoUrl) return finalize();

        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";
        logoImg.onload = () => {
          const logoSize = canvas.width * logoRatio;
          const cx = (canvas.width - logoSize) / 2;
          const cy = (canvas.height - logoSize) / 2;
          const pad = logoSize * 0.16;
          const bx = cx - pad,
            by = cy - pad,
            bw = logoSize + pad * 2,
            bh = logoSize + pad * 2;
          const r = logoSize * 0.15;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(bx + r, by);
          ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
          ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
          ctx.arcTo(bx, by + bh, bx, by, r);
          ctx.arcTo(bx, by, bx + bw, by, r);
          ctx.closePath();
          ctx.fill();

          ctx.lineWidth = canvas.width * 0.006;
          ctx.strokeStyle = "#D97706";
          ctx.stroke();

          ctx.drawImage(logoImg, cx, cy, logoSize, logoSize);
          finalize();
        };
        logoImg.onerror = finalize;
        logoImg.src = logoUrl;
      };
      img.onerror = () => finish(null);
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
    });
  };

  // 2. Generador PDF con alineación matemática corregida
  const descargarPDFOficial = async (estudiante, hashReal) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "letter", // 279.4 x 215.9 mm
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 10;
      const innerMargin = margin + 3; // 13mm
      const usableWidth = pageWidth - (innerMargin * 2);

      const logoData = await cargarLogoBase64();

      // Fondo
      const fondoWatermark = await generarFondoMarcasDeAgua(logoData, estudiante.ci, pageWidth, pageHeight);
      if (fondoWatermark) {
        doc.addImage(fondoWatermark, "JPEG", 0, 0, pageWidth, pageHeight);
      } else {
        doc.setFillColor(...INK.paper);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      }

      // Marcos
      doc.setDrawColor(...INK.navy);
      doc.setLineWidth(1.2);
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

      doc.setDrawColor(...INK.gold);
      doc.setLineWidth(0.6);
      doc.rect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2);

      const cs = 4;
      const corners = [
        [innerMargin + 1, innerMargin + 1],
        [pageWidth - innerMargin - 1 - cs, innerMargin + 1],
        [innerMargin + 1, pageHeight - innerMargin - 1 - cs],
        [pageWidth - innerMargin - 1 - cs, pageHeight - innerMargin - 1 - cs],
      ];
      doc.setFillColor(...INK.gold);
      corners.forEach(([cx, cy]) => doc.rect(cx, cy, cs, cs, "F"));

      // Logo bajado (aumentado el margen superior inicial)
      let currentY = innerMargin + 20; // Antes estaba en +6, ahora baja 4mm más
      const logoW = 30;
      const logoH = 30;

      if (logoData) {
        doc.addImage(logoData, "PNG", (pageWidth - logoW) / 2, currentY, logoW, logoH);
        currentY += logoH + 20; // Espacio ampliado entre el logo y el título principal
      } else {
        currentY += 10;
      }

      // Encabezados Centrados
      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...INK.navy);
      doc.text("CERTIFICADO DE CONCLUSIÓN DE ESTUDIOS", pageWidth / 2, currentY, { align: "center" });

      currentY += 5.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...INK.gold);

      // Cuerpo
      currentY += 11;
      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK.slate);
      doc.text("Por cuanto se hace constar oficialmente que:", pageWidth / 2, currentY, { align: "center" });

      currentY += 7;
      doc.setFont("times", "bold");
      doc.setFontSize(21);
      doc.setTextColor(...INK.navy);
      doc.text(estudiante.nombres.toUpperCase(), pageWidth / 2, currentY, { align: "center" });

      currentY += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...INK.slate);
      doc.text(`CÉDULA DE IDENTIDAD N°: ${estudiante.ci}`, pageWidth / 2, currentY, { align: "center" });

      currentY += 8.5;
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK.ink);
      doc.text("Ha cumplido satisfactoriamente con el plan de estudios del curso:", pageWidth / 2, currentY, { align: "center" });

      currentY += 7;
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...INK.gold);
      doc.text(`"${estudiante.programa.toUpperCase()}"`, pageWidth / 2, currentY, { align: "center" });

      currentY += 7.5;
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.setTextColor(...INK.slate);
      const lineasTexto = doc.splitTextToSize(textoCertificado, usableWidth - 24);
      doc.text(lineasTexto, pageWidth / 2, currentY, { align: "center", leadingY: 3.8 });

      // Pie de página ajustado dentro del marco
      const footerY = pageHeight - 48;

      // QR
      const qrSize = 22;
      const qrX = innerMargin + 5;
      const qrDataUrl = await generarQRDataURL(logoData);

      if (qrDataUrl) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...INK.gold);
        doc.setLineWidth(0.3);
        doc.roundedRect(qrX - 1, footerY - 1, qrSize + 2, qrSize + 2, 1, 1, "FD");
        doc.addImage(qrDataUrl, "PNG", qrX, footerY, qrSize, qrSize);
      }

      // Hash
      const infoX = qrX + qrSize + 6;
      doc.setFont("courier", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...INK.emerald);
      doc.text("VERIFICADO EN BLOCKCHAIN", infoX, footerY + 2);

     

      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(infoX, footerY + 7.5, 74, 11, 1, 1, "FD");

      

      doc.setFont("courier", "normal");
      doc.setFontSize(4.6);
      doc.setTextColor(...INK.slate);
      const hashCortado = doc.splitTextToSize(hashReal || "PENDIENTE", 70);
      doc.text(hashCortado, infoX + 2, footerY + 13.5);

      // Firmas
      const lineWidth = 38;
      const gap = 8;
      const rightMarginLimit = pageWidth - innerMargin - 5;

      const line2X = rightMarginLimit - lineWidth;
      const line1X = line2X - gap - lineWidth;
      const lineY = footerY + 13;

      doc.setDrawColor(...INK.navy);
      doc.setLineWidth(0.5);

      // Firma 1
      doc.line(line1X, lineY, line1X + lineWidth, lineY);
      doc.setFont("times", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...INK.navy);
      doc.text("DIRECCIÓN ACADÉMICA", line1X + (lineWidth / 2), lineY + 3.5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...INK.slate);
      doc.text("Sello y Firma Oficial", line1X + (lineWidth / 2), lineY + 6.5, { align: "center" });

      // Firma 2
      doc.line(line2X, lineY, line2X + lineWidth, lineY);
      doc.setFont("times", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...INK.navy);
      doc.text("SECRETARÍA GENERAL", line2X + (lineWidth / 2), lineY + 3.5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...INK.slate);
      doc.text("Firma de Conformidad", line2X + (lineWidth / 2), lineY + 6.5, { align: "center" });

      doc.save(`Certificado_Official_${estudiante.ci}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      notify("Error generando PDF del certificado", "error");
    }
  };

  const procesarEmisionBoletin = async (estudiante) => {
    try {
      setEmittingBlockchain(true);

      const hashCalculado = await generarHashInscripcionJS(estudiante, textoCertificado);

      const payload = {
        postulanteId: estudiante.postulanteId,
        nombreCompleto: estudiante.nombres,
        ci: estudiante.ci,
        facultad: estudiante.facultad,
        curso: estudiante.programa,
        textoCertificado: textoCertificado,
      };

      const resBlockchain = await blockchainService.certificar(payload);

      const hashFinal = resBlockchain.hashBoletin || hashCalculado;
      const yaExistia = Boolean(resBlockchain.yaExistia);

      setEstudiantes((prev) =>
        prev.map((e) =>
          e.id === estudiante.id
            ? { ...e, hashDiploma: hashFinal, emitidoBlockchain: true }
            : e
        )
      );

      setPendingPrint(() => () => descargarPDFOficial(estudiante, hashFinal));

      setModalInfo({
        estudiante,
        hashReal: hashFinal,
        yaExistia,
        message: yaExistia
          ? "Este estudiante ya cuenta con un certificado inmutabilizado en Blockchain con este mismo Hash SHA-256."
          : "Se ha registrado el certificado de conclusión de estudios en la Blockchain exitosamente.",
      });

    } catch (err) {
      console.error("Error en la emisión:", err);
      notify("Ocurrió un error al procesar con la red Blockchain", "error");
    } finally {
      setEmittingBlockchain(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-orange-50/40 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const qrContenidoTexto = `INSTITUCION: SUMO\nESTUDIANTE: ${estudianteActual.nombres}\nC.I.: ${estudianteActual.ci}\nFACULTAD: ${estudianteActual.facultad}\nPROGRAMA: ${estudianteActual.programa}\nHASH: ${estudianteActual.hashDiploma}`;

  return (
    <div className="relative flex w-full min-h-[85vh] flex-col gap-4 p-3 sm:p-6 border border-orange-200/70 rounded-3xl bg-orange-50/40 font-sans">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-lg ${
            toast.tone === "error" ? "bg-red-600" : "bg-[#0B1120]"
          }`}
        >
          {toast.tone === "error" ? <X size={16} /> : <Check size={16} />}
          {toast.message}
        </div>
      )}

      <BlockchainEmisionModal
        isOpen={!!modalInfo}
        onClose={() => setModalInfo(null)}
        modalData={modalInfo}
        onConfirmPrint={() => pendingPrint && pendingPrint()}
      />

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1120] text-orange-400 shadow-md">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Certificados de Conclusión de Estudios
            </h2>
            <p className="text-xs font-semibold text-orange-700/80 mt-0.5">
              EMISIÓN BLOCKCHAIN Y DESCARGA OFICIAL EN PDF
            </p>
          </div>
        </div>

        <button
          onClick={() => procesarEmisionBoletin(estudianteActual)}
          disabled={emittingBlockchain}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50"
        >
          {emittingBlockchain ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <ShieldCheck size={18} />
          )}
          {emittingBlockchain ? "Emitiendo..." : "Emitir con Smart Contract y Exportar PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-orange-200/70 bg-white/80 p-3">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={filter.estudiante}
            onChange={(e) => setFilter((prev) => ({ ...prev, estudiante: e.target.value }))}
            placeholder="Buscar por Estudiante o C.I...."
            className="ml-2 w-full bg-transparent text-xs font-semibold text-slate-700 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="hidden lg:flex flex-col gap-2 lg:col-span-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
            Estudiantes ({filteredEstudiantes.length})
          </h3>

          <div className="flex flex-col gap-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredEstudiantes.map((item) => {
              const active = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    active
                      ? "border-orange-400 bg-orange-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2 uppercase">
                    <p className="font-black text-xs text-slate-900 truncate">{item.nombres}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">C.I. {item.ci}</p>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.emitidoBlockchain ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="rounded-2xl border border-slate-300 bg-white p-5 sm:p-8 shadow-md">
            
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Edit3 size={15} className="text-orange-500" />
                Texto del Certificado (Editable antes de emitir):
              </label>
              <textarea
                rows={3}
                value={textoCertificado}
                onChange={(e) => setTextoCertificado(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="border-4 border-double border-[#0B1120] p-6 sm:p-10 rounded-xl bg-white relative text-center">
              <div className="flex justify-center mb-3">
                <img src="/logo_sumo.png" alt="Logo Sumo" className="h-14 object-contain" />
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase">
                CERTIFICADO DE CONCLUSIÓN DE ESTUDIOS
              </h1>

              <p className="text-[11px] font-bold text-slate-500 my-4">
                Por cuanto: <span className="text-slate-900 font-black text-lg block uppercase">{estudianteActual.nombres}</span>
                <span className="text-xs text-slate-600 block mt-0.5">C.I. N° {estudianteActual.ci}</span>
              </p>

              <p className="text-xs font-semibold text-slate-700">
                Ha cumplido con los requisitos del programa de:
              </p>

              <h2 className="text-base sm:text-lg font-black text-orange-600 uppercase my-2">
                "{estudianteActual.programa}"
              </h2>

              <p className="text-xs text-slate-700 max-w-lg mx-auto italic my-4 border-y border-slate-100 py-3 break-words max-h-32 overflow-y-auto">
  {textoCertificado}
</p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
                    <QRCodeSVG
                      id="certificate-qr-svg"
                      value={qrContenidoTexto}
                      size={60}
                      level="H"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={14} />
                      {estudianteActual.emitidoBlockchain ? "Certificado Registrado" : "Firma Criptográfica Lista"}
                    </p>
                    <p className="text-[9px] font-mono text-slate-600 truncate max-w-[220px]">
                      Hash: {estudianteActual.hashDiploma}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {estudianteActual.totalHoras} 
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};