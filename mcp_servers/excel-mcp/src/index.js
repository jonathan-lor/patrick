"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const xlsx = __importStar(require("xlsx"));
const promises_1 = __importDefault(require("fs/promises"));
// init
const server = new mcp_js_1.McpServer({
    name: "Excel MCP",
    version: "1.0.0"
});
// create
server.tool("create_excel", {
    path: zod_1.z.string(),
    sheetName: zod_1.z.string().optional(),
    data: zod_1.z.array(zod_1.z.record(zod_1.z.any()))
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, sheetName = "Sheet1", data }) {
    try {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        xlsx.writeFile(workbook, path);
        return {
            content: [{ type: "text", text: `Excel file created at ${path}` }]
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true
        };
    }
}));
// read
server.tool("read_excel", {
    path: zod_1.z.string(),
    sheetName: zod_1.z.string().optional()
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, sheetName }) {
    try {
        const file = yield promises_1.default.readFile(path);
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
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true
        };
    }
}));
// write
server.tool("write_excel", {
    path: zod_1.z.string(),
    sheetName: zod_1.z.string(),
    data: zod_1.z.array(zod_1.z.record(zod_1.z.any()))
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, sheetName, data }) {
    try {
        const file = yield promises_1.default.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        const worksheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName, true); // overwrite if exists
        xlsx.writeFile(workbook, path);
        return {
            content: [{ type: "text", text: `Sheet "${sheetName}" updated in ${path}` }]
        };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true
        };
    }
}));
// list sheets
server.tool("list_sheets", {
    path: zod_1.z.string()
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path }) {
    try {
        const file = yield promises_1.default.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        return {
            content: [{
                    type: "text",
                    text: `Sheets in ${path}:\n- ${workbook.SheetNames.join("\n- ")}`
                }]
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: `Error: ${err.message}`
                }],
            isError: true
        };
    }
}));
// get headers
server.tool("get_headers", {
    path: zod_1.z.string(),
    sheetName: zod_1.z.string().optional()
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, sheetName }) {
    var _b;
    try {
        const file = yield promises_1.default.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        const target = sheetName || workbook.SheetNames[0];
        const sheet = workbook.Sheets[target];
        if (!sheet) {
            throw new Error(`Sheet "${target}" not found`);
        }
        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const headers = (_b = rows[0]) !== null && _b !== void 0 ? _b : [];
        return {
            content: [{
                    type: "text",
                    text: `Headers in ${target}:\n- ${headers.join("\n- ")}`
                }]
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: `Error: ${err.message}`
                }],
            isError: true
        };
    }
}));
// append rows
server.tool("append_rows", {
    path: zod_1.z.string(),
    sheetName: zod_1.z.string(),
    data: zod_1.z.array(zod_1.z.record(zod_1.z.any()))
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, sheetName, data }) {
    try {
        const file = yield promises_1.default.readFile(path);
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
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: `Error: ${err.message}`
                }],
            isError: true
        };
    }
}));
// sum column (need to add a bunch more of these to mimic excel functions later)
server.tool("sum_column", {
    path: zod_1.z.string(),
    sheetName: zod_1.z.string(),
    column: zod_1.z.string()
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ path, sheetName, column }) {
    try {
        const file = yield promises_1.default.readFile(path);
        const workbook = xlsx.read(file, { type: "buffer" });
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }
        const rows = xlsx.utils.sheet_to_json(sheet);
        let sum = 0;
        let count = 0;
        for (const row of rows) {
            const val = row[column];
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
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: `Error: ${err.message}`
                }],
            isError: true
        };
    }
}));
// Main entrypoint
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new stdio_js_1.StdioServerTransport();
        yield server.connect(transport);
    });
}
main();
