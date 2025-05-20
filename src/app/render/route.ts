import { NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { createLogger, type Logger } from "./timer"
import { unstable_cache } from "next/cache"
import { initializeMermaid, initializePuppeteer, renderCode, renderSVGasHTML, renderSVGAsPNG } from "../lib/render"
import type { MermaidConfig } from "mermaid"


export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ status: "no code provided" })
  let cfg: MermaidConfig = {}
  let out: string | null = null
  try {
    cfg = JSON.parse(request.nextUrl.searchParams.get('cfg') ?? "{}")
    out = request.nextUrl.searchParams.get('out')
  } catch (error) {
    if (error) return NextResponse.json({ status: "invalid config: " + error })
  }

  const logger = createLogger()

  try {

    const page = await initializePuppeteer(logger.ev)
    if (!page) throw new Error("Error intiializing puppeteer")
    logger.logtime('puppeteer initialized')

    await initializeMermaid(page, cfg)
    logger.logtime('mermaid initialized')

    const res = await unstable_cache(async () => {
      const res = await renderCode(page, code)
      logger.logtime('code rendered')
      if (out === "html")
        return await renderSVGasHTML(page, res.svg)
      if (out === "png")
        return await renderSVGAsPNG(page, res.svg)
      return res.svg
    }, [code, out ?? "", JSON.stringify(cfg)])() // later: unstable_cache this

    if (out === "html") {
      return new NextResponse(res as string, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    if (out === "png") {
      return new NextResponse(new Uint8Array(res as Buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      })
    }

    logger.final('Total time')
    return NextResponse.json({ ev: logger.ev, status: "ok", svg: res as string })

  } catch (error) {
    console.log("route.ts", error)
    return NextResponse.json({ ev: logger.ev, status: error instanceof Error ? error.message : error, })
  }
}

// http://localhost:3010/render?code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B
// http://localhost:3010/render?out=img&code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B
