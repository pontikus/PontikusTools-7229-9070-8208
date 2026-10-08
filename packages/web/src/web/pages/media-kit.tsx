import { useState } from "react";
import { tools } from "../lib/catalogue";
import { ToolShell, FrameControl } from "../components/tool-shell";
import { CanvasPreview, Field, StyleChoices, useCanvasPages } from "../components/canvas-maker";
import { OptionalPhoto, RegionField, TextList, useExpertDraft } from "../components/expert-fields";
import { renderMedia, type MediaData } from "../lib/expert-canvas";
const initial: MediaData = {
  name: "[YOUR NAME]",
  role: "[YOUR COASTAL ROLE]",
  region: "Southern Europe",
  bio: "[YOUR BIO: introduce your work, approach and the coast you know.]",
  services: ["[YOUR SERVICE]"],
  credentials: ["[YOUR CREDENTIAL — include only what you can substantiate]"],
  contact: "[YOUR EMAIL OR WEBSITE]",
  photo: "",
  style: "classic",
  removeFrame: false,
};
export default function MediaKit() {
  const tool = tools.find((t) => t.slug === "media-kit")!;
  const { data, update } = useExpertDraft(tool.slug, initial);
  const [page, setPage] = useState(0);
  const preview = useCanvasPages(data, renderMedia);
  return (
    <ToolShell
      title={tool.name}
      number={tool.number}
      audience={tool.audience}
      description="Introduce your work in a considered, one-page coastal media kit."
      form={
        <>
          <StyleChoices value={data.style} onChange={(style) => update({ style })} />
          <p className="sample-note">
            All sample content is labelled placeholder text. Replace it with your own details.
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
          <RegionField value={data.region} onChange={(region) => update({ region })} />
          <Field
            label="Short bio"
            value={data.bio}
            maxLength={500}
            multiline
            onChange={(bio) => update({ bio })}
          />
          <TextList
            label="Service"
            items={data.services}
            onChange={(services) => update({ services })}
            max={6}
            maxLength={90}
          />
          <TextList
            label="Credential"
            items={data.credentials}
            onChange={(credentials) => update({ credentials })}
            max={3}
            maxLength={140}
          />
          <Field
            label="Contact email or website"
            value={data.contact}
            maxLength={120}
            onChange={(contact) => update({ contact })}
          />
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
          name="pontikus-media-kit-A4"
          paper={[210, 297]}
          page={page}
          pageChange={setPage}
          description="One A4 page. Your services and credentials are personal statements, not verification by Pontikus."
        />
      }
    />
  );
}
