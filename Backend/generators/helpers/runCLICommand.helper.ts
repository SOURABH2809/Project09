import { execSync } from "node:child_process";

export function runCommand(command: string) {
  try {
    console.log(`\n🚀 Running: ${command}\n`);
    execSync(command, { stdio: "inherit" });
  } catch {
    console.error(`❌ Failed: ${command}`);
    process.exit(1);
  }
}
