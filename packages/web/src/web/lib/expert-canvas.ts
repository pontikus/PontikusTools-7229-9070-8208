import { beginCanvas, drawFrame, cover, loadImage, NAVY, CREAM } from "./canvas-utils";

export type ExpertBase = { style: string; removeFrame: boolean; name: string };
export type MediaData = ExpertBase & {
  role: string;
  region: string;
  bio: string;
  services: string[];
  credentials: string[];
  contact: string;
  photo: string;
};
export type RateRow = { service: string; unit: string; price: string };
export type RateData = ExpertBase & {
  currency: string;
  rows: RateRow[];
  terms: string;
  valid: string;
  contact: string;
};
export type Credential = { title: string; issuer: string; year: string };
export type CredentialData = ExpertBase & {
  role: string;
  credentials: Credential[];
  photo: string;
};
export type Location = { location: string; from: string; until: string; note: string };
export type AvailabilityData = ExpertBase & {
  season: string;
  locations: Location[];
  contact: string;
  format: string;
};

// Measure and fit text to a reserved rectangle. Shrink until ALL wrapped lines fit.
// Newlines and unbroken words are included. Canvas clipping is the final guard.
export function lines(c: CanvasRenderingContext2D, text: string, width: number) {
  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const char of paragraph) {
      if (c.measureText(line + char).width > width && line) {
        const space = line.lastIndexOf(" ");
        if (space > 0) {
          result.push(line.slice(0, space));
          line = line.slice(space + 1) + char;
        } else {
          result.push(line);
          line = char;
        }
      } else line += char;
    }
    result.push(line);
  }
  return result;
}
function box(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  size = 36,
  family = "Archivo",
) {
  // Treat pasted runs of whitespace/newlines as a single space in constrained exports.
  // This prevents a 500-character bio made of line breaks from exhausting its panel.
  text = text.replace(/\s+/g, " ").trim();
  let font = size;
  let output: string[] = [];
  while (font >= 8) {
    c.font = `${font}px ${family}`;
    output = lines(c, text, w);
    if (output.length * font * 1.28 <= h) break;
    font -= 1;
  }
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.font = `${font}px ${family}`;
  output.forEach((line, i) => c.fillText(line, x, y + font + i * font * 1.28));
  c.restore();
}
function palette(style: string) {
  return {
    background: style === "navy" ? NAVY : style === "minimal" ? "#fff" : CREAM,
    ink: style === "navy" ? CREAM : NAVY,
    accent: style === "navy" ? "#dfc68b" : "#79602a",
    line: style === "navy" ? "#7c827f" : "#cfcabb",
  };
}
async function start(data: ExpertBase, w = 1748, h = 2480) {
  const canvas = document.createElement("canvas");
  const p = palette(data.style);
  const c = await beginCanvas(canvas, w, h, p.background);
  return { canvas, c, p };
}
function label(c: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  c.fillStyle = color;
  box(c, text, x, y, 1500, 45, 24, '"IBM Plex Mono"');
}
function rule(c: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + w, y);
  c.stroke();
}

export async function renderMedia(data: MediaData) {
  const { canvas, c, p } = await start(data);
  label(c, "PONTIKUS / MEDIA KIT", 100, 75, p.accent);
  const headW = data.photo ? 1100 : 1548;
  c.fillStyle = p.ink;
  box(c, data.name, 100, 160, headW, 190, 86, "Fraunces");
  box(c, data.role, 100, 370, headW, 100, 43);
  label(c, data.region.toUpperCase(), 100, 500, p.accent);
  if (data.photo) cover(c, await loadImage(data.photo), 1330, 170, 318, 340);
  rule(c, 100, 590, 1548, p.line);
  label(c, "ABOUT", 100, 635, p.accent);
  c.fillStyle = p.ink;
  box(c, data.bio, 100, 700, 1548, 460, 40);
  label(c, "SERVICES", 100, 1235, p.accent);
  label(c, "CREDENTIALS / AS PROVIDED", 970, 1235, p.accent);
  data.services.forEach((item, i) => {
    c.fillStyle = p.ink;
    box(c, `${String(i + 1).padStart(2, "0")}  ${item}`, 100, 1310 + i * 105, 770, 90, 33);
    rule(c, 100, 1404 + i * 105, 770, p.line);
  });
  data.credentials.forEach((item, i) => {
    c.fillStyle = p.ink;
    box(c, item, 970, 1310 + i * 205, 678, 180, 34);
    rule(c, 970, 1500 + i * 205, 678, p.line);
  });
  rule(c, 100, 2080, 1548, p.line);
  label(c, "GET IN TOUCH", 100, 2130, p.accent);
  c.fillStyle = p.ink;
  box(c, data.contact, 100, 2190, 1548, 135, 34);
  await drawFrame(c, 1748, 2480, data.removeFrame);
  return [canvas];
}

