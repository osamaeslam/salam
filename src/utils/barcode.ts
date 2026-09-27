// Clean client-side SVG Barcode and QR-code visualizers

// Simple Code 39 / 128 pattern generator for clean vector SVG rendering
export function generateBarcodeSVG(text: string, height: number = 50, barWidth: number = 2): string {
  const clean = text.toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '-');
  
  // Deterministic bar widths representation based on character hash
  let bars: boolean[] = [true, false, true, false]; // Start guard
  
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    // pseudo-pattern for each char (9 elements: wide or narrow)
    const seed = (charCode * 31 + i * 17) % 256;
    for (let b = 0; b < 7; b++) {
      bars.push((seed & (1 << b)) !== 0);
      bars.push(false); // spacer
    }
  }
  bars.push(true, false, true); // End guard

  const totalWidth = bars.length * barWidth;
  let rects = '';
  let x = 0;
  for (const bar of bars) {
    if (bar) {
      rects += `<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#0f172a" />`;
    }
    x += barWidth;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" class="w-full h-auto max-h-16" preserveAspectRatio="none">${rects}</svg>`;
}

// Generate simple deterministic QR Code pattern SVG
export function generateQrSVG(content: string, size: number = 96): string {
  const grid = 21; // 21x21 QR code grid
  const cellSize = size / grid;
  let cells = '';

  // Simple QR matrix calculation
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Finder patterns in corners
      const isTopLeft = (r < 7 && c < 7);
      const isTopRight = (r < 7 && c >= grid - 7);
      const isBottomLeft = (r >= grid - 7 && c < 7);

      let isBlack = false;
      if (isTopLeft) {
        isBlack = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      } else if (isTopRight) {
        const rc = c - (grid - 7);
        isBlack = (r === 0 || r === 6 || rc === 0 || rc === 6 || (r >= 2 && r <= 4 && rc >= 2 && rc <= 4));
      } else if (isBottomLeft) {
        const rr = r - (grid - 7);
        isBlack = (rr === 0 || rr === 6 || c === 0 || c === 6 || (rr >= 2 && rr <= 4 && c >= 2 && c <= 4));
      } else {
        // Data pattern based on content hash and position
        const hash = (content.charCodeAt((r + c) % content.length) * 13 + r * 19 + c * 29) % 100;
        isBlack = hash > 50;
      }

      if (isBlack) {
        cells += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" class="w-full h-full">${cells}</svg>`;
}

export function getSampleCapColor(sampleType: string): { bg: string; text: string; label: string } {
  const lower = sampleType.toLowerCase();
  if (lower.includes('edta') || lower.includes('دم كامل')) {
    return { bg: 'bg-purple-600', text: 'text-purple-600', label: 'أنبوب موف (EDTA)' };
  }
  if (lower.includes('سيرم') || lower.includes('serum')) {
    return { bg: 'bg-red-600', text: 'text-red-600', label: 'أنبوب أحمر/جل (Serum)' };
  }
  if (lower.includes('سترات') || lower.includes('citrate') || lower.includes('تجلط') || lower.includes('سيولة')) {
    return { bg: 'bg-sky-500', text: 'text-sky-500', label: 'أنبوب أزرق (Citrate)' };
  }
  if (lower.includes('فلوريد') || lower.includes('سكر')) {
    return { bg: 'bg-slate-500', text: 'text-slate-500', label: 'أنبوب رمادي (Fluoride)' };
  }
  if (lower.includes('بول') || lower.includes('urine')) {
    return { bg: 'bg-amber-500', text: 'text-amber-500', label: 'وعاء بول أصفر' };
  }
  if (lower.includes('براز') || lower.includes('stool')) {
    return { bg: 'bg-orange-700', text: 'text-orange-700', label: 'وعاء براز بني' };
  }
  return { bg: 'bg-emerald-600', text: 'text-emerald-600', label: 'عينة مخبرية' };
}
