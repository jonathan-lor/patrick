#!/usr/bin/env node
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
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing Google OAuth environment variables');
}
class GmailMCPServer {
    constructor() {
        this.server = new index_js_1.Server({ name: 'gmail-mcp-server', version: '0.1.0' }, { capabilities: { tools: {} } });
        // Initialize OAuth2
        this.auth = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        this.auth.setCredentials({ refresh_token: REFRESH_TOKEN });
        // Initialize Gmail API
        this.gmail = googleapis_1.google.gmail({ version: 'v1', auth: this.auth });
        this.setupToolHandlers();
        this.server.onerror = (err) => console.error('[MCP Error]', err);
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            yield this.server.close();
            process.exit(0);
        }));
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(this, void 0, void 0, function* () {
            return ({
                tools: [
                    {
                        name: 'list_emails',
                        description: 'List recent Gmail inbox messages',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                maxResults: {
                                    type: 'number',
                                    description: 'Maximum number of emails to return',
                                },
                                query: {
                                    type: 'string',
                                    description: 'Gmail search query (optional)',
                                },
                            },
                        },
                    },
                    {
                        name: 'send_email',
                        description: 'Send an email from your Gmail account',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                to: {
                                    type: 'string',
                                    description: 'Recipient email address',
                                },
                                subject: {
                                    type: 'string',
                                    description: 'Subject line',
                                },
                                body: {
                                    type: 'string',
                                    description: 'Email body (plain text)',
                                },
                            },
                            required: ['to', 'subject', 'body'],
                        },
                    },
                    {
                        name: "download_attachment",
                        description: "Download an attachment from a Gmail message",
                        inputSchema: {
                            type: "object",
                            properties: {
                                messageId: {
                                    type: "string",
                                    description: "The Gmail message ID containing the attachment",
                                },
                                attachmentId: {
                                    type: "string",
                                    description: "The attachment ID to download",
                                },
                                filename: {
                                    type: "string",
                                    description: "Suggested filename (optional)",
                                },
                            },
                            required: ["messageId", "attachmentId"]
                        },
                    },
                    {
                        name: "send_email_with_attachment",
                        description: "Send an email with an attachment",
                        inputSchema: {
                            type: "object",
                            properties: {
                                to: { type: "string" },
                                subject: { type: "string" },
                                body: { type: "string" },
                                filename: { type: "string" },
                                fileBase64: {
                                    type: "string",
                                    description: "Base64-encoded file content",
                                },
                            },
                            required: ["to", "subject", "body", "filename", "fileBase64"]
                        },
                    },
                    {
                        name: "list_message_attachments",
                        description: "List all attachments in a Gmail message",
                        inputSchema: {
                            type: "object",
                            properties: {
                                messageId: {
                                    type: "string",
                                    description: "The Gmail message ID",
                                },
                            },
                            required: ["messageId"],
                        },
                    }
                ],
            });
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'list_emails':
                    return yield this.handleListEmails(args);
                case 'send_email':
                    return yield this.handleSendEmail(request.params.arguments);
                case "download_attachment":
                    return yield this.handleDownloadAttachment(request.params.arguments);
                case "send_email_with_attachment":
                    return yield this.handleSendEmailWithAttachment(request.params.arguments);
                case "list_message_attachments":
                    return yield this.handleListMessageAttachments(request.params.arguments);
                default:
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        }));
    }
    handleListEmails(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const maxResults = (args === null || args === void 0 ? void 0 : args.maxResults) || 5;
                const query = (args === null || args === void 0 ? void 0 : args.query) || '';
                const res = yield this.gmail.users.messages.list({
                    userId: 'me',
                    q: query,
                    maxResults,
                });
                const messages = res.data.messages || [];
                const emails = yield Promise.all(messages.map((msg) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const detail = yield this.gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id,
                        format: 'metadata',
                        metadataHeaders: ['From', 'Subject', 'Date'],
                    });
                    const headers = ((_a = detail.data.payload) === null || _a === void 0 ? void 0 : _a.headers) || [];
                    const get = (key) => { var _a; return ((_a = headers.find((h) => h.name === key)) === null || _a === void 0 ? void 0 : _a.value) || ''; };
                    return {
                        id: msg.id,
                        from: get('From'),
                        subject: get('Subject'),
                        date: get('Date'),
                        snippet: detail.data.snippet,
                    };
                })));
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(emails, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error fetching emails: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    handleSendEmail(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { to, subject, body } = args;
                const rawMessage = [
                    `To: ${to}`,
                    `Subject: ${subject}`,
                    'Content-Type: text/plain; charset="UTF-8"',
                    'MIME-Version: 1.0',
                    '',
                    body,
                ].join('\r\n');
                const encodedMessage = Buffer.from(rawMessage)
                    .toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
                const res = yield this.gmail.users.messages.send({
                    userId: 'me',
                    requestBody: {
                        raw: encodedMessage,
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `✅ Email sent! Message ID: ${res.data.id}`,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Failed to send email: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    handleDownloadAttachment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { messageId, attachmentId, filename = "attachment" } = args;
            try {
                const response = yield this.gmail.users.messages.attachments.get({
                    userId: "me",
                    messageId,
                    id: attachmentId,
                });
                const data = response.data.data;
                if (!data) {
                    throw new Error("Attachment data is empty or missing.");
                }
                // Gmail sends base64url, convert to base64
                const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
                const paddedBase64 = base64 + "=".repeat((4 - base64.length % 4) % 4);
                // ✅ Instead of decoding, return the base64 string as text
                return {
                    content: [
                        {
                            type: "text",
                            text: paddedBase64,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Error downloading attachment: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    handleSendEmailWithAttachment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, subject, body, filename, fileBase64 } = args;
            try {
                const boundary = "BOUNDARY_" + Date.now();
                const encodedAttachment = fileBase64;
                const rawMessage = [
                    `To: ${to}`,
                    `Subject: ${subject}`,
                    "MIME-Version: 1.0",
                    `Content-Type: multipart/mixed; boundary="${boundary}"`,
                    "",
                    `--${boundary}`,
                    "Content-Type: text/plain; charset=\"UTF-8\"",
                    "",
                    body,
                    "",
                    `--${boundary}`,
                    `Content-Type: application/octet-stream; name="${filename}"`,
                    "Content-Transfer-Encoding: base64",
                    `Content-Disposition: attachment; filename="${filename}"`,
                    "",
                    encodedAttachment,
                    `--${boundary}--`,
                ].join("\r\n");
                const raw = Buffer.from(rawMessage)
                    .toString("base64")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=+$/, "");
                const response = yield this.gmail.users.messages.send({
                    userId: "me",
                    requestBody: { raw },
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Email with attachment sent! Message ID: ${response.data.id}`,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to send email with attachment: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    handleListMessageAttachments(args) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { messageId } = args;
            try {
                const res = yield this.gmail.users.messages.get({
                    userId: "me",
                    id: messageId,
                });
                const parts = ((_a = res.data.payload) === null || _a === void 0 ? void 0 : _a.parts) || [];
                const attachments = parts
                    .filter((part) => { var _a; return part.filename && ((_a = part.body) === null || _a === void 0 ? void 0 : _a.attachmentId); })
                    .map((part) => {
                    var _a, _b;
                    return ({
                        filename: part.filename,
                        mimeType: part.mimeType,
                        size: (_a = part.body) === null || _a === void 0 ? void 0 : _a.size,
                        attachmentId: (_b = part.body) === null || _b === void 0 ? void 0 : _b.attachmentId,
                        partId: part.partId,
                    });
                });
                if (attachments.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `ℹ️ No attachments found in message ${messageId}.`,
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: `📎 Found ${attachments.length} attachment(s):\n\n` +
                                JSON.stringify(attachments, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Error listing attachments: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const transport = new stdio_js_1.StdioServerTransport();
            yield this.server.connect(transport);
            console.error('Gmail MCP server running on stdio');
        });
    }
}
const server = new GmailMCPServer();
server.run().catch(console.error);
