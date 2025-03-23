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
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const open_1 = __importDefault(require("open"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const TOKEN_PATH = path_1.default.resolve(process.cwd(), "tokens.json");
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, REDIRECT_URI);
const SCOPES = ["https://mail.google.com/"];
function startOAuthFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent", // ensure refresh_token is always returned
            scope: SCOPES,
        });
        console.log("🔐 Opening browser for OAuth...");
        yield (0, open_1.default)(authUrl);
        return new Promise((resolve, reject) => {
            app.get("/oauth2callback", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const code = req.query.code;
                if (!code) {
                    res.status(400).send("Missing authorization code.");
                    return reject("No auth code");
                }
                try {
                    const { tokens } = yield oauth2Client.getToken(code);
                    oauth2Client.setCredentials(tokens);
                    fs_1.default.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                    res.send("✅ Auth successful! You can close this window.");
                    console.log("\n✅ OAuth completed!");
                    console.log("📄 Saved to tokens.json");
                    console.log("\n👉 Paste this into your .env:\n");
                    console.log(`GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}`);
                    console.log(`GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET}`);
                    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
                    console.log("\n");
                    resolve(tokens);
                    process.exit(0);
                }
                catch (err) {
                    console.error("❌ Failed to exchange code for tokens", err);
                    res.status(500).send("Authentication failed");
                    reject(err);
                }
            }));
            app.listen(PORT, () => {
                console.log(`🚀 Listening on http://localhost:${PORT}/oauth2callback`);
            });
        });
    });
}
startOAuthFlow();
