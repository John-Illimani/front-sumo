import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LOGO_URL = '/logo_sumo.jpg';

// Helper para cargar imagen como Base64 / Image element
async function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

// Dibuja el membrete y la marca de agua central
async function aplicarMarcaDeAguaYEncabezado(doc, tituloReporte) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const img = await loadImage(LOGO_URL);

  // --- MARCA DE AGUA (Centro de página con opacidad) ---
  if (img) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    const logoW = 100;
    const logoH = 100;
    doc.addImage(img, 'JPEG', (pageWidth - logoW) / 2, (pageHeight - logoH) / 2, logoW, logoH);
    doc.restoreGraphicsState();
  }

  // --- ENCABEZADO INSTITUCIONAL ---
  // Barra superior oscura
  doc.setFillColor(11, 17, 32); // #0B1120
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Línea naranja decorativa
  doc.setFillColor(249, 115, 22); // #F97316
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Logo pequeño en encabezado
  if (img) {
    doc.addImage(img, 'JPEG', 14, 5, 18, 18);
  }

  // Textos del encabezado
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CONSULTORA DE EXCELENCIA ACADÉMICA SUMO', 36, 12);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(251, 191, 36); // #FBBF24 (Ámbar)
  doc.text('SUCURSAL LA PAZ · SISTEMA DE GESTIÓN ACADÉMICA', 36, 17);

  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(7);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-BO')} - ${new Date().toLocaleTimeString('es-BO')}`, 36, 22);

  // Título del reporte
  doc.setTextColor(11, 17, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(tituloReporte, 14, 40);
}

// Pie de página institucional
function aplicarPieDePagina(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento oficial emitido por Consultora SUMO La Paz', 14, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

// ==========================================
// 1. REPORTE GENERAL DE ESTUDIANTES (PDF)
// ==========================================
export async function generarPDFGeneral(lista) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  await aplicarMarcaDeAguaYEncabezado(doc, 'REPORTE GENERAL DE ESTUDIANTES');

  const rows = lista.map((s) => {
    const faltante = Number(s.montoFaltante || 0);
    const estado = faltante <= 0 ? 'Al día' : (s.fechaProximo && new Date(s.fechaProximo) < new Date() ? 'Atrasado' : 'Pendiente');

    return [
      `#${s.id ?? '—'}`,
      s.nombres || '—',
      s.ci || '—',
      s.celular || '—',
      s.area || '—',
      `Bs. ${Number(s.montoPago || 0).toFixed(2)}`,
      `Bs. ${Number(s.montoFaltante || 0).toFixed(2)}`,
      estado,
    ];
  });

  autoTable(doc, {
    startY: 46,
    head: [['ID', 'Estudiante', 'C.I.', 'Celular', 'Área', 'Abonado', 'Deuda', 'Estado']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 17, 32],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const val = data.cell.raw;
        if (val === 'Al día') data.cell.styles.textColor = [5, 150, 105];
        else if (val === 'Atrasado') data.cell.styles.textColor = [220, 38, 38];
        else data.cell.styles.textColor = [217, 119, 6];
      }
    },
    margin: { left: 14, right: 14 },
  });

  aplicarPieDePagina(doc);
  doc.save(`Reporte_General_Estudiantes_SUMO_${Date.now()}.pdf`);
}

// ==========================================
// 2. FICHA INDIVIDUAL DE ESTUDIANTE (PDF)
// ==========================================
export async function generarPDFIndividual(estudiante) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  await aplicarMarcaDeAguaYEncabezado(doc, 'FICHA DE REGISTRO ESTUDIANTIL');

  // Tarjeta de Datos Personales
  autoTable(doc, {
    startY: 46,
    head: [[{ content: 'DATOS PERSONALES Y ASISTENCIA', colSpan: 2 }]],
    body: [
      ['ID Estudiante:', `#${estudiante.id ?? 'NUEVO'}`],
      ['Nombre Completo:', estudiante.nombres || '—'],
      ['Carnet de Identidad:', estudiante.ci || '—'],
      ['Número de Celular:', estudiante.celular || '—'],
      ['Área Asignada:', estudiante.area || '—'],
      ['Horario:', `${estudiante.horaIngreso || '—'} a ${estudiante.horaSalida || '—'}`],
      ['Observaciones:', estudiante.detalle || 'S/N'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [11, 17, 32], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 116, 139] },
      1: { textColor: [15, 23, 42] },
    },
    margin: { left: 14, right: 14 },
  });

  // Tarjeta Financiera
  const finalY = doc.lastAutoTable.finalY || 46;
  autoTable(doc, {
    startY: finalY + 8,
    head: [[{ content: 'ESTADO FINANCIERO', colSpan: 2 }]],
    body: [
      ['Total Abonado:', `Bs. ${Number(estudiante.montoPago || 0).toFixed(2)}`],
      ['Saldo Faltante / Deuda:', `Bs. ${Number(estudiante.montoFaltante || 0).toFixed(2)}`],
      ['Fecha Último Pago:', estudiante.fechaPago || '—'],
      ['Próximo Vencimiento:', estudiante.fechaProximo || '—'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 116, 139] },
      1: { textColor: [15, 23, 42], fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Historial de Pagos (si existe)
  if (estudiante.historial && estudiante.historial.length > 0) {
    const finalYFinanzas = doc.lastAutoTable.finalY;
    autoTable(doc, {
      startY: finalYFinanzas + 8,
      head: [['Fecha de Abono', 'Monto Pagado']],
      body: estudiante.historial.map((h) => [h.fecha, `Bs. ${Number(h.monto).toFixed(2)}`]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });
  }

  aplicarPieDePagina(doc);
  doc.save(`Ficha_Estudiante_${estudiante.ci || estudiante.id || 'registro'}.pdf`);
}