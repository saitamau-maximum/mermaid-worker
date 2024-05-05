import puppeteer, { Browser } from "@cloudflare/puppeteer";

interface Env {
  MERMAID_BROWSER: Fetcher;
  MERMAID_KV: KVNamespace;
}

const TEMPLATE = /* html */ `
<!DOCTYPE html>
<html>
  <body>
    <div id="container"></div>
    <script type="module">
      import mermaid from "https://unpkg.com/mermaid@9/dist/mermaid.esm.min.mjs";
      globalThis.mermaid = mermaid
    </script>
  </body>
</html>
`;

const renderMermaid = async (browser: Browser, code: string) => {
  const page = await browser.newPage();
  page.on("console", (msg) => {
    console.log(msg.text());
  });
  try {
    await page.setContent(TEMPLATE);
    await page.evaluate((code) => {
      // @ts-ignore
      const { mermaid } = globalThis;
      mermaid.initialize({ startOnLoad: true });
      mermaid.mermaidAPI.render("container", code, (svg) => {
        document.body.innerHTML = svg;
      });
    }, code);
    const svg = await page.evaluate(() => document.body.innerHTML);
    return svg;
  } catch (e) {
    console.error(e);
  } finally {
    await page.close();
    return null;
  }
};

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response(
        "No code found, please provide a code in the query string",
        {
          status: 400,
        }
      );
    }
    const key = code;
    const decoded = decodeURIComponent(code);
    const value = await env.MERMAID_KV.get(key, "text");
    if (value) {
      if (value === "INVALID") {
        return new Response("Failed to render mermaid diagram", {
          status: 500,
        });
      } else {
        return new Response(value, {
          headers: {
            "Content-Type": "image/svg+xml",
          },
        });
      }
    }

    const browser = await puppeteer.launch(env.MERMAID_BROWSER);
    const svg = await renderMermaid(browser, decoded);
    if (!svg) {
      await env.MERMAID_KV.put(key, "INVALID");
      return new Response("Failed to render mermaid diagram", {
        status: 500,
      });
    }
    await env.MERMAID_KV.put(key, svg);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  },
};
