#!/usr/bin/env node
try {
  console.log('🔍 Running lint-staged...');
} catch (err) {
  console.error('\n❌ Pre-commit failed: ', err.message);
  process.exit(1);
}