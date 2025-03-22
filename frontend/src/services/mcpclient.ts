import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline/promises";
import {
    MessageParam,
    Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";

import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
}

class MCPClient {
    private mcp: Client;
    private genAI: GoogleGenerativeAI; // GoogleGenerativeAI client
    private model: any;

    private transport: StdioClientTransport | null = null;
    private tools: Tool[] = [];

    constructor() {
        console.log("called constructor")
        // Initialize GoogleGenerativeAI with the API Key
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Load the Gemini model
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    }

    async connectToServer(serverScriptPath: string) {
        try {
            const isJs = serverScriptPath.endsWith(".js");
            const isPy = serverScriptPath.endsWith(".py");
            if (!isJs && !isPy) {
                throw new Error("Server script must be a .js or .py file");
            }
            const command = isPy
                ? process.platform === "win32"
                    ? "python"
                    : "python3"
                : process.execPath;

            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log(
                "Connected to server with tools:",
                this.tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }

    // Method to process a query with message handling and tool use
    async processQuery(query: string) {
        const messages: MessageParam[] = [
            {
                role: "user",
                content: query,
            },
        ];

        // Get the response from Gemini model
        const result = await this.model.generateContent([query]);
        const responseText = result.response.text();

        const finalText = [responseText];
        const toolResults = [];

        // Here we can simulate processing of tool results if necessary.
        // The exact logic for tool interaction is a placeholder and will depend on how tools are defined and used.
        if (responseText.includes("[tool_use]")) {
            const toolName = "exampleTool"; // Modify this to extract tool name dynamically if needed
            const toolArgs = { exampleArg: "value" }; // Modify based on actual arguments

            const toolResult = await this.mcp.callTool({
                name: toolName,
                arguments: toolArgs,
            });

            toolResults.push(toolResult);
            finalText.push(
                `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
            );

            messages.push({
                role: "user",
                content: toolResult.content as string,
            });

            // Call Gemini model again with updated messages after tool use
            const secondResult = await this.model.generateContent([toolResult.content]);
            finalText.push(secondResult.response.text());
        }

        return finalText.join("\n");
    }

    async chatLoop() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        try {
            console.log("\nMCP Client Started!");
            console.log("Type your queries or 'quit' to exit.");

            while (true) {
                const message = await rl.question("\nQuery: ");
                if (message.toLowerCase() === "quit") {
                    break;
                }
                const response = await this.processQuery(message);
                console.log("\n" + response);
            }
        } finally {
            rl.close();
        }
    }

    async cleanup() {
        await this.mcp.close();
    }
}

export async function test() {
    const mcpClient = new MCPClient();
    try {
        await mcpClient.connectToServer(process.argv[2]);
        await mcpClient.chatLoop();
    } finally {
        await mcpClient.cleanup();
        process.exit(0);
    }
}