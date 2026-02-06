const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

/**
 * 将输入路径解析为绝对路径
 * @param {string} input
 * @returns {string}
 */
function resolvePath(input) {
  return path.isAbsolute(input)
    ? input
    : path.resolve(process.cwd(), input);
}

/**
 * 主入口
 */
function main() {
  const [, , fromArg, toArg] = process.argv;

  if (!fromArg || !toArg) {
    console.error('Usage: node scripts/copy.js <from> <to>');
    process.exit(1);
  }

  const from = resolvePath(fromArg);
  const to = resolvePath(toArg);

  if (!fs.existsSync(from)) {
    console.error(`Source path does not exist: ${from}`);
    process.exit(1);
  }

  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(from, to, { recursive: true });

  console.log(`Copied: ${from} -> ${to}`);
}

main();