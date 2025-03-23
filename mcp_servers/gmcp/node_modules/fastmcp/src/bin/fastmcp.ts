#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { execa } from "execa";

await yargs(hideBin(process.argv))
  .scriptName("fastmcp")
  .command(
    "dev <file>",
    "Start a development server",
    (yargs) => {
      return yargs.positional("file", {
        type: "string",
        describe: "The path to the server file",
        demandOption: true,
      });
    },
    async (argv) => {
      try {
        await execa({
          stdin: "inherit",
          stdout: "inherit",
          stderr: "inherit",
        })`npx @wong2/mcp-cli npx tsx ${argv.file}`;
      } catch {
        process.exit(1);
      }
    },
  )
  .command(
    "inspect <file>",
    "Inspect a server file",
    (yargs) => {
      return yargs.positional("file", {
        type: "string",
        describe: "The path to the server file",
        demandOption: true,
      });
    },
    async (argv) => {
      try {
        await execa({
          stdout: "inherit",
          stderr: "inherit",
        })`npx @modelcontextprotocol/inspector npx tsx ${argv.file}`;
      } catch {
        process.exit(1);
      }
    },
  )
  .help()
  .parseAsync();
