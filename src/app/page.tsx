import Image from "next/image"
import { CodeBlock, getCodeProps } from "./code"
import { Playground } from "./client"

export default async function Home({ searchParams }: any) {
  return (
    <main className="max-w-screen-sm mx-auto p-8 py-20">
      <header className="text-center">
        <h1 className="font-semibold text-3xl tracking-tight">Mermaid SSR API</h1>
        <div>Render SVG from mermaid input</div>
        <CodeBlock className="mt-8 *:text-base">
          {"await fetch('https://mermaid-ssr.vercel.app/render')"}
        </CodeBlock>
      </header>



      <section>
        <h2 className="mb-2">Usage</h2>
        <p className="">Using to generate server-side rendered mermaid.js code to React</p>
        <CodeBlock>
          {`const url = new URL('http://mermaid-ssr.vercel.app/render')
url.searchParams.set('code', \`graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;\`)
const response = await fetch(url, { cache: 'no-store' })
const result = await response.json()
const svg = result.svg
return <div dangerouslySetInnerHTML: { __html: svg }/>
`}
        </CodeBlock>
      </section>

      <section className="params">
        <h2>Parameters</h2>

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
        <p>The mermaid config. This follows <a href="https://mermaid.js.org/config/schema-docs/config.html" className="text-white/800 underline underline-offset-2">MermaidConfig</a> from mermaid.js</p>
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
        <Playground />
      </section>

      <footer className="flex justify-center h-20 items-center">
        GitHub
      </footer>

    </main>
  )
}
