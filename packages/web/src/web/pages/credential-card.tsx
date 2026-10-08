import { useState } from "react";
import { tools } from "../lib/catalogue";
import { ToolShell, FrameControl } from "../components/tool-shell";
import { CanvasPreview, Field, StyleChoices, useCanvasPages } from "../components/canvas-maker";
import { EntryList, OptionalPhoto, useExpertDraft } from "../components/expert-fields";
import { renderCredential, type CredentialData } from "../lib/expert-canvas";
const initial: CredentialData = {
  name: "[YOUR NAME]",
  role: "[YOUR ROLE]",
  credentials: [{ title: "[YOUR CREDENTIAL]", issuer: "[ISSUER]", year: "[YEAR]" }],
  photo: "",
  style: "classic",
  removeFrame: false,
};
export default function CredentialCard() {
  const tool = tools.find((t) => t.slug === "credential-card")!;
  const { data, update } = useExpertDraft(tool.slug, initial);
  const [page, setPage] = useState(0);
  const preview = useCanvasPages(data, renderCredential);
  return (
    <ToolShell
      title={tool.name}
      number={tool.number}
      audience={tool.audience}
      description="A wallet-sized personal summary of the credentials you choose to share."
      form={
        <>
          <StyleChoices value={data.style} onChange={(style) => update({ style })} />
          <p className="sample-note">
            This card is a personal summary. It is not an official certificate and does not confirm
            any qualification.
          </p>
          <Field
            label="Name"
            value={data.name}
            maxLength={60}
            onChange={(name) => update({ name })}
          />
          <Field
            label="Role"
            value={data.role}
            maxLength={80}
            onChange={(role) => update({ role })}
          />
          <EntryList
            items={data.credentials}
            onChange={(credentials) => update({ credentials })}
            max={5}
            label="Credential"
            empty={() => ({ title: "", issuer: "", year: "" })}
          >
            {(entry, index, change) => (
              <>
                <Field
                  label={`Credential ${index + 1} title`}
                  value={entry.title}
                  maxLength={65}
                  onChange={(title) => change({ title })}
                />
                <Field
                  label={`Credential ${index + 1} issuer`}
                  value={entry.issuer}
                  maxLength={45}
                  onChange={(issuer) => change({ issuer })}
                />
                <Field
                  label={`Credential ${index + 1} year`}
                  value={entry.year}
                  maxLength={6}
                  onChange={(year) => change({ year })}
                />
              </>
            )}
          </EntryList>
          <OptionalPhoto value={data.photo} onChange={(photo) => update({ photo })} />
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
          name="pontikus-credential-card"
          paper={[86, 54]}
          page={page}
          pageChange={setPage}
          description="Page 1 is the front; page 2 is the back. Pontikus verification: not yet verified. PNG download includes both sides in a ZIP; PDF has two 86 × 54 mm pages."
        />
      }
    />
  );
}
