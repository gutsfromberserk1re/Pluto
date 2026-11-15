import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import os from "node:os";

const frontendRoot = resolve(process.cwd(), "Frontdoor");
const mime = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = resolve(frontendRoot, relative);
    if (file !== frontendRoot && !file.startsWith(`${frontendRoot}${sep}`)) {
      response.writeHead(403).end("forbidden");
      return;
    }
    const contents = await readFileSync(file);
    response.writeHead(200, { "content-type": mime.get(extname(file)) || "application/octet-stream", "cache-control": "no-store" });
    response.end(contents);
  } catch {
    response.writeHead(404).end("not found");
  }
});

const listen = new Promise((resolveListen, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => resolveListen(server.address().port));
});

async function verifyEditorBehavior(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?perfbench=1&clips=4`, { waitUntil: "load" });
  await page.waitForFunction(() => typeof window.editor?.measurePreview === "function", null, { timeout: 15_000 });
  await page.evaluate(() => window.editor.setTime(2));
  if (await page.locator(".ed-layer").count() === 0) throw new Error("Preview smoke check found no rendered layers");

  await page.keyboard.press("k");
  let keyframes = await page.evaluate(() => window.editor.getProject().clips[0].keyframes?.length || 0);
  if (keyframes !== 1) throw new Error(`Keyframe add failed; got ${keyframes}`);
  await page.keyboard.press("k");
  keyframes = await page.evaluate(() => window.editor.getProject().clips[0].keyframes?.length || 0);
  if (keyframes !== 0) throw new Error(`Keyframe delete failed; got ${keyframes}`);

  await page.evaluate(() => window.editor.play());
  await page.waitForTimeout(80);
  await page.evaluate(() => window.editor.pause());

  const clip = page.locator('.ed-clip[data-id="bench-1"]');
  await clip.scrollIntoViewIfNeeded();
  let box = await clip.boundingBox();
  if (!box) throw new Error("Timeline smoke clip is not visible");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  let project = await page.evaluate(() => window.editor.getProject());
  if (!(project.clips.find((item) => item.id === "bench-1")?.start > 1)) throw new Error("Timeline move smoke check failed");

  box = await clip.boundingBox();
  if (!box) throw new Error("Moved timeline clip is not visible");
  const rightHandle = await clip.locator(".ed-clip__h--r").boundingBox();
  if (!rightHandle) throw new Error("Timeline trim handle is not visible");
  await page.mouse.move(rightHandle.x + rightHandle.width / 2, rightHandle.y + rightHandle.height / 2);
  await page.mouse.down();
  await page.mouse.move(rightHandle.x + rightHandle.width / 2 + 48, rightHandle.y + rightHandle.height / 2, { steps: 6 });
  await page.mouse.up();
  project = await page.evaluate(() => window.editor.getProject());
  if (!(project.clips.find((item) => item.id === "bench-1")?.dur > 6.5)) throw new Error("Timeline trim smoke check failed");

  await page.evaluate(() => window.editor.setTime(window.editor.getProject().clips.find((item) => item.id === "bench-1").start + 1));
  await page.keyboard.press("c");
  box = await clip.boundingBox();
  await page.mouse.click(box.x + 28, box.y + box.height / 2);
  project = await page.evaluate(() => window.editor.getProject());
  if (project.clips.length !== 5) throw new Error(`Timeline split smoke check failed; got ${project.clips.length} clips`);
  await page.keyboard.press("Delete");
  project = await page.evaluate(() => window.editor.getProject());
  if (project.clips.length !== 4) throw new Error(`Timeline delete smoke check failed; got ${project.clips.length} clips`);
  await page.keyboard.press("Control+z");
  project = await page.evaluate(() => window.editor.getProject());
  if (project.clips.length !== 5) throw new Error(`Timeline undo smoke check failed; got ${project.clips.length} clips`);
  await page.keyboard.press("Control+Shift+z");
  project = await page.evaluate(() => window.editor.getProject());
  if (project.clips.length !== 4) throw new Error(`Timeline redo smoke check failed; got ${project.clips.length} clips`);

  await page.close();
  if (errors.length) throw new Error(`Editor smoke-check page errors: ${errors.join(" | ")}`);
}

let browser;
try {
  const port = await listen;
  browser = await chromium.launch({ headless: true });
  await verifyEditorBehavior(browser, port);
  let cpuFlags = "unavailable";
  try {
    const cpuInfo = readFileSync("/proc/cpuinfo", "utf8");
    cpuFlags = cpuInfo.match(/^flags\s*:\s*(.+)$/m)?.[1]?.trim().replaceAll(" ", ";") || cpuFlags;
  } catch { /* Non-Linux local runs still report architecture and processor model. */ }

  const host = os.cpus()[0]?.model?.replaceAll(",", " ") || "unknown";
  process.stdout.write(`# host_arch=${process.arch},cpu=${host},cpu_flags=${cpuFlags}\n`);
  process.stdout.write(`# browser=Chromium ${browser.version()}\n`);
  process.stdout.write("clip_count,mode,warmup,iterations,mean_ns,median_ns,p95_ns,renders_per_sec\n");

  for (const clipCount of [100, 500, 1_000]) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/index.html?perfbench=1&clips=${clipCount}`, { waitUntil: "load" });
    await page.waitForFunction(() => typeof window.editor?.measurePreview === "function", null, { timeout: 15_000 });
    const results = [];
    for (const mode of ["linear", "indexed"]) {
      results.push(await page.evaluate((mode) => window.editor.measurePreview({ mode, warmup: 40, iterations: 300 }), mode));
    }
    if (pageErrors.length) throw new Error(`Preview benchmark page errors: ${pageErrors.join(" | ")}`);
    for (const result of results) {
      process.stdout.write(`${result.clipCount},${result.mode},${result.warmup},${result.iterations},${result.meanNs.toFixed(2)},${result.medianNs.toFixed(2)},${result.p95Ns.toFixed(2)},${(1e9 / result.meanNs).toFixed(2)}\n`);
    }
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolveClose) => server.close(() => resolveClose()));
}
