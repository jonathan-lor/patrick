"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOAuthClient = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TOKENS_FILE = path_1.default.resolve(process.cwd(), "tokens.json");
const createOAuthClient = () => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
    if (fs_1.default.existsSync(TOKENS_FILE)) {
        const raw = fs_1.default.readFileSync(TOKENS_FILE, "utf-8");
        const tokens = JSON.parse(raw);
        oauth2Client.setCredentials(tokens);
    }
    else {
        console.warn("⚠️ No tokens found. Run `get-token.ts` first.");
    }
    oauth2Client.on("tokens", (newTokens) => {
        console.log("🔄 Tokens refreshed, updating tokens.json");
        const updated = Object.assign(Object.assign({}, oauth2Client.credentials), newTokens);
        fs_1.default.writeFileSync(TOKENS_FILE, JSON.stringify(updated, null, 2));
    });
    return oauth2Client;
};
exports.createOAuthClient = createOAuthClient;
