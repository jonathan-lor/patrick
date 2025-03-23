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
exports.startOAuthFlow = void 0;
// auth.ts
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const open_1 = __importDefault(require("open"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3456;
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
// Step 1: Generate Auth URL
const SCOPES = ["https://mail.google.com/"];
const startOAuthFlow = () => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent"
    });
    console.log("Opening browser for OAuth...");
    yield (0, open_1.default)(authUrl);
    return new Promise((resolve, reject) => {
        app.get("/oauth2callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            const code = req.query.code;
            if (!code) {
                res.status(400).send("Missing code");
                return reject("No code");
            }
            try {
                const { tokens } = yield oauth2Client.getToken(code);
                oauth2Client.setCredentials(tokens);
                res.send("Auth successful! You can close this window.");
                resolve(tokens);
            }
            catch (err) {
                console.error("Error getting tokens:", err);
                res.status(500).send("Auth failed");
                reject(err);
            }
        }));
        app.listen(PORT, () => {
            console.log(`Listening on http://localhost:${PORT}`);
        });
    });
});
exports.startOAuthFlow = startOAuthFlow;
