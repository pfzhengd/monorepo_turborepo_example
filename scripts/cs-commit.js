const { execSync } = require('node:child_process');

async function main() {
  try {
    execSync('git add .changeset', { stdio: 'inherit' });
    execSync('git commit -m "docs: 更新版本"', { stdio: 'inherit' });
  } finally {
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});