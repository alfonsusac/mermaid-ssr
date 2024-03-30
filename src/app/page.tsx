import Image from "next/image"

export default function Home() {
  return (
    <main className="max-w-screen-sm mx-auto p-8 py-20">
      <h1 className="font-semibold text-3xl tracking-tight">Mermaid SSR API</h1>

      <div>Render SVG from mermaid input</div>
      <pre>
        {`await fetch('.../render?code=<code>')`}
      </pre>

      <br />

      <h2 className="font-semibold text-lg tracking-tight">Parameters</h2>
      <pre>
        {`?code=`}
      </pre>
      <p>The mermaid code</p>

      <br />

      <pre>
        {`?size=`}
      </pre>
      <p>The size of the diagram</p>

      <br />

      <pre>
        {`?cfg=`}
      </pre>
      <p>The mermaid config. This follows <code>MermaidConfig</code> from mermaid.js</p>
    </main>
  )
}
