/* scripts/format-release-note.cjs */
/* eslint-disable no-console */

const {
  execFileSync
} = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

// 颜色输出
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

function log(color, message) {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function execGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8"
  }).trim();
}

/** @param {string | undefined} v */
function isTruthy(v) {
  const s = (v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}

function getRepoRoot() {
  return execGit(["rev-parse", "--show-toplevel"]);
}

function findLastCommitBySubject(subject, max = 300) {
  const raw = execGit(["log", "-n", String(max), "--pretty=format:%H\t%s"]);
  const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  for (const line of lines) {
    const tab = line.indexOf("\t");
    if (tab <= 0) continue;
    const sha = line.slice(0, tab);
    const subj = line.slice(tab + 1);
    if (subj === subject) return {
      sha,
      subject: subj
    };
  }
  for (const line of lines) {
    const tab = line.indexOf("\t");
    if (tab <= 0) continue;
    const sha = line.slice(0, tab);
    const subj = line.slice(tab + 1);
    if (subj.startsWith(subject)) return {
      sha,
      subject: subj
    };
  }
  throw new Error(`Cannot find commit with subject: ${subject}`);
}

function getChangedFiles(sha) {
  const raw = execGit(["show", "--name-only", "--pretty=format:", sha]);
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
}

function readFileAtCommit(sha, relPosixPath) {
  return execGit(["show", `${sha}:${relPosixPath}`]);
}

/**
 * @template T
 * @param {string} raw
 * @returns {T}
 */
function safeJsonParse(raw) {
  return /** @type {T} */ (JSON.parse(raw));
}

/**
 * @param {string} filePath
 * @param {string} changesetMd
 * @returns {ParsedChangeset}
 */
function parseChangesetMd(filePath, changesetMd) {
  const lines = changesetMd.split("\n");

  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      if (start < 0) start = i;
      else {
        end = i;
        break;
      }
    }
  }

  /** @type {ChangesetPackageBump[]} */
  const bumps = [];
  if (start >= 0 && end > start) {
    for (let i = start + 1; i < end; i += 1) {
      const line = lines[i].trim();
      if (!line) continue;

      const m = line.match(/^(?:"([^"]+)"|'([^']+)'|([^:]+))\s*:\s*(major|minor|patch)\s*$/);
      if (!m) continue;

      const name = (m[1] ?? m[2] ?? m[3] ?? "").trim();
      const bump = /** @type {BumpType} */ (m[4]);
      if (name) bumps.push({
        name,
        bump
      });
    }
  }

  const bodyLines = end >= 0 ? lines.slice(end + 1) : [];
  const body = bodyLines.join("\n").trim();

  return {
    filePath,
    bumps,
    body
  };
}

/**
 * 把 changeset body 拆成 bullet 行：
 * - 支持原本就是 "- xxx" / "* xxx" / "• xxx"
 * - 也支持纯文本多行：每行当一个 change
 * @param {string} body
 * @returns {readonly string[]}
 */
function extractChangeLines(body) {
  const raw = (body ?? "").trim();
  if (!raw) return [];

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  /** @type {string[]} */
  const out = [];
  for (const l of lines) {
    // 跳过 markdown 标题之类
    if (l.startsWith("#")) continue;

    // 统一去掉 list 前缀
    const cleaned = l.replace(/^[-*•]\s+/, "").trim();
    if (!cleaned) continue;

    out.push(cleaned);
  }

  // 如果正文是段落（没有任何列表），上面也会按行拆；够用
  return out;
}

function findWorkspacePackageJsonPaths(repoRoot) {
  const packagesDir = path.join(repoRoot, "packages");
  if (!fs.existsSync(packagesDir)) return [];

  /** @type {string[]} */
  const result = [];
  const entries = fs.readdirSync(packagesDir, {
    withFileTypes: true
  });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const pj = path.join(packagesDir, ent.name, "package.json");
    if (fs.existsSync(pj)) result.push(pj);
  }
  return result;
}

/**
 * @param {string} pkgJsonPath
 * @returns {{ name: string; version: string } | null}
 */
function readNameVersionFromFs(pkgJsonPath) {
  if (!fs.existsSync(pkgJsonPath)) return null;
  const raw = fs.readFileSync(pkgJsonPath, "utf8");
  const data = safeJsonParse(raw);

  const name = typeof data.name === "string" ? data.name : "";
  const version = typeof data.version === "string" ? data.version : "";
  if (!name || !version) return null;

  return {
    name,
    version
  };
}

/**
 * @param {string} repoRoot
 * @returns {Map<string, string>}
 */
function mapPkgNameToPackageJson(repoRoot) {
  const map = new Map();
  const pkgJsonPaths = findWorkspacePackageJsonPaths(repoRoot);
  for (const pj of pkgJsonPaths) {
    const nv = readNameVersionFromFs(pj);
    if (nv) map.set(nv.name, pj);
  }
  return map;
}

/**
 * @param {string} sha
 * @param {string} repoRoot
 * @param {string} pkgJsonPath
 * @returns {PkgVersionInfo | null}
 */
