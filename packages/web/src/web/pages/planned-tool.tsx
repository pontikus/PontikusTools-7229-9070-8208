import { asset } from "../lib/asset";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Anchor } from "lucide-react";
import { Header, PlaceholderLink } from "../components/brand";
import { tools } from "../lib/catalogue";
import { isEmbed, usePageTitle } from "../lib/page";
export default function PlannedTool() {
  const { slug } = useParams<{ slug: string }>();
  const tool = tools.find((t) => t.slug === slug);
  usePageTitle(`${tool?.name || "Page not found"} | Pontikus Boatyard`);
  return (
    <>
      <Header compact />
      <main className="planned-page">
        <span className="eyebrow">{tool ? "ON THE HORIZON" : "PAGE NOT FOUND"}</span>
        <Anchor size={42} strokeWidth={1.2} />
        <h1>{tool?.name || "A little off course."}</h1>
        <p>{tool?.promise || "This page isn’t in the boatyard."}</p>
        <p>
          {tool
            ? "This tool is planned, not yet available. The Postcard Maker is ready to try while the rest of the workshop takes shape."
            : "Head back to the workshop to find your next tool."}
        </p>
        <Link href={"~" + asset("tools/postcard")} className="button">
          Try Postcard Maker <ArrowRight size={18} />
        </Link>
        {!isEmbed() && (
          <Link href={"~" + asset("")} className="text-link">
            <ArrowLeft size={16} />
            Back to all tools
          </Link>
        )}
        {tool && (
          <PlaceholderLink kind="suggestion" className="inline-link">
            Suggest a tool
          </PlaceholderLink>
        )}
      </main>
    </>
  );
}
