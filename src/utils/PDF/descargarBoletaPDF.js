import jsPDF from "jspdf";

const cargarLogoBase64 = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = "/logo_sumo.jpg";
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => resolve(null);
  });
};

export const descargarBoletaPDF = async (datos, hashReal, qrDataUrl = null) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 15;

  // Marco de Boleta
  doc.setDrawColor(11, 17, 32);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, pageWidth - margin * 2, 245);

  // Logo Oficial
  const logo = await cargarLogoBase64();
  if (logo) {
    doc.addImage(logo, "JPEG", pageWidth / 2 - 15, currentY + 4, 30, 14);
    currentY += 22;
  } else {
    currentY += 10;
  }

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(11, 17, 32);
  doc.text("BOLETA OFICIAL DE INSCRIPCIÓN", pageWidth / 2, currentY, { align: "center" });

  currentY += 6;
  doc.setFontSize(9);
  doc.setTextColor(217, 119, 6);
  doc.text(`CÓDIGO: ${datos.codigoInscripcion || datos.inscripcionId}`, pageWidth / 2, currentY, { align: "center" });

  // Detalle del Estudiante
  currentY += 15;
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Estudiante: ${datos.nombreCompleto.toUpperCase()}`, margin + 10, currentY);

  currentY += 7;
  doc.text(`Cédula de Identidad: ${datos.ci}`, margin + 10, currentY);

  currentY += 7;
  doc.text(`Facultad: ${datos.facultad}`, margin + 10, currentY);

  currentY += 7;
  doc.text(`Programa / Curso: ${datos.curso}`, margin + 10, currentY);

  // Pie con Verificación Blockchain y QR
  const footerY = 220;
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", margin + 10, footerY, 25, 25);
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("CERTIFICACIÓN REGISTRADA EN BLOCKCHAIN", margin + 40, footerY + 6);
  doc.setFont("courier", "normal");
  doc.text(`HASH SHA-256: ${hashReal}`, margin + 40, footerY + 12);
  doc.text(`FECHA EMISIÓN: ${new Date().toLocaleDateString()}`, margin + 40, footerY + 18);

  doc.save(`boleta_inscripcion_${datos.ci}.pdf`);
};