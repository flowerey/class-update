import {
  debug,
  error,
  ExitCode,
  getInput,
  isDebug,
  setOutput,
} from "@actions/core";
import { existsSync, readdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { resolve, join } from "path";

const doDebug = isDebug();
const options = {
  folder: getInput("folder") || "themes",
  ext: (getInput("ext") || "css").startsWith(".")
    ? getInput("ext")
    : "." + (getInput("ext") || "css"),
  diff:
    getInput("diff") ||
    "https://raw.githubusercontent.com/SyndiShanX/Update-Classes/main/Changes.txt",
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
  process.exit(0);
}

const replacementMap = new Map(pairs);
const pattern = new RegExp(
  Array.from(replacementMap.keys())
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "g",
);

const filePaths = (readdirSync(targetFolder, { recursive: true }) as string[])
  .filter((f) => f.endsWith(options.ext))
  .map((f) => join(targetFolder, f));

let totalChanges = 0;
const stats: Record<string, number> = {};

await Promise.all(
  filePaths.map(async (fullPath) => {
    const content = await readFile(fullPath, "utf8");
    let fileCount = 0;

    const result = content.replaceAll(pattern, (matched) => {
      fileCount++;
      return replacementMap.get(matched)!;
    });

    if (fileCount > 0) {
      const relativeName = fullPath.replace(targetFolder + "/", "");
      stats[relativeName] = fileCount;
      totalChanges += fileCount;
      await writeFile(fullPath, result);
      if (doDebug) debug(`Updated ${relativeName}: ${fileCount} changes`);
    }
  }),
);

setOutput("totalChanges", totalChanges);
setOutput("changed", totalChanges > 0);

async function getPairs(diffSource: string): Promise<Array<[string, string]>> {
  let rawData: string;
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

  const lines = rawData.split(/\r?\n/).filter((line) => line.trim() !== "");
  const pairs: Array<[string, string]> = [];

  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i] && lines[i + 1] && lines[i] !== lines[i + 1]) {
      pairs.push([lines[i], lines[i + 1]]);
    }
  }
  return pairs;
}
