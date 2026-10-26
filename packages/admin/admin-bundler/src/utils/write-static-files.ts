import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import outdent from "outdent"

export async function writeStaticFiles(plugins?: string[]) {
  const outDir = join(process.cwd(), ".medusa/client")

  await mkdir(outDir, { recursive: true })

  const promises = [
    writeCSSFile(outDir),
    writeEntryFile(outDir, plugins),
    writeHTMLFile(outDir),
  ]

  await Promise.all(promises)
}

async function writeCSSFile(outDir: string) {
  const css = outdent`
    @import "@medusajs/dashboard/css";

    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  `

  await writeFile(join(outDir, "index.css"), css)
}

function getPluginName(index: number) {
  return `plugin${index}`
}

async function writeEntryFile(outDir: string, plugins?: string[]) {
  const entry = outdent`
    import App from "@medusajs/dashboard";
    import React from "react";
    import ReactDOM from "react-dom/client";
    import "./index.css";

    ${plugins
      ?.map((plugin, idx) => `import ${getPluginName(idx)} from "${plugin}"`)
      .join("\n")}

    let root = null

    if (!root) {
      root = ReactDOM.createRoot(document.getElementById("medusa"))
    }

    
    root.render(
      <React.StrictMode>
        <App plugins={[${plugins
          ?.map((_, idx) => getPluginName(idx))
          .join(", ")}]} />
      </React.StrictMode>
    )


    if (import.meta.hot) {
        import.meta.hot.accept()
    }
  `

  await writeFile(join(outDir, "entry.jsx"), entry)
}

async function writeHTMLFile(outDir: string) {
  const html = outdent`
    <!DOCTYPE html>
    <html>
        <head>
            <meta
                http-equiv="Content-Type"
                content="text/html; charset=UTF-8"
            />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20200%20300'%3E%3Cpath%20fill%3D'%23303030'%20d%3D'M171.29%2C104.64c-18.86%2C25.37-37.69%2C45.36-71.17%2C45.36-26.74-.01-48.67-21.03-49.95-47.52-1.45-27.48%2C20.45-51.45%2C47.95-52.45%2C28.52-1.11%2C52%2C21.69%2C52%2C49.96%2C0%2C7.9-1.83%2C15.37-5.1%2C22.01-1%2C2.03%2C1.57%2C3.92%2C3.18%2C2.34%2C7.91-7.76%2C15.17-17.27%2C22.79-27.76%2C2.44-3.35%2C3.42-7.58%2C2.6-11.64-6.97-34.21-37.21-59.95-73.48-59.95-41.31%2C0-75.01%2C33.47-75.01%2C75h0s0%2C162.09%2C0%2C162.09c0%2C6.88%2C5.39%2C12.79%2C12.27%2C12.91%2C7.01.13%2C12.74-5.52%2C12.74-12.5v-106.59c13.6%2C12.21%2C31.72%2C19.15%2C50%2C19.09%2C39.41%2C0%2C71.75-30.4%2C74.79-69.04.16-1.99-2.41-2.92-3.61-1.32Z'%2F%3E%3C%2Fsvg%3E" />
        </head>

        <body>
            <div id="medusa"></div>
            <script type="module" src="./entry.jsx"></script>
        </body>
    </html>
  `

  await writeFile(join(outDir, "index.html"), html)
}
