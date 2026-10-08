import { useState } from "react";
import { tools } from "../lib/catalogue";
import { ToolShell, FrameControl } from "../components/tool-shell";
import { CanvasPreview, Field, StyleChoices, useCanvasPages } from "../components/canvas-maker";
import { EntryList, useExpertDraft } from "../components/expert-fields";
import { renderAvailability, type AvailabilityData } from "../lib/expert-canvas";
const initial: AvailabilityData = {
  name: "[YOUR NAME]",
  season: "Summer",
  locations: [
    { location: "[YOUR LOCATION]", from: "", until: "", note: "[YOUR AVAILABILITY NOTE]" },
  ],
  contact: "[YOUR BOOKING CONTACT]",
  format: "a4",
  style: "classic",
  removeFrame: false,
};
export default function Availability() {
  const tool = tools.find((t) => t.slug === "availability")!;
  const { data, update } = useExpertDraft(tool.slug, initial);
  const [page, setPage] = useState(0);
  const preview = useCanvasPages(data, renderAvailability);
  return (
    <ToolShell
      title={tool.name}
      number={tool.number}
      audience={tool.audience}
      description="Let the coast know where you’ll be and how to book your time."
      form={
        <>
          <StyleChoices value={data.style} onChange={(style) => update({ style })} />
          <Field
            label="Name"
            value={data.name}
            maxLength={60}
            onChange={(name) => update({ name })}
          />
          <label className="field">
            Season
            <select
              aria-label="Season"
              value={data.season}
              onChange={(e) => update({ season: e.target.value })}
            >
              {["Spring", "Summer", "Autumn", "Winter"].map((season) => (
                <option key={season}>{season}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Export format
            <select
              aria-label="Export format"
              value={data.format}
              onChange={(e) => update({ format: e.target.value })}
            >
              <option value="a4">A4 poster · 1748 × 2480 px</option>
              <option value="social">Social image · 1080 × 1350 px</option>
            </select>
          </label>
          <EntryList
            items={data.locations}
            onChange={(locations) => update({ locations })}
            max={6}
            label="Location"
            empty={() => ({ location: "", from: "", until: "", note: "" })}
          >
            {(entry, index, change) => (
              <>
                <Field
                  label={`Location ${index + 1} name`}
                  value={entry.location}
                  maxLength={60}
                  onChange={(location) => change({ location })}
                />
                <Field
                  label={`Location ${index + 1} from`}
                  type="date"
                  value={entry.from}
                  onChange={(from) => change({ from })}
                />
                <Field
                  label={`Location ${index + 1} until`}
                  type="date"
                  value={entry.until}
                  onChange={(until) => change({ until })}
                />
                {entry.from && entry.until && entry.from > entry.until && (
                  <p className="error" role="alert">
                    End date is before the start date. Check this range before sharing.
                  </p>
                )}
                <Field
                  label={`Location ${index + 1} note`}
                  value={entry.note}
                  maxLength={90}
                  onChange={(note) => change({ note })}
                />
              </>
            )}
          </EntryList>
          <Field
            label="Booking contact"
            value={data.contact}
            maxLength={120}
            onChange={(contact) => update({ contact })}
          />
          <FrameControl
            removed={data.removeFrame}
            onChange={(removeFrame) => update({ removeFrame })}
          />
        </>
      }
      preview={
        <CanvasPreview
          {...preview}
          title={tool.name}
          name={`pontikus-availability-${data.format}`}
          paper={data.format === "social" ? [216, 270] : [210, 297]}
          page={page}
          pageChange={setPage}
          description="Choose A4 for a print poster or social for a 1080 × 1350 image. Download each format separately. PDF always matches the selected canvas ratio."
        />
      }
    />
  );
}
