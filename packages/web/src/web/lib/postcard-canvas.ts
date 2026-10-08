import { asset } from "./asset";
// The live preview IS the export canvas: no server, screenshot service or hidden upload.
import { effectiveRemoveFrame, loadExportFonts } from "./canvas-utils";
export const WIDTH = 1748,
  HEIGHT = 1240;
export type PostcardData = {
  region: string;
  message: string;
  sender: string;
  signOff: string;
  layout: string;
  photo: string;
  removeFrame: boolean;
};
const navy = "#0B1F3B",
  cream = "#F7F3EB",
  gold = "#C6A04A";
async function image(src: string) {
  const img = new window.Image();
  img.src = src;
  await img.decode();
  return img;
}
function cover(
  c: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale,
    sh = h / scale;
  c.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
function text(
  c: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let yy = y;
  for (const paragraph of value.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const next = line ? line + " " + word : word;
      if (c.measureText(next).width > maxWidth && line) {
        c.fillText(line, x, yy);
        yy += lineHeight;
        line = word;
      } else line = next;
    }
    c.fillText(line, x, yy);
    yy += lineHeight;
  }
  return yy;
}
export async function drawPostcard(
  canvas: HTMLCanvasElement,
  data: PostcardData,
  side: "front" | "back",
) {
  await loadExportFonts();
  const removeFrame = effectiveRemoveFrame(data.removeFrame);
  const [photo, logo] = await Promise.all([image(data.photo), image(asset("images/pontikus-logo.png"))]);
  const c = canvas.getContext("2d")!;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  c.fillStyle = cream;
  c.fillRect(0, 0, WIDTH, HEIGHT);
  const bottom = removeFrame ? HEIGHT : HEIGHT - 78;
  if (side === "front") {
    if (data.layout === "classic") {
      cover(c, photo, 48, 48, WIDTH - 96, bottom - 265);
      c.fillStyle = navy;
      c.font = '30px "IBM Plex Mono"';
      c.fillText("A LITTLE PIECE OF THE COAST", 65, bottom - 144);
      c.font = "72px Fraunces";
      c.fillText(data.region, 65, bottom - 51);
    } else if (data.layout === "full-bleed") {
      cover(c, photo, 0, 0, WIDTH, bottom);
      const g = c.createLinearGradient(0, bottom - 420, 0, bottom);
      g.addColorStop(0, "#0B1F3B00");
      g.addColorStop(1, "#0B1F3Bee");
      c.fillStyle = g;
      c.fillRect(0, 0, WIDTH, bottom);
      c.fillStyle = cream;
      c.font = '30px "IBM Plex Mono"';
      c.fillText("GREETINGS FROM", 75, bottom - 167);
      c.font = "90px Fraunces";
      c.fillText(data.region, 75, bottom - 60);
    } else if (data.layout === "split") {
      cover(c, photo, 0, 0, WIDTH * 0.62, bottom);
      c.fillStyle = navy;
      c.fillRect(WIDTH * 0.62, 0, WIDTH * 0.38, bottom);
      c.fillStyle = gold;
      c.font = '27px "IBM Plex Mono"';
      c.fillText("FROM THE COAST", WIDTH * 0.62 + 55, 115);
      c.fillStyle = cream;
      c.font = "76px Fraunces";
      text(c, data.region, WIDTH * 0.62 + 55, 300, WIDTH * 0.38 - 110, 91);
      c.strokeStyle = gold;
      c.beginPath();
      c.moveTo(WIDTH * 0.62 + 55, 600);
      c.lineTo(WIDTH - 70, 600);
      c.stroke();
      c.font = "42px Fraunces";
      text(c, "Wish you were here.", WIDTH * 0.62 + 55, 740, WIDTH * 0.38 - 110, 55);
    } else {
      c.strokeStyle = gold;
      c.lineWidth = 3;
      c.strokeRect(32, 32, WIDTH - 64, bottom - 64);
      cover(c, photo, 88, 88, WIDTH - 176, bottom - 328);
      c.fillStyle = navy;
      c.textAlign = "center";
      c.font = "72px Fraunces";
      c.fillText(data.region, WIDTH / 2, bottom - 113);
      c.font = '26px "IBM Plex Mono"';
      c.fillText("A NOTE FROM THE SHORE", WIDTH / 2, bottom - 58);
      c.textAlign = "left";
    }
  } else {
    c.fillStyle = navy;
    c.font = '30px "IBM Plex Mono"';
    c.fillText("POSTCARD / " + data.region.toUpperCase(), 80, 105);
    c.strokeStyle = "#cfc8b8";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(WIDTH * 0.59, 185);
    c.lineTo(WIDTH * 0.59, bottom - 105);
    c.stroke();
    c.font = "49px Fraunces";
    const end = text(c, data.message || "Your message goes here.", 80, 255, WIDTH * 0.59 - 155, 65);
    c.font = "36px Archivo";
    text(
      c,
      [data.signOff, data.sender].filter(Boolean).join("\n"),
      80,
      Math.min(end + 100, bottom - 145),
      WIDTH * 0.59 - 155,
      49,
    );
    const stampX = WIDTH - 255;
    c.setLineDash([8, 7]);
    c.strokeRect(stampX, 70, 170, 200);
    c.setLineDash([]);
    c.drawImage(logo, stampX + 43, 88, 84, 84);
    c.fillStyle = navy;
    c.font = '21px "IBM Plex Mono"';
    c.fillText("BY THE SEA", stampX + 23, 233);
    c.font = '24px "IBM Plex Mono"';
    c.fillStyle = "#596273";
    c.fillText("TO", WIDTH * 0.59 + 65, 410);
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(WIDTH * 0.59 + 65, 500 + i * 110);
      c.lineTo(WIDTH - 90, 500 + i * 110);
      c.stroke();
    }
  }
  if (!removeFrame) {
    c.fillStyle = cream;
    c.fillRect(0, HEIGHT - 78, WIDTH, 78);
    c.strokeStyle = "#d9d3c6";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, HEIGHT - 78);
    c.lineTo(WIDTH, HEIGHT - 78);
    c.stroke();
    c.drawImage(logo, 35, HEIGHT - 65, 45, 45);
    c.fillStyle = navy;
    c.font = "25px Archivo";
    c.fillText("Made with Pontikus · pontikus.com", 100, HEIGHT - 30);
  }
}
