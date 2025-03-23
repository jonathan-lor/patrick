import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import PptxGenJS from "pptxgenjs";
import fs from "fs/promises";
import path from "path";

const server = new McpServer({
  name: "PowerPoint MCP Server",
  version: "1.0.0"
});

// Tool: create new .pptx file
server.tool(
  "create_pptx",
  { path: z.string() },
  async ({ path }) => {
    try {
      const pptx = new PptxGenJS();
      await pptx.writeFile({ fileName: path });
      return {
        content: [{ type: "text", text: `Created PowerPoint file at ${path}` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true
      };
    }
  }
);

// Tool: add slide
server.tool(
  "add_slide",
  {
    path: z.string(),
    title: z.string(),
    content: z.string()
  },
  async ({ path, title, content }) => {
    try {
      const pptx = new PptxGenJS();
      const slide = pptx.addSlide();
      slide.addText(title, { x: 0.5, y: 0.5, fontSize: 24 });
      slide.addText(content, { x: 0.5, y: 1.5, fontSize: 18 });
      await pptx.writeFile({ fileName: path });
      return {
        content: [{ type: "text", text: `Added slide to ${path}` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true
      };
    }
  }
);

// Resource: PowerPoint file existence check and placeholder overview
server.resource(
  "pptx-overview",
  new ResourceTemplate("pptx://{filepath}", { list: undefined }),
  async (uri, { filepath }) => {
    const resolvedPath = path.resolve(
      ...(Array.isArray(filepath) ? filepath : [filepath])
    );
    const exists = await fs.stat(resolvedPath).then(() => true).catch(() => false);
    if (!exists) {
      return {
        contents: [{ uri: uri.href, text: `File ${resolvedPath} not found.` }]
      };
    }
    return {
      contents: [{
        uri: uri.href,
        text: `Reading PowerPoint contents from ${resolvedPath} is not yet implemented.`
      }]
    };
  }
);

// Main entrypoint
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
