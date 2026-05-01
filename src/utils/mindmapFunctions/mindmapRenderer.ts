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
      const extractWord = (el: Element | null) => {
        if (!el) return "";
        const txt = el.textContent || "";
        return txt.trim();
      };

      const attachInteractive = (el: Element, label: string) => {
        // Make sure the element can receive mouse events
        (el as HTMLElement).style.cursor = "pointer";
        (el as HTMLElement).style.pointerEvents = "all";

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const word = extractWord(el);
          onNodeClick(word, e as MouseEvent);
        });
      };

      // Mermaid mindmap output varies by version/theme; cover common cases.
      const textNodes = Array.from(svg.querySelectorAll("text"));
      const foreignTextNodes = Array.from(svg.querySelectorAll("foreignObject"));
      const groupNodes = Array.from(svg.querySelectorAll("g"));

      textNodes.forEach((n) => attachInteractive(n, "text"));
      foreignTextNodes.forEach((n) => attachInteractive(n, "foreignObject"));

      // Some Mermaid diagrams put pointer-events on <g> wrappers; attach as a fallback
      // but avoid attaching to the root <svg> itself.
      groupNodes.forEach((g) => {
        if (g === svg) return;
        attachInteractive(g, "g");
      });
    }
  }
}
