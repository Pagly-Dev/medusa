/**
 * Publishes the predefined package list, in that order.
 */
import { spawnSync } from "node:child_process"
import path from "node:path"
import { paglyPublishPackages } from "./pagly-publish-packages.mjs"

const root = path.resolve(import.meta.dirname, "..")

for (const entry of paglyPublishPackages) {
  const cwd = path.join(root, entry.directory)
  console.log(`Publishing ${entry.directory}`)
  // npm, not `yarn npm publish`: the renamed manifests no longer match the
  // workspace yarn installed, and npm packs a directory as it is.
  const result = spawnSync("npm", ["publish", "--access", "public"], {
    cwd,
    stdio: "inherit",
    env: process.env,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
