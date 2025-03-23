import express from "express";
import { google } from "googleapis";
import open from "open";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3456;

const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const TOKEN_PATH = path.resolve(process.cwd(), "tokens.json");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  REDIRECT_URI
);

const SCOPES = ["https://mail.google.com/"];

async function startOAuthFlow() {
  const app = express();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // ensure refresh_token is always returned
    scope: SCOPES,
  });

  console.log("🔐 Opening browser for OAuth...");
  await open(authUrl);

  return new Promise((resolve, reject) => {
    app.get("/oauth2callback", async (req, res) => {
      const code = req.query.code as string;

      if (!code) {
        res.status(400).send("Missing authorization code.");
        return reject("No auth code");
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
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
      } catch (err) {
        console.error("❌ Failed to exchange code for tokens", err);
        res.status(500).send("Authentication failed");
        reject(err);
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Listening on http://localhost:${PORT}/oauth2callback`);
    });
  });
}

startOAuthFlow();