// Variable-height service rows paginate before reaching the reserved terms panel.
export async function renderRate(data: RateData) {
  const measure = document.createElement("canvas").getContext("2d")!;
  await beginCanvas(measure.canvas, 1748, 2480);
  measure.font = "34px Archivo";
  const rows = data.rows.map((row) => ({
    row,
    height: Math.min(
      185,
      Math.max(
        110,
        Math.max(lines(measure, row.service, 810).length, lines(measure, row.unit, 310).length) *
          44 +
          36,
      ),
    ),
  }));
  const chunks: (typeof rows)[] = [[]];
  let used = 0;
  for (const row of rows) {
    if (used + row.height > 1110 && chunks[chunks.length - 1].length) {
      chunks.push([]);
      used = 0;
    }
    chunks[chunks.length - 1].push(row);
    used += row.height;
  }
  return Promise.all(
    chunks.map(async (chunk, index) => {
      const { canvas, c, p } = await start(data);
      label(c, `PONTIKUS / RATE CARD / ${index + 1} OF ${chunks.length}`, 100, 75, p.accent);
      c.fillStyle = p.ink;
      box(c, data.name, 100, 165, 1548, 180, 84, "Fraunces");
      label(
        c,
        `PRICES IN ${data.currency} · VALID UNTIL ${data.valid || "[DATE]"}`,
        100,
        405,
        p.accent,
      );
      label(c, "SERVICE", 100, 525, p.accent);
      label(c, "UNIT", 960, 525, p.accent);
      label(c, "PRICE", 1340, 525, p.accent);
      rule(c, 100, 585, 1548, p.line);
      let y = 610;
      chunk.forEach(({ row, height }) => {
        c.fillStyle = p.ink;
        box(c, row.service, 100, y, 810, height - 25, 34);
        box(c, row.unit, 960, y, 310, height - 25, 34);
        box(c, `${data.currency} ${row.price}`, 1340, y, 308, height - 25, 34);
        rule(c, 100, y + height - 10, 1548, p.line);
        y += height;
      });
      label(c, "TERMS", 100, 1810, p.accent);
      c.fillStyle = p.ink;
      box(c, data.terms, 100, 1875, 1548, 285, 34);
      label(c, "CONTACT", 100, 2200, p.accent);
      c.fillStyle = p.ink;
      box(c, data.contact, 100, 2260, 1548, 100, 30);
      await drawFrame(c, 1748, 2480, data.removeFrame);
      return canvas;
    }),
  );
}

export async function renderCredential(data: CredentialData) {
  const w = 1016,
    h = 638;
  const result = [];
  for (const side of ["front", "back"]) {
    const { canvas, c, p } = await start(data, w, h);
    c.fillStyle = p.accent;
    box(
      c,
      `PONTIKUS / PERSONAL SUMMARY / ${side.toUpperCase()}`,
      45,
      28,
      926,
      38,
      20,
      '"IBM Plex Mono"',
    );
    if (side === "front") {
      c.fillStyle = p.ink;
      box(c, data.name, 45, 105, data.photo ? 655 : 926, 140, 57, "Fraunces");
      box(c, data.role, 45, 263, data.photo ? 655 : 926, 110, 32);
      if (data.photo) cover(c, await loadImage(data.photo), 750, 110, 220, 250);
      rule(c, 45, 413, 926, p.line);
      c.fillStyle = p.ink;
      box(c, "Pontikus verification: not yet verified", 45, 448, 926, 68, 30);
      box(c, "Personal summary only. Not an official certificate.", 45, 532, 926, 38, 20);
    } else {
      data.credentials.forEach((item, i) => {
        const y = 90 + i * 94;
        c.fillStyle = p.ink;
        box(c, item.title, 45, y, 560, 82, 28);
        box(c, item.issuer, 640, y, 240, 82, 23);
        box(c, item.year, 895, y, 76, 82, 22, '"IBM Plex Mono"');
        rule(c, 45, y + 87, 926, p.line);
      });
    }
    await drawFrame(c, w, h, data.removeFrame);
    result.push(canvas);
  }
  return result;
}

export async function renderAvailability(data: AvailabilityData) {
  const social = data.format === "social";
  const w = social ? 1080 : 1748,
    h = social ? 1350 : 2480;
  const { canvas, c, p } = await start(data, w, h);
  const m = social ? 55 : 100,
    inner = w - m * 2;
  const header = social ? 305 : 550,
    rowH = social ? 128 : 245;
  c.fillStyle = p.accent;
  box(c, "PONTIKUS / AVAILABILITY", m, 45, inner, 45, social ? 20 : 26, '"IBM Plex Mono"');
  c.fillStyle = p.ink;
  box(c, data.name, m, 105, inner, social ? 108 : 200, social ? 55 : 86, "Fraunces");
  c.fillStyle = p.accent;
  box(
    c,
    `${data.season} · Available on the coast`,
    m,
    social ? 230 : 350,
    inner,
    social ? 58 : 100,
    social ? 32 : 53,
    "Fraunces",
  );
  data.locations.forEach((item, i) => {
    const y = header + i * rowH;
    c.fillStyle = p.ink;
    box(c, item.location, m, y, inner * 0.49, rowH - 24, social ? 27 : 43, "Fraunces");
    c.fillStyle = p.accent;
    box(
      c,
      `${item.from || "[START]"} — ${item.until || "[END]"}`,
      m + inner * 0.53,
      y,
      inner * 0.47,
      social ? 37 : 55,
      social ? 20 : 28,
      '"IBM Plex Mono"',
    );
    c.fillStyle = p.ink;
    box(
      c,
      item.note,
      m + inner * 0.53,
      y + (social ? 43 : 70),
      inner * 0.47,
      social ? 65 : 130,
      social ? 22 : 33,
    );
    rule(c, m, y + rowH - 10, inner, p.line);
  });
  c.fillStyle = p.accent;
  box(
    c,
    "BOOKING CONTACT",
    m,
    social ? 1120 : 2110,
    inner,
    40,
    social ? 20 : 26,
    '"IBM Plex Mono"',
  );
  c.fillStyle = p.ink;
  box(c, data.contact, m, social ? 1170 : 2180, inner, social ? 100 : 160, social ? 27 : 38);
  await drawFrame(c, w, h, data.removeFrame);
  return [canvas];
}
