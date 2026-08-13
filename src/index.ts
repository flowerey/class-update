import { appendFileSync, existsSync } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { resolve, join } from "path";
import { randomUUID } from "crypto";
import { EOL } from "os";

const ExitCode = { Success: 0, Failure: 1 } as const;

const doDebug = isDebug();

const options = {
  folder: getInput("folder") || "themes",
  ext: (() => {
    const ext = getInput("ext") || "css";
    return ext.startsWith(".") ? ext : "." + ext;
  })(),
  diff:
    getInput("diff") ||
    "https://raw.githubusercontent.com/Saltssaumure/Update-Classes/main/Changes.txt",
};

const targetFolder = resolve(process.cwd(), options.folder);

if (!existsSync(targetFolder)) {
  error(`Target folder not found: ${targetFolder}`);
  process.exit(ExitCode.Failure);
}

const pairs = await getPairs(options.diff);
if (pairs.length === 0) {
  setOutput("totalChanges", 0);
  setOutput("changed", false);
  process.exit(ExitCode.Success);
}

const replacementMap = new Map<string, string>(pairs);
const keys = Array.from(replacementMap.keys());

let transform: (content: string) => { result: string; count: number };

if (shouldFallback(keys)) {
  const pattern = new RegExp(
    `\\b(${keys
      .map((k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})\\b`,
    "g",
  );
  transform = (content: string) => {
    let count = 0;
    const result = content.replace(pattern, (matched: string) => {
      count++;
      return replacementMap.get(matched)!;
    });
    return { result, count };
  };
} else {
  transform = (content: string) => replaceWithMap(content, replacementMap);
}

const files: string[] = await readdir(targetFolder, { recursive: true });
const filePaths = files
  .filter((f: string) => f.endsWith(options.ext))
  .map((f: string) => join(targetFolder, f));

const results = await Promise.all(
  filePaths.map(async (fullPath: string) => {
    const content = await readFile(fullPath, "utf8");
    const { result, count: fileCount } = transform(content);

    if (fileCount > 0) {
      await writeFile(fullPath, result);
      const relativeName = fullPath.replace(targetFolder + "/", "");
      if (doDebug) debug(`Updated ${relativeName}: ${fileCount} changes`);
      return { relativeName, count: fileCount };
    }
    return { count: 0 };
  }),
);

const totalChanges = results.reduce(
  (sum: number, res: { count: number }) => sum + res.count,
  0,
);

setOutput("totalChanges", totalChanges);
setOutput("changed", totalChanges > 0);

async function getPairs(diffSource: string): Promise<Array<[string, string]>> {
  let rawData: string = "";
  try {
    if (diffSource.startsWith("http")) {
      const resp = await fetch(diffSource);
      if (!resp.ok) {
        error(`Failed to fetch diff: ${resp.status}`);
        process.exit(ExitCode.Failure);
      }
      rawData = await resp.text();
    } else {
      rawData = await readFile(resolve(process.cwd(), diffSource), "utf8");
    }
  } catch (err) {
    error(
      `Error reading diff source: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(ExitCode.Failure);
  }

  const lines = rawData
    .split(/\r?\n/)
    .map((l: string) => l.trim())
    .filter(Boolean);

  const pairs: Array<[string, string]> = [];

  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i] && lines[i + 1] && lines[i] !== lines[i + 1]) {
      pairs.push([lines[i], lines[i + 1]]);
    }
  }
  return pairs;
}

function isWord(c: string): boolean {
  return (
    (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    (c >= "0" && c <= "9") ||
    c === "_"
  );
}

function replaceWithMap(
  text: string,
  map: Map<string, string>,
): { result: string; count: number } {
  const RUN = /[A-Za-z0-9_-]+/g;
  let out = "";
  let last = 0;
  let count = 0;
  let m: RegExpExecArray | null;

  while ((m = RUN.exec(text)) !== null) {
    const runStart = m.index;
    const runEnd = runStart + m[0].length;
    out += text.slice(last, runStart);

    let cursor = runStart;
    while (cursor < runEnd) {
      if (cursor === runStart || text[cursor - 1] === "-") {
        let matchedKey: string | undefined;
        for (let q = cursor + 1; q <= runEnd; q++) {
          const key = text.slice(cursor, q);
          if (map.has(key)) {
            const bw = isWord(text[q - 1]);
            const aw = q < text.length ? isWord(text[q]) : false;
            if (bw !== aw) {
              matchedKey = key;
            }
            break;
          }
        }
        if (matchedKey !== undefined) {
          out += map.get(matchedKey)!;
          count++;
          cursor += matchedKey.length;
          continue;
        }
      }
      out += text[cursor];
      cursor++;
    }
    last = runEnd;
  }
  out += text.slice(last);
  return { result: out, count };
}

function shouldFallback(keys: string[]): boolean {
  for (const k of keys) {
    if (k.charCodeAt(0) === 45) return true;
    for (let j = 0; j < k.length; j++) {
      const c = k.charCodeAt(j);
      const ok =
        (c >= 48 && c <= 57) ||
        (c >= 65 && c <= 90) ||
        (c >= 97 && c <= 122) ||
        c === 45 ||
        c === 95;
      if (!ok) return true;
    }
  }
  const sorted = [...keys].sort();
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].length < sorted[i].length && sorted[i].startsWith(sorted[i - 1])) {
      return true;
    }
  }
  return false;
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