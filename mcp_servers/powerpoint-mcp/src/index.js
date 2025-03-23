"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const pptxgenjs_1 = __importDefault(require("pptxgenjs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const server = new mcp_js_1.McpServer({
    name: "PowerPoint MCP Server",
    version: "1.0.0"
});
// Tool: create new .pptx file
server.tool("create_pptx", { path: zod_1.z.string() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path }) {
    try {
        const pptx = new pptxgenjs_1.default();
        yield pptx.writeFile({ fileName: path });
        return {
            content: [{ type: "text", text: `Created PowerPoint file at ${path}` }]
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true
        };
    }
}));
// Tool: add slide
server.tool("add_slide", {
    path: zod_1.z.string(),
    title: zod_1.z.string(),
    content: zod_1.z.string()
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, title, content }) {
    try {
        const pptx = new pptxgenjs_1.default();
        const slide = pptx.addSlide();
        slide.addText(title, { x: 0.5, y: 0.5, fontSize: 24 });
        slide.addText(content, { x: 0.5, y: 1.5, fontSize: 18 });
        yield pptx.writeFile({ fileName: path });
        return {
            content: [{ type: "text", text: `Added slide to ${path}` }]
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true
        };
    }
}));
// Resource: PowerPoint file existence check and placeholder overview
server.resource("pptx-overview", new mcp_js_1.ResourceTemplate("pptx://{filepath}", { list: undefined }), (uri_1, _a) => __awaiter(void 0, [uri_1, _a], void 0, function* (uri, { filepath }) {
    const resolvedPath = path_1.default.resolve(...(Array.isArray(filepath) ? filepath : [filepath]));
    const exists = yield promises_1.default.stat(resolvedPath).then(() => true).catch(() => false);
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
}));
// Main entrypoint
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new stdio_js_1.StdioServerTransport();
        yield server.connect(transport);
    });
}
main();
