import { asset } from "../lib/asset";
import { useEffect, useRef, useState } from "react";
import { Download, Upload, Check, ArrowRight, RotateCcw, ImagePlus } from "lucide-react";
import { ToolShell, FrameControl } from "../components/tool-shell";
import { regions, tools } from "../lib/catalogue";
import { useFrameGate } from "../lib/frame-gate";
import { drawPostcard, WIDTH, HEIGHT, type PostcardData } from "../lib/postcard-canvas";

// Module memory survives internal navigation, but not a refresh. No localStorage.
const defaults: PostcardData = {
  region: "Southern Europe",
  message:
    "Salt in the air, a quiet harbour and nowhere we need to be. Saving a little piece of this coast for you.",
  sender: "Alex",
  signOff: "With love,",
  layout: "classic",
  photo: asset("images/coast.jpg"),
  removeFrame: false,
};
let sessionDraft = { ...defaults };
const layouts = [
  ["classic", "Classic", "A photograph, neatly framed."],
  ["full-bleed", "Horizon", "Let the view fill the page."],
  ["split", "Editorial", "A little room for the coast."],
  ["bordered", "Keepsake", "A fine border. A lasting memory."],
];
function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
async function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not create your PNG."))),
      "image/png",
    ),
  );
}
export default function Postcard() {
  const gate = useFrameGate();
  const tool = tools.find((t) => t.slug === "postcard")!;
  const [data, setData] = useState(sessionDraft),
    [side, setSide] = useState<"front" | "back">("front"),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  function update<K extends keyof PostcardData>(key: K, value: PostcardData[K]) {
    setData((d) => {
      const next = { ...d, [key]: value };
      sessionDraft = next;
      return next;
    });
    setNotice("");
  }
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    const temp = document.createElement("canvas");
    drawPostcard(temp, data, side)
      .then(() => {
        if (!cancelled && canvasRef.current) {
          const c = canvasRef.current;
          c.width = WIDTH;
          c.height = HEIGHT;
          c.getContext("2d")!.drawImage(temp, 0, 0);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError("The preview could not load. Try another photograph.");
      });
    return () => {
      cancelled = true;
    };
  }, [data, side, gate]);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Please choose a photograph smaller than 20 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = new window.Image();
        img.src = String(reader.result);
        await img.decode();
        update("photo", String(reader.result));
        setNotice("Photograph added. It stays in your browser.");
      } catch {
        setError("This photograph could not be read. Try a different file.");
      }
    };
    reader.onerror = () => setError("The photograph could not be read.");
    reader.readAsDataURL(file);
  }
  async function download(format: "png" | "pdf") {
    setBusy(format);
    setError("");
    setNotice("");
    try {
      const front = document.createElement("canvas"),
        back = document.createElement("canvas");
      await Promise.all([drawPostcard(front, data, "front"), drawPostcard(back, data, "back")]);
      if (format === "png") {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        zip.file("pontikus-postcard-front.png", await canvasBlob(front));
        zip.file("pontikus-postcard-back.png", await canvasBlob(back));
        saveFile(await zip.generateAsync({ type: "blob" }), "pontikus-postcard-A6.zip");
        setNotice("Downloaded: front and back PNGs in one ZIP.");
      } else {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a6" });
        doc.addImage(front.toDataURL("image/png"), "PNG", 0, 0, 148, 105);
        doc.addPage("a6", "landscape");
        doc.addImage(back.toDataURL("image/png"), "PNG", 0, 0, 148, 105);
        doc.save("pontikus-postcard-A6.pdf");
        setNotice("Downloaded: two-page A6 PDF. Print at actual size.");
      }
    } catch (e) {
      setError("Download failed. " + (e instanceof Error ? e.message : "Please try again."));
    } finally {
      setBusy("");
    }
  }
  const form = (
    <>
      <div className="form-heading">
        <span className="step-label">01</span>
        <h2>Choose a style</h2>
      </div>
      <div className="layout-grid">
        {layouts.map(([id, name, desc]) => (
          <button
            key={id}
            className={"layout-choice " + (data.layout === id ? "selected" : "")}
            onClick={() => update("layout", id)}
            aria-pressed={data.layout === id}
          >
            <span className={"layout-mini " + id}>
              <span />
              <i />
            </span>
            <strong>{name}</strong>
            <small>{desc}</small>
            {data.layout === id && <Check size={14} />}
          </button>
        ))}
      </div>
      <div className="form-heading">
        <span className="step-label">02</span>
        <h2>Add your details</h2>
      </div>
      <label className="field">
        Your coast
        <select value={data.region} onChange={(e) => update("region", e.target.value)}>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Your photograph
        <input
          ref={fileRef}
          aria-label="Your photograph"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file-input"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </label>
      <button
        className="upload-area"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files[0]);
        }}
      >
        <ImagePlus size={26} />
        <strong>
          {data.photo === defaults.photo ? "Choose a photograph" : "Change photograph"}
        </strong>
        <span>Drop it here, or browse your files</span>
        <small>JPG, PNG or WebP · up to 20 MB</small>
      </button>
      {data.photo === defaults.photo ? (
        <p className="sample-note">
          A sample coastal photograph is shown. Add your own to make it personal.
        </p>
      ) : (
        <button className="inline-link sample-note" onClick={() => update("photo", defaults.photo)}>
          Use the sample photograph
        </button>
      )}
      <label className="field">
        Your message <span className="field-hint">On the back of your postcard</span>
        <textarea
          aria-label="Your message"
          value={data.message}
          maxLength={220}
          rows={4}
          onChange={(e) => update("message", e.target.value)}
        />
        <span className="counter mono">{data.message.length} / 220</span>
      </label>
      <label className="field">
        Sign-off
        <input
          aria-label="Sign-off"
          value={data.signOff}
          maxLength={45}
          onChange={(e) => update("signOff", e.target.value)}
        />
      </label>
      <label className="field">
        Sender name
        <input
          aria-label="Sender name"
          maxLength={45}
          value={data.sender}
          placeholder="Your name"
          onChange={(e) => update("sender", e.target.value)}
        />
      </label>
      <FrameControl removed={data.removeFrame} onChange={(v) => update("removeFrame", v)} />
      <button
        className="text-link reset-link"
        onClick={() => {
          sessionDraft = { ...defaults };
          setData({ ...defaults });
          setNotice("Restored the sample postcard.");
        }}
      >
        <RotateCcw size={14} />
        Reset to sample
      </button>
    </>
  );
  const preview = (
    <>
      <div className="preview-heading">
        <span className="eyebrow">03 / LIVE PREVIEW</span>
        <span className="mono">
          <span className="dot" /> {ready ? "UP TO DATE" : "RENDERING"}
        </span>
      </div>
      <div className="side-tabs">
        <button
          onClick={() => setSide("front")}
          className={side === "front" ? "active" : ""}
          aria-pressed={side === "front"}
        >
          Front
        </button>
        <button
          onClick={() => setSide("back")}
          className={side === "back" ? "active" : ""}
          aria-pressed={side === "back"}
        >
          Back
        </button>
      </div>
      <div className="canvas-stage">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label={`${side} of your postcard from ${data.region}${side === "back" ? ": " + data.message + " — " + data.sender : ""}`}
        >
          Your postcard preview. Use the download buttons to keep both sides.
        </canvas>
      </div>
      <div className="preview-meta">
        <span>A6 · 148 × 105 mm</span>
        <span>Landscape / print-ready</span>
      </div>
      <p className="preview-tip">
        {side === "front"
          ? "A view to keep. Your message is on the reverse."
          : "A note to send. Address lines are left blank for handwriting."}
        <button
          className="inline-link"
          onClick={() => setSide(side === "front" ? "back" : "front")}
        >
          View {side === "front" ? "back" : "front"} <ArrowRight size={14} />
        </button>
      </p>
      <div className="download-panel">
        <div className="form-heading">
          <span className="step-label">04</span>
          <h2>Make it yours to keep.</h2>
        </div>
        <p>Both sides included. Print it, send it, or save it for later.</p>
        <div className="download-buttons">
          <button className="button" disabled={!!busy || !ready} onClick={() => download("png")}>
            <Download size={17} />
            {busy === "png" ? "Preparing PNGs…" : "Download PNGs"}
          </button>
          <button
            className="button outline"
            disabled={!!busy || !ready}
            onClick={() => download("pdf")}
          >
            <Download size={17} />
            {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        <span className="mono export-note">PNG: 1748 × 1240 PX, ZIP · PDF: TWO A6 PAGES</span>
        {notice && (
          <output className="success" aria-live="polite">
            <Check size={16} />
            {notice}
          </output>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="maker-aside">
        <Upload size={21} />
        <div>
          <strong>Made here. Kept by you.</strong>
          <p>Your photograph never leaves this browser.</p>
        </div>
      </div>
    </>
  );
  return (
    <ToolShell
      title={tool.name}
      description="Send a little piece of your coast. A photograph, a few words, and something worth keeping."
      number={tool.number}
      audience={tool.audience}
      form={form}
      preview={preview}
    />
  );
}
