import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as xlsx from "xlsx";
import fs from "fs/promises";

// init
const server = new McpServer({
  name: "Excel MCP",
  version: "1.0.0"
});

// create
server.tool(
  "create_excel",
  {
    path: z.string(),
    sheetName: z.string().optional(),
    data: z.array(z.record(z.any()))
  },
  async ({ path, sheetName = "Sheet1", data }) => {
    try {
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
      xlsx.writeFile(workbook, path);

      return {
        content: [{ type: "text", text: `Excel file created at ${path}` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true
      };
    }
  }
);

// read
server.tool(
  "read_excel",
  {
    path: z.string(),
    sheetName: z.string().optional()
  },
  async ({ path, sheetName }) => {
    try {
      const file = await fs.readFile(path);
      const workbook = xlsx.read(file, { type: "buffer" });
      const targetSheet = sheetName || workbook.SheetNames[0];
      const sheet = workbook.Sheets[targetSheet];

      if (!sheet) {
        throw new Error(`Sheet "${targetSheet}" not found in ${path}`);
      }

      const data = xlsx.utils.sheet_to_json(sheet);

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true
      };
    }
  }
);

// write
server.tool(
  "write_excel",
  {
    path: z.string(),
    sheetName: z.string(),
    data: z.array(z.record(z.any()))
  },
  async ({ path, sheetName, data }) => {
    try {
      const file = await fs.readFile(path);
      const workbook = xlsx.read(file, { type: "buffer" });

      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName, true); // overwrite if exists
      xlsx.writeFile(workbook, path);

      return {
        content: [{ type: "text", text: `Sheet "${sheetName}" updated in ${path}` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true
      };
    }
  }
);

// list sheets
server.tool(
    "list_sheets",
    {
      path: z.string()
    },
    async ({ path }) => {
      try {
        const file = await fs.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
  
        return {
          content: [{
            type: "text",
            text: `Sheets in ${path}:\n- ${workbook.SheetNames.join("\n- ")}`
          }]
        };
      } catch (err) {
        return {
          content: [{
            type: "text",
            text: `Error: ${(err as Error).message}`
          }],
          isError: true
        };
      }
    }
  );

// get headers
server.tool(
    "get_headers",
    {
      path: z.string(),
      sheetName: z.string().optional()
    },
    async ({ path, sheetName }) => {
      try {
        const file = await fs.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        const target = sheetName || workbook.SheetNames[0];
        const sheet = workbook.Sheets[target];
  
        if (!sheet) {
          throw new Error(`Sheet "${target}" not found`);
        }
  
        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const headers = (rows[0] as string[]) ?? [];
  
        return {
          content: [{
            type: "text",
            text: `Headers in ${target}:\n- ${headers.join("\n- ")}`
          }]
        };
      } catch (err) {
        return {
          content: [{
            type: "text",
            text: `Error: ${(err as Error).message}`
          }],
          isError: true
        };
      }
    }
);

// append rows
server.tool(
    "append_rows",
    {
      path: z.string(),
      sheetName: z.string(),
      data: z.array(z.record(z.any()))
    },
    async ({ path, sheetName, data }) => {
      try {
        const file = await fs.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        let sheet = workbook.Sheets[sheetName];
  
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }
  
        // Convert existing sheet to array of objects
        const existingData = xlsx.utils.sheet_to_json(sheet);
        const combined = [...existingData, ...data];
  
        // Replace with new combined sheet
        const newSheet = xlsx.utils.json_to_sheet(combined);
        workbook.Sheets[sheetName] = newSheet;
        xlsx.writeFile(workbook, path);
  
        return {
          content: [{
            type: "text",
            text: `Appended ${data.length} row(s) to sheet "${sheetName}" in ${path}`
          }]
        };
      } catch (err) {
        return {
          content: [{
            type: "text",
            text: `Error: ${(err as Error).message}`
          }],
          isError: true
        };
      }
    }
);

// sum column (need to add a bunch more of these to mimic excel functions later)
server.tool(
    "sum_column",
    {
      path: z.string(),
      sheetName: z.string(),
      column: z.string()
    },
    async ({ path, sheetName, column }) => {
      try {
        const file = await fs.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        const sheet = workbook.Sheets[sheetName];
  
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }
  
        const rows = xlsx.utils.sheet_to_json(sheet);
        let sum = 0;
        let count = 0;
  
        for (const row of rows) {
          const val = (row as Record<string, any>)[column];
          const num = typeof val === "number" ? val : parseFloat(val);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
  
        return {
          content: [{
            type: "text",
            text: `Sum of "${column}" in "${sheetName}": ${sum} (from ${count} numeric value(s))`
          }]
        };
      } catch (err) {
        return {
          content: [{
            type: "text",
            text: `Error: ${(err as Error).message}`
          }],
          isError: true
        };
      }
    }
  );

// Main entrypoint
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();