#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import dotenv from 'dotenv'

dotenv.config()

// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  throw new Error('Missing Google OAuth environment variables');
}

class GmailMCPServer {
  private server: Server;
  private auth;
  private gmail;

  constructor() {
    this.server = new Server(
      { name: 'gmail-mcp-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );

    // Initialize OAuth2
    this.auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    this.auth.setCredentials({ refresh_token: REFRESH_TOKEN });

    // Initialize Gmail API
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });

    this.setupToolHandlers();

    this.server.onerror = (err) => console.error('[MCP Error]', err);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      switch (name) {
        case 'list_emails':
          return await this.handleListEmails(args);
        case 'send_email':
          return await this.handleSendEmail(request.params.arguments);
        case "download_attachment":
          return await this.handleDownloadAttachment(request.params.arguments);
        case "send_email_with_attachment":
            return await this.handleSendEmailWithAttachment(request.params.arguments);
        case "list_message_attachments":
              return await this.handleListMessageAttachments(request.params.arguments);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  private async handleListEmails(args: any) {
    try {
      const maxResults = args?.maxResults || 5;
      const query = args?.query || '';

      const res = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = res.data.messages || [];

      const emails = await Promise.all(
        messages.map(async (msg) => {
          const detail = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date'],
          });

          const headers = detail.data.payload?.headers || [];
          const get = (key: string) =>
            headers.find((h) => h.name === key)?.value || '';

          return {
            id: msg.id,
            from: get('From'),
            subject: get('Subject'),
            date: get('Date'),
            snippet: detail.data.snippet,
          };
        })
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(emails, null, 2),
          },
        ],
      };
    } catch (error: any) {
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
  }

  private async handleSendEmail(args: any) {
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
  
      const res = await this.gmail.users.messages.send({
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
    } catch (error: any) {
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
  }

  private async handleDownloadAttachment(args: any) {
    const { messageId, attachmentId, filename = "attachment" } = args;
  
    try {
      const response = await this.gmail.users.messages.attachments.get({
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
    } catch (error: any) {
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
  }

  private async handleSendEmailWithAttachment(args: any) {
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
  
      const response = await this.gmail.users.messages.send({
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
    } catch (error: any) {
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
  }

  private async handleListMessageAttachments(args: any) {
    const { messageId } = args;
  
    try {
      const res = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });
  
      const parts = res.data.payload?.parts || [];
  
      const attachments = parts
        .filter((part) => part.filename && part.body?.attachmentId)
        .map((part) => ({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body?.size,
          attachmentId: part.body?.attachmentId,
          partId: part.partId,
        }));
  
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
    } catch (error: any) {
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
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gmail MCP server running on stdio');
  }
}

const server = new GmailMCPServer();
server.run().catch(console.error);