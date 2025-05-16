// Utility function to convert mindmapData to Mermaid mindmap syntax
export function generateMindmapSyntax(mindmapData: {
  root: {
    text: string;
    children?: Array<{
      text: string;
      children?: Array<{ text: string }>;
    }>;
  };
}): string {
  let syntax = "mindmap\n";

  const sanitizeText = (text: string) => {
    // Remove special characters that might break the mindmap syntax
    return text.replace(/[^a-zA-Z0-9\s-]/g, "");
  };

  const addNode = (node: any, level: number = 0) => {
    const indent = "  ".repeat(level);
    if (level === 0) {
      syntax += `${indent}root((${sanitizeText(node.text)}))\n`;
    } else {
      const shape = level === 1 ? "[" : "(";
      const endShape = level === 1 ? "]" : ")";
      syntax += `${indent}${shape}${sanitizeText(node.text)}${endShape}\n`;
    }
    if (node.children) {
      node.children.forEach((child: any) => {
        addNode(child, level + 1);
      });
    }
  };

  addNode(mindmapData.root);
  return syntax;
}
