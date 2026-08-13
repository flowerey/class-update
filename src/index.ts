import { appendFileSync, existsSync } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { resolve, join, dirname } from "path";
import { randomUUID } from "crypto";
import { EOL } from "os";

const ExitCode = { Success: 0, Failure: 1 } as const;

const doDebug = isDebug();
const __root = dirname(import.meta.dirname);

const options = {
  folder: getInput("folder") || "themes",
  ext: (() => {
    const ext = getInput("ext") || "css";
    return ext.startsWith(".") ? ext : "." + ext;
  })(),
  diff:
    getInput("diff") ||
    "https://codeberg.org/SyndiShanX/Update-Classes/raw/branch/pages/Changes.txt",
};

const targetFolder = resolve(process.cwd(), options.folder);

if (!existsSync(targetFolder)) {
  error(`Target folder not found: ${targetFolder}`);
  process.exit(ExitCode.Failure);
}

const pairs = await getPairs(options.diff);
if (pairs.size === 0) {
  setOutput("totalChanges", 0);
  setOutput("changed", false);
  process.exit(ExitCode.Success);
}

// class names can contain letters, digits, _ and - (eg `chat-2ZfjoI`), plus / for
// discord's typography classes (eg `text-sm/medium_a25714`). in css a / has to be
// escaped, so `\` is matched too and stripped before looking a token up
const tokenRegex = /[A-Za-z_][A-Za-z0-9_\-\\/]*/g;

const files: string[] = await readdir(targetFolder, { recursive: true });
const filePaths = files
  .filter((f: string) => f.endsWith(options.ext))
  .map((f: string) => join(targetFolder, f));

if (doDebug) debug(`Found ${filePaths.length} files`);

const results = await Promise.all(
  filePaths.map(async (fullPath: string) => {
    const content = await readFile(fullPath, "utf8");
    let count = 0;

    // one pass per file instead of one pass per pair, so a class that's already
    // been replaced is never replaced again, and 79k pairs stay cheap
    const result = content.replace(tokenRegex, (token: string) => {
      const escaped = token.includes("\\");
      const newClass = pairs.get(escaped ? token.replaceAll("\\", "") : token);
      if (!newClass) return token;
      count++;
      return escaped ? newClass.replaceAll("/", "\\/") : newClass;
    });

    if (count > 0) {
      await writeFile(fullPath, result);
      const relativeName = fullPath.replace(targetFolder + "/", "");
      if (doDebug) debug(`Updated ${relativeName}: ${count} changes`);
    }
    return count;
  }),
);

const totalChanges = results.reduce(
  (sum: number, n: number) => sum + n,
  0,
);

setOutput("totalChanges", totalChanges);
setOutput("changed", totalChanges > 0);

if (doDebug) {
  debug(`${totalChanges} changes`);
}

async function getPairs(diffSource: string): Promise<Map<string, string>> {
  let rawData: string = "";
  try {
    if (diffSource.startsWith("http")) {
      debug(`Fetching diff: ${diffSource}`);
      const resp = await fetch(diffSource);
      if (!resp.ok) {
        error(`Failed to fetch diff: ${resp.status} ${resp.url}`);
        process.exit(ExitCode.Failure);
      }
      rawData = await resp.text();
    } else {
      // check the workspace first, the actions own folder second (old behavior)
      let found = false;
      for (const path of [resolve(process.cwd(), diffSource), join(__root, diffSource)]) {
        if (!existsSync(path)) continue;
        debug(`Using local diff source: ${path}`);
        rawData = await readFile(path, "utf8");
        found = true;
        break;
      }
      if (!found) {
        error(`Invalid diff source: ${diffSource}`);
        process.exit(ExitCode.Failure);
      }
    }
  } catch (err) {
    error(
      `Error reading diff source: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(ExitCode.Failure);
  }

  return buildPairs(rawData);
}

/**
 * the changelist is old & new class names on alternating lines, and it's a history,
 * so a class can get renamed more than once (a -> b, then b -> c). following each
 * rename to a name that never gets renamed again lets a theme catch up in one pass
 */
function buildPairs(rawData: string): Map<string, string> {
  const lines = rawData.split(/\r?\n/).map((l: string) => l.trim());

  const final = new Map<string, string>(); // original -> current
  const byCurrent = new Map<string, string[]>(); // current -> originals pointing at it

  for (let i = 0; i < lines.length; i += 2) {
    const oldClass = lines[i];
    const newClass = lines[i + 1];
    // a class name is a single token, so anything with whitespace is malformed
    if (!oldClass || !newClass || oldClass === newClass) continue;
    if (/\s/.test(oldClass) || /\s/.test(newClass)) continue;

    const origs = byCurrent.get(oldClass) ?? [];
    if (!final.has(oldClass)) origs.push(oldClass);

    for (const orig of origs) final.set(orig, newClass);
    byCurrent.delete(oldClass);

    const existing = byCurrent.get(newClass);
    if (existing) existing.push(...origs);
    else byCurrent.set(newClass, origs);
  }

  // the changelist isn't perfectly ordered, so a rename can land on a name an
  // earlier line already renamed. one more pass settles those
  for (const [oldClass, newClass] of final) {
    const seen = new Set([oldClass]);
    let current = newClass;
    while (final.has(current) && !seen.has(current)) {
      seen.add(current);
      current = final.get(current)!;
    }

    // a chain can lead back to where it started (a -> b -> a)
    if (current === oldClass) final.delete(oldClass);
    else final.set(oldClass, current);
  }

  debug(`${final.size} pairs`);
  return final;
}

function getInput(name: string): string {
  const val =
    process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] ?? "";
  return val.trim();
}

function isDebug(): boolean {
  return process.env["RUNNER_DEBUG"] === "1";
}

function toCommandValue(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input === "string") return input;
  return JSON.stringify(input);
}

function escapeData(s: string): string {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function escapeProperty(s: string): string {
  return escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}

function issueCommand(
  command: string,
  properties: Record<string, string>,
  message: string,
): void {
  const props = Object.entries(properties)
    .map(([k, v]) => `${escapeProperty(k)}=${escapeProperty(v)}`)
    .join(",");
  process.stdout.write(
    `::${command}${props ? ` ${props}` : ""}::${escapeData(message)}${EOL}`,
  );
}

function setOutput(name: string, value: unknown): void {
  const filePath = process.env["GITHUB_OUTPUT"] || "";
  if (filePath) {
    const delimiter = `ghadelimiter_${randomUUID()}`;
    const msg = `${name}<<${delimiter}${EOL}${toCommandValue(value)}${EOL}${delimiter}`;
    if (!existsSync(filePath)) {
      throw new Error(`Missing file at path: ${filePath}`);
    }
    appendFileSync(filePath, `${msg}${EOL}`, { encoding: "utf8" });
    return;
  }
  process.stdout.write(EOL);
  issueCommand("set-output", { name }, toCommandValue(value));
}

function debug(message: string): void {
  issueCommand("debug", {}, message);
}

function error(message: string | Error): void {
  issueCommand("error", {}, message instanceof Error ? message.toString() : message);
}