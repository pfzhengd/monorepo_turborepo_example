#!/usr/bin/env node

const {
	execSync
} = require("node:child_process");
const {
	readdirSync,
	existsSync
} = require("node:fs");

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

function exec(command, options = {}) {
	try {
		return execSync(command, {
			stdio: "inherit",
			...options
		});
	} catch (_error) {
		log("red", `\n❌ 命令执行失败: ${command}`);
		process.exit(1);
	}
}

async function runRelease() {
	log("cyan", "\n🚀 开始发布流程...\n");

	// 1. 检查是否有未提交的更改
	log("yellow", "📝 检查工作区状态...");
	const status = execSync("git status --porcelain").toString();
	if (status.trim()) {
		log("red", "❌ 存在未提交的更改，请先提交或暂存更改");
		log("yellow", "您可以选择:");
		log(
			"yellow",
			'  1. 提交所有更改 (git add . && git commit -m "chore: prepare release")',
		);
		log("yellow", "  2. 暂存更改 (git stash)");
		log("yellow", "  3. 放弃发布");
		process.exit(1);
	}

	// 2. 检查是否有 changeset
	log("yellow", "📦 检查 changesets...");
	const changesetDir = ".changeset";
	const changesetFiles = existsSync(changesetDir) ?
		readdirSync(changesetDir).filter((f) => f.endsWith(".md")) : [];

	if (changesetFiles.length === 0) {
		log("yellow", "⚠️  没有找到 changeset，是否需要创建？");
		log("yellow", "运行: pnpm changeset");
		process.exit(0);
	}

	// 3. 拉取最新代码
	log("yellow", "📥 拉取最新代码...");
	exec("git pull --rebase");

	//4. 运行测试
	// log("yellow", "🧪 运行测试...");
	// exec("pnpm run test:e2e:ui");

	// 5. 构建项目
	log("yellow", "🔨 构建项目...");
	exec("pnpm build");

	// 6. 版本发布
	log("green", "🎯 开始版本发布...");
	exec("pnpm changeset:version");

	// 6.1 提交版本变更
	log("yellow", "📌 提交版本变更...");
	exec("git add .");


	// 👇 关键判断
	const hasChanges = execSync("git diff --cached --quiet || echo yes")
		.toString()
		.trim();

	if (hasChanges) {
		const versionInfo = "";
		const message = versionInfo ?
			`chore(release): version packages (${versionInfo})` :
			"chore(release): version packages";

		exec(`git commit -m "${message}"`);
	} else {
		log("yellow", "ℹ️  没有版本变更，跳过 git commit");
	}

	// 7. 安装依赖（更新 lock 文件）
	log("yellow", "📦 更新依赖...");
	exec("pnpm install");

	// 8. 运行 CI 检查
	log("yellow", "🔍 运行代码检查...");
	exec("pnpm run lint");
	exec('pnpm run type-check');

	// 9. 发布到 npm
	log("green", "🚀 发布包到 npm...");
	const isDryRun = process.argv.includes("--dry-run");
	if (isDryRun) {
		log("yellow", "🧪 模拟发布 (dry run)...");
		exec("pnpm run changeset:publish -- --dry-run");
	} else {
		exec("pnpm run changeset:publish");
	}

	// 10. 推送到 Git
	if (!isDryRun) {
		log("yellow", "📤 推送到远程仓库...");
		exec("git push --follow-tags");
	}

	// 11. 通知 lark 群组
	if (!isDryRun) {
		log("yellow", "📨 发送发布通知...");
		// 这里可以添加发送通知的逻辑，例如调用 API 或使用 webhook
		exec("pnpm run notify:lark");
	}

	// 12. 合并代码到 master
	if (!isDryRun) {
		log("yellow", "🔀 合并当前分支到 master...");

		// 记录当前分支
		const currentBranch = execSync("git branch --show-current")
			.toString()
			.trim();

		// 切换到 master 并更新
		exec("git checkout master");
		exec("git pull --rebase");

		// 合并发布分支
		exec(`git merge ${currentBranch}`);

		// 推送 master
		exec("git push origin master");

		// 切回原分支
		exec(`git checkout ${currentBranch}`);
	}


	log("green", "\n✅ 发布流程完成！");
}

// 处理命令行参数
if (process.argv.includes("--help") || process.argv.includes("-h")) {
	log("cyan", "📖 发布脚本使用说明:");
	log("yellow", "npm run release          - 执行完整发布流程");
	log("yellow", "npm run release:dry-run  - 模拟发布（不实际发布）");
	log("yellow", "npm run release:version  - 仅更新版本号");
	log("yellow", "npm run release:publish  - 仅发布到 npm");
	process.exit(0);
}

runRelease().catch((error) => {
	log("red", `\n💥 发布失败: ${error.message}`);
	process.exit(1);
});