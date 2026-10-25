import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { APP_NAME, HERO_HEADLINE } from "@/lib/config";

export interface GeneratePdfOptions {
  analysis: ValidatedAnalysis;
  analyzedSnapshotText?: string;
  sourceNote?: string;
  conversationText?: string;
}

interface PdfLine {
  text: string;
  isHeader?: boolean;
  isTitle?: boolean;
}

/**
 * Escapes characters for PDF literal string format (WinAnsi / ASCII).
 * Escapes backslashes, opening and closing parentheses.
 * Replaces non-printable ASCII with space.
 */
function escapePdfText(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const code = input.charCodeAt(i);
    if (char === "\\") {
      out += "\\\\";
    } else if (char === "(") {
      out += "\\(";
    } else if (char === ")") {
      out += "\\)";
    } else if (code >= 32 && code <= 126) {
      out += char;
    } else if (char === "\t") {
      out += "    ";
    } else if (char === "—" || char === "–") {
      out += "-";
    } else if (char === "“" || char === "”") {
      out += '"';
    } else if (char === "‘" || char === "’") {
      out += "'";
    } else if (char === "•") {
      out += "*";
    } else {
      out += " ";
    }
  }
  return out;
}

/**
 * Wraps a line of text at word boundaries to fit within maxChars (default 85).
 */
function wrapLine(text: string, maxChars: number = 85): string[] {
  if (text.length <= maxChars) return [text];

  const words = text.split(" ");
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += " " + word;
    } else {
      wrapped.push(current);
      current = word;
    }
  }

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}

/**
 * Builds a valid raw %PDF-1.4 Uint8Array binary for the review summary.
 * Uses standard PDF Type 1 fonts (Helvetica, Helvetica-Bold, Helvetica-Oblique)
 * without any external dependencies.
 */
export function generateReviewPdfBytes(options: GeneratePdfOptions): Uint8Array {
  const { analysis, analyzedSnapshotText = "", sourceNote, conversationText } = options;

  const rawSummary = buildReviewSummary(analysis, analyzedSnapshotText, {
    sourceNote,
    conversationText,
  });

  const rawLines = rawSummary.split("\n");
  const pdfLines: PdfLine[] = [];

  // Title block
  pdfLines.push({ text: `${APP_NAME} Review Summary`, isTitle: true });
  pdfLines.push({ text: HERO_HEADLINE, isHeader: false });
  pdfLines.push({
    text: `Date of review: ${new Date().toISOString().split("T")[0]}`,
    isHeader: false,
  });
  pdfLines.push({ text: "", isHeader: false });

  // Process raw summary lines with word wrapping
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      pdfLines.push({ text: "", isHeader: false });
      continue;
    }

    const isSectionHeader = trimmed.startsWith("---") || trimmed.startsWith("OfferClara Review Summary");
    if (isSectionHeader) {
      pdfLines.push({ text: trimmed, isHeader: true });
    } else {
      const wrapped = wrapLine(raw, 88);
      for (const w of wrapped) {
        pdfLines.push({ text: w, isHeader: false });
      }
    }
  }

  // Page geometry (A4 in points: 595.28 x 841.89)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 40;
  const marginTop = 50;
  const marginBottom = 50;
  const usableHeight = pageHeight - marginTop - marginBottom;

  // Split lines into pages based on line heights
  const pages: PdfLine[][] = [];
  let currentPage: PdfLine[] = [];
  let currentYUsed = 0;

  for (const line of pdfLines) {
    const lineHeight = line.isTitle ? 24 : line.isHeader ? 18 : 13;
    if (currentYUsed + lineHeight > usableHeight && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentYUsed = 0;
    }
    currentPage.push(line);
    currentYUsed += lineHeight;
  }
  if (currentPage.length > 0 || pages.length === 0) {
    pages.push(currentPage);
  }

  // Construct PDF objects
  const objects: string[] = [];
  const addObj = (content: string): number => {
    objects.push(content);
    return objects.length; // 1-based object number
  };

  // Placeholders for Catalog (1) and Pages (2)
  addObj("");
  addObj("");

  const pageObjIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const pageItems = pages[p];
    let streamText = "BT\n";
    let curY = pageHeight - marginTop;

    for (const item of pageItems) {
      const isTitle = item.isTitle;
      const isHeader = item.isHeader;
      const font = isTitle ? "/F2 15 Tf" : isHeader ? "/F2 11 Tf" : "/F1 9 Tf";
      const escaped = escapePdfText(item.text);

      streamText += `${font}\n`;
      streamText += `1 0 0 1 ${marginX} ${curY.toFixed(2)} Tm\n`;
      streamText += `(${escaped}) Tj\n`;

      curY -= isTitle ? 24 : isHeader ? 18 : 13;
    }

    // Page footer
    const footerText = escapePdfText(
      `Page ${p + 1} of ${pages.length} -- ${APP_NAME}: ${HERO_HEADLINE}`
    );
    streamText += "/F3 8 Tf\n";
    streamText += `1 0 0 1 ${marginX} 30 Tm\n`;
    streamText += `(${footerText}) Tj\n`;
    streamText += "ET\n";

    // Encode stream content as latin1 bytes
    const streamBytes = new TextEncoder().encode(streamText);
    const streamObj = `<< /Length ${streamBytes.length} >>\nstream\n${streamText}endstream`;
    const streamObjId = addObj(streamObj);

    const pageObj = `<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}]\n  /Contents ${streamObjId} 0 R\n  /Resources <<\n    /Font <<\n      /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n      /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n      /F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\n    >>\n  >>\n>>`;
    const pageObjId = addObj(pageObj);
    pageObjIds.push(pageObjId);
  }

  // Populate Catalog and Pages objects
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>`;

  // Assemble full PDF with offsets and cross-reference table
  let pdfString = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(new TextEncoder().encode(pdfString).length);
    pdfString += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startXref = new TextEncoder().encode(pdfString).length;
  pdfString += `xref\n0 ${objects.length + 1}\n`;
  pdfString += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdfString += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return new TextEncoder().encode(pdfString);
}

/**
 * Builds a valid PDF Blob for browser download or Web Share API file attachment.
 */
export function generateReviewPdfBlob(options: GeneratePdfOptions): Blob {
  const bytes = generateReviewPdfBytes(options);
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}