function readPackageJsonVersionFromGit(sha, repoRoot, pkgJsonPath) {
  const rel = path.relative(repoRoot, pkgJsonPath).split(path.sep).join("/");
  try {
    const raw = readFileAtCommit(sha, rel);
    const data = safeJsonParse(raw);

    const name = typeof data.name === "string" ? data.name : "";
    const version = typeof data.version === "string" ? data.version : "";
    if (!name || !version) return null;

    return {
      name,
      version,
      packageJsonPath: pkgJsonPath,
      source: "git"
    };
  } catch {
    return null;
  }
}

function readPackageJsonVersionFromFs(pkgJsonPath) {
  const nv = readNameVersionFromFs(pkgJsonPath);
  if (!nv) return null;
  return {
    name: nv.name,
    version: nv.version,
    packageJsonPath: pkgJsonPath,
    source: "fs"
  };
}

/**
 * @param {readonly PkgVersionInfo[]} versions
 * @returns {number}
 */
function maxNameLen(versions) {
  let m = 0;
  for (const v of versions) m = Math.max(m, v.name.length);
  return m;
}

/**
 * @param {string} text
 * @returns {string}
 */
function escapeNewline(text) {
  return (text ?? "").replace(/\r\n/g, "\n").trim();
}

function getPublickInfomation() {
  const repoRoot = getRepoRoot();
  process.chdir(repoRoot);

  // 你要找的 commit
  const {
    sha
  } = findLastCommitBySubject("docs: 更新版本");

  // 找这个 commit 里改动的 changeset md
  const changedFiles = getChangedFiles(sha);
  const changesetFiles = changedFiles.filter((p) => p.startsWith(".changeset/") && p.endsWith(".md"));

  /** @type {ParsedChangeset[]} */
  const changesets = [];
  for (const file of changesetFiles) {
    const md = readFileAtCommit(sha, file);
    changesets.push(parseChangesetMd(file, md));
  }

  // changeset -> 按包分发变更行
  /** @type {Map<string, Set<string>>} */
  const changesByPkg = new Map();
  for (const cs of changesets) {
    const lines = extractChangeLines(cs.body);
    if (lines.length === 0) continue;

    for (const b of cs.bumps) {
      const set = changesByPkg.get(b.name) ?? new Set();
      for (const line of lines) set.add(line);
      changesByPkg.set(b.name, set);
    }
  }

  // 变更包列表（按 changeset 声明）
  const pkgNames = Array.from(changesByPkg.keys()).sort((a, b) => a.localeCompare(b));

  // 读取版本
  const pkgNameToPj = mapPkgNameToPackageJson(repoRoot);

  /** @type {PkgVersionInfo[]} */
  const versions = [];
  for (const name of pkgNames) {
    const pj = pkgNameToPj.get(name);
    if (!pj) continue;

    const fromFs = readPackageJsonVersionFromFs(pj);
    if (fromFs) versions.push(fromFs);
  }

  // 未解析到 package.json 的包也要展示
  const resolved = new Set(versions.map((v) => v.name));
  const unresolved = pkgNames.filter((n) => !resolved.has(n));

  // ===== 输出：你要的 Lark 文案 =====
  const lines = [];

  lines.push("📦 Monorepo 发版成功");
  lines.push("");

  lines.push("🎯 Packages");

  const pad = maxNameLen(versions.concat(unresolved.map((n) => ({
    name: n,
    version: "<unknown>",
    packageJsonPath: "",
    source: "fs"
  }))));

  for (const v of versions.sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`• ${v.name.padEnd(pad)}  v${v.version}`);
  }
  for (const n of unresolved) {
    lines.push(`• ${n.padEnd(pad)}  v<unknown>`);
  }

  lines.push("");
  lines.push("📝 Changes");

  for (const pkg of pkgNames) {
    lines.push(pkg);

    const set = changesByPkg.get(pkg);
    const items = set ? Array.from(set.values()) : [];
    if (items.length === 0) {
      lines.push("- (no details)");
      lines.push("");
      continue;
    }

    for (const item of items) {
      lines.push(`- ${escapeNewline(item)}`);
    }
    lines.push("");
  }

  // 输出最终文本（你可以直接塞给 lark）
  log("blue", lines.join("\n").trim());

  return lines.join("\n").trim();
}

/**
 * @param {string} webhook
 * @param {string} text
 * @returns {Promise<void>}
 */
function sendToLark(webhook, text) {
  return new Promise((resolve, reject) => {
    const u = new URL(webhook);
    const payload = JSON.stringify({
      msg_type: "text",
      content: { text },
    });

    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Lark webhook failed: status=${String(res.statusCode)} body=${body}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const message = getPublickInfomation();
  const webhook = (process.env.LARK_WEBHOOK ?? process.env.LARK_WEBHOOK_URL ?? "").trim();
  const dryRun = isTruthy(process.env.DRY_RUN);


  if (dryRun) {
    log("yellow", "[dry-run] will not send to lark");
    log("blue", message);
    return;
  }

  if (!webhook) {
    throw new Error("Missing LARK_WEBHOOK. Provide env LARK_WEBHOOK=...");
  }

  await sendToLark(webhook, message);
  log("green", "✅ Sent to Lark");
}

main().catch((err) => {
  log("red", `❌ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}).finally(() => {
  process.exit(0);
})