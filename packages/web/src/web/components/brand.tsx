import { asset } from "../lib/asset";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, X } from "lucide-react";
import { settings } from "../lib/catalogue";
import { isEmbed } from "../lib/page";

export function Brand() {
  return (
    <Link href={"~" + asset("")} className="brand" aria-label="Pontikus Boatyard home">
      <span className="logo-tile">
        <img src={asset("images/pontikus-logo.png")} alt="" />
      </span>
      <span>
        PONTIKUS<span className="brand-sub">United by the coast. Built by the sea.</span>
      </span>
    </Link>
  );
}
export function Header({ compact = false }: { compact?: boolean }) {
  if (isEmbed()) return null;
  return (
    <header className="header">
      <div className="header-inner">
        <Brand />
        {!compact && (
          <nav aria-label="Main navigation">
            <a href={asset("#sea-lovers")}>Sea Lovers</a>
            <a href={asset("#coastal-experts")}>Coastal Experts</a>
            <a href={asset("#shoreline-businesses")}>Shoreline Businesses</a>
          </nav>
        )}
        <Link href={"~" + asset(compact ? "" : "tools/postcard")} className="header-link">
          {compact ? "Back to the boatyard" : "Enter the workshop"}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </header>
  );
}
// Replace the URLs in catalogue.ts. Until then, explain the placeholder honestly.
export function PlaceholderLink({
  kind = "verify",
  children,
  className = "button",
}: {
  kind?: "verify" | "suggestion";
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const url = kind === "verify" ? settings.verifyUrl : settings.suggestionUrl;
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);
  if (!url.startsWith("["))
    return (
      <a className={className} href={url}>
        {children}
      </a>
    );
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <dialog
        ref={dialogRef}
        onCancel={() => setOpen(false)}
        className="modal"
        aria-label={
          kind === "verify" ? "Verification link placeholder" : "Suggestion link placeholder"
        }
      >
        <button
          className="icon-button modal-close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <span className="eyebrow">LINK TO BE CONNECTED</span>
        <h2>
          {kind === "verify" ? "Your verified place on the coast." : "What should we make next?"}
        </h2>
        <p>
          This destination hasn’t been configured yet. Pontikus will add the{" "}
          {kind === "verify" ? "verification" : "suggestion form"} link before launch.
        </p>
        <code>{url}</code>
        <button className="button" onClick={() => setOpen(false)}>
          Back to the workshop
        </button>
      </dialog>
    </>
  );
}
export function Footer() {
  if (isEmbed()) return null;
  return (
    <footer className="footer">
      <Brand />
      <span>United by the coast. Built by the sea.</span>
      <span className="mono">PONTIKUS.COM</span>
    </footer>
  );
}
