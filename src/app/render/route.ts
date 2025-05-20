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

    const page = await initializePuppeteer(logger.ev, async (page) => {
      await initializeMermaid(page, cfg)
      logger.logtime('mermaid initialized')
    })
    if (!page) throw new Error("Error intiializing puppeteer")
    logger.logtime('puppeteer initialized')


    const { svg } = await unstable_cache(async () => {
      const res = renderCode(page, code)
      logger.logtime('code rendered')
      return res
    })() // later: unstable_cache this

    if (out === "html") {
      const html = await unstable_cache(async () => {
        const res = await renderSVGasHTML(page, svg)
        logger.logtime('code rendered as html')
        return res
      })()
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    if (out === "png") {
      const img = await unstable_cache(async () => {
        const res = await renderSVGAsPNG(page, svg)
        logger.logtime('code rendered as png')
        return res
      })()
      return new NextResponse(new Uint8Array(img), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      })
    }

    logger.final('Total time')
    return NextResponse.json({ ev: logger.ev, status: "ok", svg })

  } catch (error) {
    console.log("route.ts", error)
    return NextResponse.json({ ev: logger.ev, status: error instanceof Error ? error.message : error, })
  }
}

// http://localhost:3010/render?code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B
// http://localhost:3010/render?out=img&code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B
