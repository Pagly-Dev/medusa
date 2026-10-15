/**
 * Rewrites the manifests of the packages listed in pagly-publish-packages.mjs
 * so they publish as @pagly/*. Run it only inside the publish workflow, after
 * the install and the build, and never commit the result.
 *
 * Only the manifests change. Inside the packages every import keeps its
 * @medusajs/* name, and a dependency on another predefined package keeps its
 * key but points at the fork through an npm alias:
 *
 *   "@medusajs/promotion": "npm:@pagly/promotion@2.21.2-pagly.1"
 *
 * so an install holds each package once, under the name Medusa's own code
 * requires. A consumer maps the same names in its overrides, which brings the
 * stock packages (framework, cli, ...) onto the fork too.
 *
 * The version comes from the workflow's `version` input:
 * <source version>-pagly.<n>. npm never accepts the same version twice, so
 * each publish takes a new <n>; the source tree keeps the upstream version so
 * upstream merges stay merges. A prerelease of the upstream version still
 * satisfies a consumer's `>=<source version>-pagly.0` peer range.
 */
import fs from "node:fs"
import path from "node:path"
import { paglyPublishPackages, publishedName } from "./pagly-publish-packages.mjs"

const root = path.resolve(import.meta.dirname, "..")
const repoUrl = "https://github.com/Pagly-Dev/medusa-core.git"

const publishVersion = process.env.PAGLY_PUBLISH_VERSION ?? ""
const versionMatch = /^(\d+\.\d+\.\d+)-pagly\.(\d+)$/.exec(publishVersion)
if (!versionMatch) {
  console.error(
    `PAGLY_PUBLISH_VERSION must look like 2.21.2-pagly.1, got "${publishVersion}"`
  )
  process.exit(1)
}

const sourceNames = new Set(paglyPublishPackages.map((pkg) => pkg.name))

const published = []

for (const entry of paglyPublishPackages) {
  const manifest = path.join(root, entry.directory, "package.json")
  const pkg = JSON.parse(fs.readFileSync(manifest, "utf8"))
  if (pkg.name !== entry.name) {
    console.error(`${entry.directory} is ${pkg.name}, expected ${entry.name}`)
    process.exit(1)
  }
  if (pkg.version !== versionMatch[1]) {
    console.error(
      `${pkg.name} is at ${pkg.version}; PAGLY_PUBLISH_VERSION must start with it`
    )
    process.exit(1)
  }

  pkg.name = publishedName(entry.name)
  pkg.version = publishVersion

  for (const field of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      if (sourceNames.has(name)) {
        pkg[field][name] = `npm:${publishedName(name)}@${publishVersion}`
      }
    }
  }

  if (pkg.repository && typeof pkg.repository === "object") {
    pkg.repository.url = repoUrl
  }
  pkg.publishConfig = { ...(pkg.publishConfig ?? {}), access: "public" }
  delete pkg.publishConfig.provenance

  fs.writeFileSync(manifest, `${JSON.stringify(pkg, null, 2)}\n`)
  published.push(`${pkg.name}@${pkg.version}`)
}

console.log(`Rewrote ${published.length} manifests:`)
for (const name of published) {
  console.log(`  ${name}`)
}
