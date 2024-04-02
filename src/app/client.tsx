'use client'

import { useEffect, useState } from "react"
import { getDomain } from "./url"

export function Playground() {

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  return (
    <>
      <form className="mt-4 flex flex-col gap-2" action={
        (form) => {
          (async () => {
            const url = new URL(getDomain() + '/render')
            url.searchParams.set('code', form.get('code') as string)
            const config = {
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
            url.searchParams.set('cfg', JSON.stringify(config))
            setLoading(true)
            setError(undefined)
            const data = await fetch(url).then(res => res.json()).catch(err => {
              setLoading(false)
              setError("Unknown client error" as any)
              return {}
            })
            const svg = data.svg
            setLoading(false)
            setData(data)
            if (!svg) {
              setError(error ?? data.status)
            }
          })()
        }
      }>
        <textarea
          className="text-sm text-[#89B37C] w-full bg-neutral-950/50 p-4 rounded-lg border-neutral-950 outline-none focus:outline-neutral-800 font-mono"
          name="code"
          defaultValue={`graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;`}
          rows={10}
        />
        <button className="text-start p-2 px-6 bg-black/20 rounded-md self-start hover:bg-black/10">Submit</button>
      </form>
      <div className="flex flex-col justify-center gap-4 p-4 bg-neutral-950/20 my-8 rounded-xl min-h-40 items-center">
        {
          loading
            ? <div>Loading...</div>
            : error
              ? <div className="self-stretch grow text-xs text-start font-mono leading-tight tracking-tighter text-red-400 whitespace-pre-wrap">{error}</div>
              : data
                ? <>
                  <div className="self-stretch" dangerouslySetInnerHTML={{ __html: data?.svg }} />
                  <div className="self-stretch grow text-xs font-mono leading-tight tracking-tighter text-neutral-500">
                    {
                      data?.ev && data.ev.map(
                        (e: { name: string, time: number }, i: number) => <div key={i}>
                          {e.time}s - {e.name}
                        </div>
                      )
                    }
                  </div>
                </>
                : <div className="opacity-30 pointer-events-none">Press submit to generate diagram</div>
        }
      </div>
    </>
  )
}