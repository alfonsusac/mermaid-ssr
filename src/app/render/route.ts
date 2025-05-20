import { NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { createLogger, type Logger } from "./timer"
import { unstable_cache } from "next/cache"
import { initializeMermaid, initializePuppeteer, renderCode, renderSVGasHTML, renderSVGAsPNG } from "../lib/render"
import type { MermaidConfig } from "mermaid"


export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ status: "no code provided" })
  let cfg
  let out
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

    const { svg } = await renderCode(page, code) // later: unstable_cache this
    logger.logtime('code rendered')

    if (out === "html") {
      const html = await renderSVGasHTML(page, svg)
      logger.logtime('code rendered as html')
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    if (out === "png") {
      const img = await renderSVGAsPNG(page, svg)
      logger.logtime('code rendered as png')
      return new NextResponse(new Uint8Array(img), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      })
    }

    // result = await unstable_cache(async (code) => {
    //   const res = await renderCodeAsSVG(page, code)
    //   logger.logtime('code rendered')
    //   return res
    // })(code)

    logger.final('Total time')
    return NextResponse.json({ ev: logger.ev, status: "ok", svg })


  } catch (error) {
    console.log("route.ts", error)
    return NextResponse.json({ ev: logger.ev, status: error instanceof Error ? error.message : error, })
  }





  // if (out === "html") return handleRenderHTML(logger, code, cfg)
  // if (out === "png") return handleRenderImage(logger, code, cfg)
  // return handleRenderSVG(logger, code, cfg)

}



async function handleRenderSVG({ ev, logtime, final }: Logger, code: string, cfg: MermaidConfig) {
  try {
    const result = await unstable_cache(async (code, cfg) => {
      const page = await initializePuppeteer(ev)
      if (!page) {
        throw new Error("Error intiializing puppeteer")
      }
      logtime('puppeteer initialized')
      const result = await renderCode(page, code, cfg, false)

      logtime('code rendered')
      return result
    })(code, cfg)

    final('Total time')
    return NextResponse.json({ ev, status: "ok", svg: result, })
  } catch (error) {
    console.log("route.ts", error)
    return NextResponse.json({ ev, status: error instanceof Error ? error.message : error, })
  }
}
// http://localhost:3010/render?code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B


async function handleRenderImage({ ev, logtime, final }: Logger, code: string, cfg: MermaidConfig) {
  try {
    const result = await unstable_cache(async (code, cfg) => {
      const page = await initializePuppeteer(ev)
      if (!page) {
        throw new Error("Error intiializing puppeteer")
      }
      logtime('puppeteer initialized')
      const result = await renderCode(page, code, cfg, true)

      logtime('code rendered')
      return result
    })(code, cfg)
    final('Total time')
    console.log(ev)

    return new NextResponse(new Uint8Array(result), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    console.log("route.ts", error)
    return new NextResponse("Image rendering failed", {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
// http://localhost:3010/render?img=true&code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B


async function handleRenderHTML({ ev, logtime, final }: Logger, code: string, cfg: MermaidConfig) {
  try {
    const result = await unstable_cache(async (code, cfg) => {
      const page = await initializePuppeteer(ev)
      if (!page) {
        throw new Error("Error intiializing puppeteer")
      }
      logtime('puppeteer initialized')
      const result = await renderCode(page, code, cfg, true, true) as unknown as string

      logtime('code rendered')
      return result
    })(code, cfg)
    final('Total time')

    console.log(result)
    // console.log(ev)

    return new NextResponse(result, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.log("route.ts", error)
    return new NextResponse("Image rendering failed", {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}