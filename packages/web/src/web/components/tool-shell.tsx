import { asset } from "../lib/asset";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { Header, PlaceholderLink } from "./brand";
import { audiences } from "../lib/catalogue";
import { useFrameGate } from "../lib/frame-gate";
import { isEmbed, usePageTitle } from "../lib/page";

// Reusable shell: each future maker supplies its form and preview independently.
export function ToolShell({
  title,
  description,
  number,
  audience,
  form,
  preview,
}: {
  title: string;
  description: string;
  number: number;
  audience: string;
  form: React.ReactNode;
  preview: React.ReactNode;
}) {
  usePageTitle(`${title} | Pontikus Boatyard`);
  const embed = isEmbed();
  return (
    <>
      {!embed && <Header compact />}
      <main className="maker">
        {!embed && (
          <Link href={"~" + asset("")} className="text-link back-link">
            <ArrowLeft size={16} />
            All tools
          </Link>
        )}
        <span className="eyebrow">
          {audiences[audience]?.toUpperCase() || audience.toUpperCase()} / TOOL{" "}
          {String(number).padStart(2, "0")}
        </span>
        <h1>{title}</h1>
        <p className="maker-intro">{description}</p>
        <ol className="steps">
          {["Choose a style", "Add your details", "Preview", "Download"].map((step, i) => (
            <li key={step}>
              <span>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="maker-columns">
          <section className="maker-form" aria-label="Maker controls">
            {form}
          </section>
          <section className="maker-preview" aria-label="Live preview">
            {preview}
          </section>
        </div>
        <p className="privacy-note">
          Your details and photos stay in browser memory. Nothing is uploaded or saved to a server.
          Refreshing this page clears your work.
        </p>
      </main>
    </>
  );
}
export function FrameControl({
  removed,
  onChange,
}: {
  removed: boolean;
  onChange: (value: boolean) => void;
}) {
  const gate = useFrameGate();
  return (
    <div className="frame-control">
      <div>
        <LockKeyhole size={16} />
        <strong>Remove frame</strong>
        <label className="switch">
          <input
            type="checkbox"
            aria-label="Remove Pontikus frame"
            checked={removed && !gate}
            disabled={gate}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span />
        </label>
      </div>
      <p>
        Included with a verified profile ·{" "}
        <PlaceholderLink className="inline-link">Get verified</PlaceholderLink>
      </p>
      {!gate && <small>Preview access: frame removal is unlocked for this review.</small>}
    </div>
  );
}
