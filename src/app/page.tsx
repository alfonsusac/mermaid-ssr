import { CodeBlock } from "./code"
import { Playground } from "./client"
import { getDomain } from "./url"

export default function Home() {
  return (
    <main className="max-w-screen-sm mx-auto p-8 py-20">
      <header className="text-center">
        <h1 className="font-semibold text-3xl tracking-tight">Mermaid SSR API</h1>
        <div>Render SVG from mermaid.js input</div>
        <CodeBlock className="mt-8 *:text-base">
          {`await fetch('${getDomain()}/render')`}
        </CodeBlock>
      </header>

      <section>
        <h2 className="mb-2">Example</h2>
        <p className="">Generate server-side rendered mermaid.js code to React</p>
        <CodeBlock>
          {`const url = new URL('${getDomain()}/render')
url.searchParams.set('code', \`graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;\`)
const response = await fetch(url)
const result = await response.json()
const svg = result.svg
return <div dangerouslySetInnerHTML: { __html: svg }/>
`}
        </CodeBlock>
      </section>

      <section className="params">
        <h2>Parameters</h2>
        <p className="">All parameters are passed into the searchParams of the URL</p>

        <section>
          <div>
            <h3><CodeBlock>let code: String</CodeBlock></h3>
            <p>The mermaid code</p>
          </div>
          <div>
            <CodeBlock>
              {`url.searchParams.set('code', \`graph TD;
    A[Square Rect] -- Link text --> B((Circle))
    A --> C(Round Rect)
    B --> D{Rhombus}
    C --> D\`)`}
            </CodeBlock>
          </div>
        </section>

        <h3><CodeBlock>let cfg: MermaidConfig</CodeBlock></h3>
        <p>The mermaid config. This follows <a href="https://mermaid.js.org/config/schema-docs/config.html" className="text-white/800 underline underline-offset-2" target="_blank">MermaidConfig</a> from mermaid.js</p>
        <CodeBlock>
          {`const config = {
  theme: "base",
  themeVariables: {
    darkMode: true,
    background: "transparent",
    fontSize: "16px",
    primaryColor: "#333",
    secondaryColor: "#0006",
    lineColor: "#555"
  },
}
url.searchParams.set('cfg', JSON.stringify(config))`}
        </CodeBlock>

      </section>

      <section>
        <h2 className="mb-2">Playground</h2>
        <p>You can find examples of mermaid code <a href="https://mermaid.js.org/intro/" className="text-white/800 underline underline-offset-2" target="_blank">here</a></p>
        <Playground />
      </section>

      <footer className="flex flex-col gap-2 justify-center py-8 items-center">
        <div className="text-xl">
          Deploy your own
        </div>
        <a href="https://github.com/alfonsusac/mermaid-ssr" className="hover:underline underline-offset-4" target="_blank">
          👉 GitHub 👈
        </a>
        <a href="https://alfonsusardani.notion.site/Making-Mermaid-SSR-7ca677a55ea1405899bdc8937310e689" className="hover:underline underline-offset-4" target="_blank">
          Notes/attributions (Notion)
        </a>
        <div className="text-neutral-400">
          Made by alfonsusac
        </div>
      </footer>

    </main>
  )
}
