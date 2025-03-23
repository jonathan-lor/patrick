"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./auth");
(0, auth_1.startOAuthFlow)().then((tokens) => {
    console.log("Tokens:", tokens);
});
