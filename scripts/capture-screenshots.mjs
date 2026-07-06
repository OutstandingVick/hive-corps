import { spawn } from "node:child_process";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const outputDir = path.join(root, "proof/screenshots");
const port = process.env.SCREENSHOT_PORT || "8790";
const baseUrl = `http://127.0.0.1:${port}`;

const runtimeNodeModules = process.env.WORKSPACE_NODE_MODULES
  || "/Users/macbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const requireFromRuntime = createRequire(`${runtimeNodeModules}/`);
const { chromium } = requireFromRuntime("playwright");

function resolveChromeExecutable() {
  const candidates = [
    process.env.CHROME_EXECUTABLE,
    chromium.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ].filter(Boolean);

  return candidates.find((candidate) => fsSync.existsSync(candidate));
}

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Server did not start at ${baseUrl}`);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const server = spawn("npm", ["start"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: port,
      DEMO_MODE: "true"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer();

    const executablePath = resolveChromeExecutable();
    if (!executablePath) {
      throw new Error("No Chrome/Chromium executable found. Set CHROME_EXECUTABLE to capture screenshots.");
    }

    const browser = await chromium.launch({
      headless: true,
      executablePath
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForSelector(".dashboard-shell");

    await page.screenshot({
      path: path.join(outputDir, "hero-dashboard.png"),
      fullPage: false
    });

    await page.locator(".dashboard-shell").screenshot({
      path: path.join(outputDir, "agent-timeline.png")
    });

    await page.getByRole("button", { name: "Run learned second quote" }).click();
    await page.waitForTimeout(400);
    await page.locator(".dashboard-shell").screenshot({
      path: path.join(outputDir, "learning-loop.png")
    });

    await page.locator("#architecture").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.locator("#architecture").screenshot({
      path: path.join(outputDir, "architecture.png")
    });

    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }

  console.log("Screenshots captured:");
  console.log("- proof/screenshots/hero-dashboard.png");
  console.log("- proof/screenshots/agent-timeline.png");
  console.log("- proof/screenshots/learning-loop.png");
  console.log("- proof/screenshots/architecture.png");
  if (serverOutput.includes("Error")) {
    console.log(serverOutput);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
