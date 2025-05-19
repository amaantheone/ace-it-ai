import mermaid from "mermaid";

export async function renderMindmap({
  mindmapData,
  mermaidRef,
  generateMindmapSyntax,
  onNodeClick, // optional callback for node click
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
  generateMindmapSyntax: (data: {
    root: {
      text: string;
      children?: Array<{
        text: string;
        children?: Array<{ text: string }>;
      }>;
    };
  }) => string;
  onNodeClick?: (word: string, evt?: MouseEvent) => void;
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

  // Use mermaid.render to generate SVG and inject it
  try {
    const { svg } = await mermaid.render("mindmap-svg", mindmapSyntax);
    container.innerHTML = svg;
  } catch (err) {
    console.error("Mermaid render error:", err);
    container.innerHTML = `<pre style='color:red;'>Mermaid render error: ${
      err instanceof Error ? err.message : JSON.stringify(err)
    }</pre>`;
  }

  // Add zoom controls
  const svg = mermaidRef.current.querySelector("svg");
  if (svg) {
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.minHeight = "400px";

    // Attach click handlers to node text elements
    if (onNodeClick) {
      // Mermaid mindmap nodes are usually <text> elements inside the SVG
      const textNodes = svg.querySelectorAll("text");
      textNodes.forEach((textNode) => {
        textNode.style.cursor = "pointer";
        textNode.addEventListener("click", (e) => {
          e.stopPropagation();
          const word = textNode.textContent || "";
          onNodeClick(word, e);
        });
      });
    }
  }
}
