// auth.ts
import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import open from "open";

dotenv.config();

const app = express();
const PORT = 3456;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!,
  process.env.REDIRECT_URI!
);

// Step 1: Generate Auth URL
const SCOPES = ["https://mail.google.com/"];

export const startOAuthFlow = async () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent"
  });

  console.log("Opening browser for OAuth...");
  await open(authUrl);

  return new Promise((resolve, reject) => {
    app.get("/oauth2callback", async (req, res) => {
      const code = req.query.code as string;

      if (!code) {
        res.status(400).send("Missing code");
        return reject("No code");
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.send("Auth successful! You can close this window.");
        resolve(tokens);
      } catch (err) {
        console.error("Error getting tokens:", err);
        res.status(500).send("Auth failed");
        reject(err);
      }
    });

    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  });
};