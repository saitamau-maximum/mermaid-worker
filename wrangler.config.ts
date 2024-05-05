import { defineConfig } from "twrangler";

export default defineConfig({
  name: "mermaid-worker",
  main: "src/index.ts",
  compatibility_date: "2024-04-03",
  compatibility_flags: ["nodejs_compat"],
  browser: {
    binding: "MERMAID_BROWSER",
  },
  kv_namespaces: [
    {
      binding: "MERMAID_KV",
      id: "a58683928f264fb99e257fcc5c09feee",
    },
  ],
});
