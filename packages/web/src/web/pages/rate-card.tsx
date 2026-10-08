import { useState } from "react";
import { tools } from "../lib/catalogue";
import { ToolShell, FrameControl } from "../components/tool-shell";
import { CanvasPreview, Field, StyleChoices, useCanvasPages } from "../components/canvas-maker";
import { EntryList, useExpertDraft } from "../components/expert-fields";
import { renderRate, type RateData } from "../lib/expert-canvas";
const initial: RateData = {
  name: "[YOUR NAME OR BUSINESS]",
  currency: "GBP",
  rows: [{ service: "[YOUR SERVICE]", unit: "per hour", price: "" }],
  terms: "[YOUR TERMS: payment, expenses and cancellation arrangements.]",
  valid: "",
  contact: "[YOUR CONTACT]",
  style: "classic",
  removeFrame: false,
};
export default function RateCard() {
  const tool = tools.find((t) => t.slug === "rate-card")!;
  const { data, update } = useExpertDraft(tool.slug, initial);
  const [page, setPage] = useState(0);
  const preview = useCanvasPages(data, renderRate);
  return (
    <ToolShell
      title={tool.name}
      number={tool.number}
      audience={tool.audience}
      description="Present your services, rates and terms clearly, with space to grow."
      form={
        <>
          <StyleChoices value={data.style} onChange={(style) => update({ style })} />
          <Field
            label="Name or business"
            value={data.name}
            maxLength={70}
            onChange={(name) => update({ name })}
          />
          <label className="field">
            Currency
            <select
              aria-label="Currency"
              value={data.currency}
              onChange={(e) => update({ currency: e.target.value })}
            >
              {["GBP", "EUR", "USD"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <EntryList
            items={data.rows}
            onChange={(rows) => update({ rows })}
            max={12}
            label="Service"
            empty={() => ({ service: "", unit: "", price: "" })}
          >
            {(row, index, change) => (
              <>
                <Field
                  label={`Service ${index + 1} name`}
                  value={row.service}
                  maxLength={100}
                  onChange={(service) => change({ service })}
                />
                <Field
                  label={`Service ${index + 1} unit`}
                  value={row.unit}
                  maxLength={30}
                  onChange={(unit) => change({ unit })}
                />
                <Field
                  label={`Service ${index + 1} price`}
                  value={row.price}
                  maxLength={12}
                  onChange={(price) => change({ price })}
                />
              </>
            )}
          </EntryList>
          <Field
            label="Terms"
            value={data.terms}
            maxLength={300}
            multiline
            onChange={(terms) => update({ terms })}
          />
          <Field
            label="Valid until"
            type="date"
            value={data.valid}
            onChange={(valid) => update({ valid })}
          />
          <Field
            label="Contact line"
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
          name="pontikus-rate-card-A4"
          paper={[210, 297]}
          page={page}
          pageChange={setPage}
          description="A4 pages. A second page is added automatically when service rows exceed the available space. Terms and contact are repeated on each page."
        />
      }
    />
  );
}
