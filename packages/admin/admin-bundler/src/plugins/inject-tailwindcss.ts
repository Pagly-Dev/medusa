import path from "node:path"
import type { Config } from "tailwindcss"
import type { Plugin } from "vite"

interface InjectTailwindCSSOptions {
  entry: string
  sources?: string[]
  plugins?: string[]
}

export const injectTailwindCSS = (
  options: InjectTailwindCSSOptions
): Plugin => {
  return {
    name: "medusa:inject-tailwindcss",
    config: () => ({
      css: {
        postcss: {
          plugins: [
            require("tailwindcss")({
              config: createTailwindConfig(
                options.entry,
                options.sources,
                options.plugins
              ),
            }),
          ],
        },
      },
    }),
  }
}

function createTailwindConfig(
  entry: string,
  sources: string[] = [],
  plugins: string[] = []
) {
  const root = path.join(entry, "**/*.{js,ts,jsx,tsx}")
  const html = path.join(entry, "index.html")

  let dashboard = ""

  try {
    dashboard = path.join(
      path.dirname(require.resolve("@medusajs/dashboard")),
      "**/*.{js,ts,jsx,tsx}"
    )
  } catch (_e) {
    // ignore
  }

  let ui: string = ""

  try {
    ui = path.join(
      path.dirname(require.resolve("@medusajs/ui")),
      "**/*.{js,ts,jsx,tsx}"
    )
  } catch (_e) {
    // ignore
  }

  const sourceExtensions = sources.map((s) =>
    path.join(s, "**/*.{js,ts,jsx,tsx}")
  )
  const pluginExtensions: string[] = []

  for (const plugin of plugins) {
    try {
      // Pagly: resolved from `entry`, where entry.jsx imports the plugin. From this package it fails when npm nests the plugin under a workspace, and every class only the plugin uses goes missing
      const pluginDir = path.dirname(
        require.resolve(plugin, { paths: [entry] })
      )

      pluginExtensions.push(
        path.join(pluginDir, "**/*.{js,ts,jsx,tsx}"),
        // Pagly: `plugin:build` names its chunks `_chunks/[name]-[hash]` with no extension, so the glob above missed every class only plugin code uses
        path.join(pluginDir, "_chunks/*")
      )
    } catch (_e) {
      // Pagly: a skipped plugin ships an admin without its styles, so say so
      console.warn(
        `Could not resolve "${plugin}" from ${entry}: its Tailwind classes will be missing from the admin CSS.`
      )
    }
  }

  const config: Config = {
    presets: [require("@medusajs/ui-preset")],
    content: [
      html,
      root,
      dashboard,
      ui,
      ...sourceExtensions,
      ...pluginExtensions,
    ],
    darkMode: "class",
  }

  return config
}
