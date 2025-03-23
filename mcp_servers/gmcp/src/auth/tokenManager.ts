import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const TOKENS_FILE = path.resolve(process.cwd(), "tokens.json");

export const createOAuthClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!,
    process.env.REDIRECT_URI!
  );

  if (fs.existsSync(TOKENS_FILE)) {
    const raw = fs.readFileSync(TOKENS_FILE, "utf-8");
    const tokens = JSON.parse(raw);
    oauth2Client.setCredentials(tokens);
  } else {
    console.warn("⚠️ No tokens found. Run `get-token.ts` first.");
  }

  oauth2Client.on("tokens", (newTokens) => {
    console.log("🔄 Tokens refreshed, updating tokens.json");
    const updated = { ...oauth2Client.credentials, ...newTokens };
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(updated, null, 2));
  });

  return oauth2Client;
};