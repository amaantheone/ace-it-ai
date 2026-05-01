import mermaid from "mermaid";

function parseCssColorToRgb(input: string | null): { r: number; g: number; b: number } | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (!s || s === "none" || s === "transparent" || s === "currentcolor") return null;

  // rgb()/rgba()
  const rgbMatch = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*[\d.]+\s*)?\)$/);
  if (rgbMatch) {
    return {
      r: Math.max(0, Math.min(255, Number(rgbMatch[1]))),
      g: Math.max(0, Math.min(255, Number(rgbMatch[2]))),
      b: Math.max(0, Math.min(255, Number(rgbMatch[3]))),
    };
  }

  // #rgb or #rrggbb
  const hexMatch = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  return null;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function applyMindmapLabelContrast(svg: SVGElement) {
  const pickTextColorForFill = (fill: string | null) => {
    const rgb = parseCssColorToRgb(fill);
    if (!rgb) return null;
    const lum = relativeLuminance(rgb);
    // Light fills (yellow/light green) need dark text.
    return lum > 0.6 ? "#111827" : "#ffffff";
  };

  const findFillNearLabel = (labelEl: Element): string | null => {
    // Mermaid tends to group node visuals + label under a <g>; search upward a bit.
    const candidates: Element[] = [];
    let cur: Element | null = labelEl;
    for (let i = 0; i < 4 && cur; i++) {
      candidates.push(cur);
      cur = cur.parentElement;
    }

    for (const c of candidates) {
      // Common node shapes
      const shape =
        (c as Element).querySelector?.("rect, path, polygon, ellipse, circle") ||
        (c.parentElement?.querySelector?.("rect, path, polygon, ellipse, circle") ?? null);
      if (shape) {
        const fillAttr = shape.getAttribute("fill");
        if (fillAttr && fillAttr !== "none") return fillAttr;
        const computed = getComputedStyle(shape as Element).fill;
        if (computed && computed !== "none") return computed;
      }
    }

    return null;
  };

  // SVG <text> labels
  svg.querySelectorAll("text").forEach((textEl) => {
    const fill = findFillNearLabel(textEl);
    const chosen = pickTextColorForFill(fill);
    if (!chosen) return;
    (textEl as SVGTextElement).setAttribute("fill", chosen);
    (textEl as SVGTextElement).style.fill = chosen;
  });

  // foreignObject labels (HTML inside SVG)
  svg.querySelectorAll("foreignObject").forEach((fo) => {
    const fill = findFillNearLabel(fo);
    const chosen = pickTextColorForFill(fill);
    if (!chosen) return;
    // Try to color common descendants.
    (fo as SVGForeignObjectElement)
      .querySelectorAll<HTMLElement>("div, span, p, strong, em, b, i")
      .forEach((el) => {
        el.style.color = chosen;
      });
  });
}

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
    applyMindmapLabelContrast(svg as unknown as SVGElement);

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
