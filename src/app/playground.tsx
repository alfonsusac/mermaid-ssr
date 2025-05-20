'use client'

import { useActionState, useEffect, useState } from "react"
import { getDomain } from "./url"
import Form from "next/form"

export function Playground() {

  const [res, dispatch, loading] = useActionState(async (_: unknown, code: string) => {
    const url = new URL(getDomain() + '/render')
    url.searchParams.set('code', code)
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
    const path = url.pathname + url.search + url.hash;

    try {
      const data = await fetch(path).then(res => res.json())
      if (!data) throw new Error("No data returned")

      return {
        code,
        path,
        data,
        error: undefined
      } as const

    } catch (error) {
      return {
        code,
        path,
        data: undefined,
        error: (error instanceof Error ? error.message : "") || "Unknown client error." + "The browser console may have more information."
      } as const
    }




  }, undefined)

  return (
    <>
      <form className="mt-4 flex flex-col gap-2" action={form => {
        const code = form.get('code')?.toString()
        if (!code) return
        dispatch(code)
      }}>
        <textarea
          className="text-sm text-[#89B37C] w-full bg-neutral-950/50 p-4 rounded-lg border-neutral-950 outline-none focus:outline-neutral-800 font-mono"
          name="code"
          defaultValue={res?.code ?? `graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;`}
          rows={10}
        />
        <button className="text-start p-2 px-6 bg-black/20 rounded-md self-start hover:bg-black/10" disabled={loading}>Submit{loading ? "ting..." : ""}</button>
      </form>

      <div className="transition-all duration-500 grid grid-rows-[0fr] data-[open]:grid-rows-[1fr] overflow-clip" data-open={res?.error ? "" : undefined}>
        <div className="self-stretch grow text-xs text-start font-mono leading-tight tracking-tighter text-red-400 whitespace-pre-wrap">Client error occurred: {res?.error}</div>
      </div>

      <div className="transition-all duration-1000 grid grid-rows-[0fr] data-[open]:grid-rows-[1fr] overflow-clip" data-open={res?.data ? "" : undefined}>
        <div className="min-h-0">
          <div className="flex flex-col justify-center gap-4 p-4 bg-neutral-950/20 my-8 rounded-xl">
            {
              res?.data.status !== "ok" &&
              <div className="self-stretch grow text-xs text-start font-mono leading-tight tracking-tighter text-red-400 whitespace-pre-wrap">
                Server error occurred. Message from server:<br />
                {JSON.stringify(res?.data.status)}
              </div>
            }
            <div className="self-stretch" dangerouslySetInnerHTML={{ __html: res?.data?.svg }} />
            <div className="self-stretch grow text-xs font-mono leading-tight tracking-tighter text-neutral-500">
              {
                res?.data?.ev && res.data?.ev.map(
                  (e: { name: string, time: number }, i: number) => <div key={i}>
                    {e.time}s - {e.name}
                  </div>
                )
              }
              <br />
              url: <a href={res?.path} className="text-white/800 underline underline-offset-2" target="_blank">{res?.path}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Preiew */}
      {/* <div className="flex flex-col justify-center gap-4 p-4 bg-neutral-950/20 my-8 rounded-xl min-h-40 items-center">
        {
          loading
            ? <div>Loading...</div>
            : res?.error
              ? <div className="self-stretch grow text-xs text-start font-mono leading-tight tracking-tighter text-red-400 whitespace-pre-wrap">{String(res.error)}</div>
              : res
                ? <>
                  <div className="self-stretch" dangerouslySetInnerHTML={{ __html: res?.data.svg }} />
                  <div className="self-stretch grow text-xs font-mono leading-tight tracking-tighter text-neutral-500">
                    {
                      res?.data.ev && res.data.ev.map(
                        (e: { name: string, time: number }, i: number) => <div key={i}>
                          {e.time}s - {e.name}
                        </div>
                      )
                    }
                  </div>
                </>
                : <div className="opacity-30 pointer-events-none">Press submit to generate diagram</div>
        }
      </div> */}
    </>
  )
}