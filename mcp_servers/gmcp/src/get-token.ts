import { startOAuthFlow } from "./auth";

startOAuthFlow().then((tokens) => {
  console.log("Tokens:", tokens);
});