import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium, Browser, Page } from "playwright";

const server = new Server({
  name: "mcp-playwright",
  version: "0.1.0",
}, {
  capabilities: {
    tools: {},
  }
});

let browser: Browser | null = null;
let page: Page | null = null;

async function ensurePage() {
  if (!browser) browser = await chromium.launch({ headless: true });
  if (!page) {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
  }
  return page;
}

server.tool("goto", {
  description: "Navigate the browser to a URL",
  inputSchema: {
    type: "object",
    properties: { url: { type: "string" } },
    required: ["url"],
  },
}, async (args: unknown) => {
  const schema = z.object({ url: z.string().url() });
  const { url } = schema.parse(args);
  const p = await ensurePage();
  const resp = await p.goto(url, { waitUntil: "domcontentloaded" });
  return { ok: true, status: resp?.status() };
});

server.tool("screenshot", {
  description: "Take a screenshot and save to a path",
  inputSchema: {
    type: "object",
    properties: { path: { type: "string" }, fullPage: { type: "boolean" } },
    required: ["path"],
  },
}, async (args: unknown) => {
  const schema = z.object({ path: z.string(), fullPage: z.boolean().optional() });
  const { path, fullPage } = schema.parse(args);
  const p = await ensurePage();
  await p.screenshot({ path, fullPage: fullPage ?? true });
  return { ok: true, path };
});

server.tool("close", {
  description: "Close the browser",
  inputSchema: { type: "object", properties: {} },
}, async () => {
  if (browser) await browser.close();
  browser = null; page = null;
  return { ok: true };
});

server.tool("gotoAndWait", {
  description: "Navigate to a URL and optionally wait for a selector",
  inputSchema: {
    type: "object",
    properties: { url: { type: "string" }, selector: { type: "string" } },
    required: ["url"],
  },
}, async (args) => {
  const schema = z.object({ url: z.string().url(), selector: z.string().optional() });
  const { url, selector } = schema.parse(args);
  const p = await ensurePage();
  await p.goto(url, { waitUntil: "domcontentloaded" });
  if (selector) {
    await p.waitForSelector(selector, { state: "visible" });
  }
  return { ok: true };
});

server.tool("collectLikeData", {
  description: "Collect like buttons data from the community feed",
  inputSchema: { type: "object", properties: {} },
}, async () => {
  const p = await ensurePage();
  const data = await p.evaluate(() => {
    const items: Array<{ postId: number; likesCount: number; isLiked: boolean }> = [];
    const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-testid^="post-like-button-"]');
    buttons.forEach((btn) => {
      const idAttr = btn.getAttribute('data-post-id');
      const postId = idAttr ? Number(idAttr) : NaN;
      const countSpan = btn.querySelector<HTMLSpanElement>('span[data-testid^="post-like-count-"]');
      const likesCount = Number((countSpan?.textContent || '0').trim() || '0');
      const isLiked = btn.classList.contains('text-red-500') || !!btn.querySelector('svg.fill-current');
      if (!Number.isNaN(postId)) {
        items.push({ postId, likesCount, isLiked });
      }
    });
    return items;
  });
  return { ok: true, data };
});

server.tool("clickLikeByPostId", {
  description: "Click the like button for a given postId and report outcome",
  inputSchema: {
    type: "object",
    properties: { postId: { type: "number" }, timeout: { type: "number" } },
    required: ["postId"],
  },
}, async (args) => {
  const schema = z.object({ postId: z.number().int().positive(), timeout: z.number().int().positive().optional() });
  const { postId, timeout } = schema.parse(args);
  const p = await ensurePage();

  const buttonSel = `button[data-testid="post-like-button-${postId}"]`;
  const countSel = `span[data-testid="post-like-count-${postId}"]`;
  await p.waitForSelector(buttonSel, { state: "attached" });
  const beforeText = await p.locator(countSel).first().textContent().catch(() => null);
  const beforeCount = Number((beforeText || '0').trim() || '0');

  let dialogMessage: string | null = null;
  const onDialog = (d: any) => { dialogMessage = d.message(); d.dismiss().catch(() => {}); };
  p.on('dialog', onDialog);

  await p.click(buttonSel);

  const waitMs = timeout ?? 1500;
  await p.waitForTimeout(waitMs);

  p.off('dialog', onDialog);

  const afterText = await p.locator(countSel).first().textContent().catch(() => null);
  const afterCount = Number((afterText || '0').trim() || '0');

  if (dialogMessage) {
    return { ok: false, type: 'alert', message: dialogMessage, beforeCount, afterCount };
  }

  const changed = afterCount !== beforeCount;
  return { ok: true, type: changed ? 'countChanged' : 'noChange', beforeCount, afterCount };
});

const transport = new StdioServerTransport();
await server.connect(transport);
