import mermaid from "mermaid";

export async function renderMindmap({
  mindmapData,
  mermaidRef,
  generateMindmapSyntax,
}: {
  mindmapData: {
    root: {
      text: string;
      children?: Array<{
        text: string;
        children?: Array<{ text: string }>;
      }>;
    };
  };
  mermaidRef: React.RefObject<HTMLDivElement>;
  generateMindmapSyntax: (data: any) => string;
}) {
  if (!mermaidRef.current) return;
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",
  });

  // Clear previous content
  mermaidRef.current.innerHTML = "";

  const mindmapSyntax = generateMindmapSyntax(mindmapData);
  const container = document.createElement("div");
  container.className = "mermaid flex justify-center items-center w-full";
  container.textContent = mindmapSyntax;
  mermaidRef.current.appendChild(container);

  await mermaid.run({
    nodes: [container],
  });

  // Add zoom controls
  const svg = mermaidRef.current.querySelector("svg");
  if (svg) {
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.minHeight = "400px";
  }
}
