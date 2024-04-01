import { renderMermaid } from "@mermaid-js/mermaid-cli"
import { NextRequest, NextResponse } from "next/server"
import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
// import puppeteer from "puppeteer"


// const temp = {
//   browser: undefined as undefined | Browser
// }


export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ status: "no code provided" })

  const backgroundColor = request.nextUrl.searchParams.get('b')

  let cfg
  try {
    cfg = JSON.parse(request.nextUrl.searchParams.get('cfg') ?? "{}")
  } catch (error) {
    if (error) return NextResponse.json({ status: "invalid config" })
  }

  const startBrowserStartTime = performance.now()
  // chromium.setGraphicsMode = false;
  // temp.browser = await (async () => temp.browser ? temp.browser : await puppeteer.launch({
  //   args: chromium.args,
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath: await chromium.executablePath(
  //     `https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar`
  //   ),
  //   headless: chromium.headless,
  // }))()
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v123.0.0/chromium-v123.0.0-pack.tar`
    ), 
    headless: chromium.headless,
  })
  // const browser = await puppeteer.launch()
  const endBrowserStartTime = performance.now() // Get the end BrowserStartTime
  const executionBrowserStartTime = endBrowserStartTime - startBrowserStartTime // Calculate the difference

  const startRenderTime = performance.now()
  let result
  try {
    result = await renderMermaid(
      browser as any,
      code,
      "svg",
      {
        backgroundColor: backgroundColor ?? "",
        mermaidConfig: {
          htmlLabels: true,
          fontFamily: "var(--font-inter)",
          themeCSS: "HELLO",
          ...cfg
        },
        myCSS: ".mermaid-js{font-size: 0.8em !important;}",
      }
    )
  } catch (error: any) {
    // console.log(error.stack)
    const msg = error.message as string
    const errormsg = msg.split('\n').slice(0,
      msg.split('\n').findIndex(l => l.includes('@mermaid-js'))
    ).join('\n')
    console.log(errormsg)
    return NextResponse.json({ status: errormsg })
  }
  const endRenderTime = performance.now() // Get the end RenderTime
  const executionRenderTime = endRenderTime - startRenderTime // Calculate the difference

  // const startBrowserCloseTime = performance.now()
  // await browser.close()
  // const endBrowserCloseTime = performance.now() // Get the end BrowserCloseTime
  // const executionBrowserCloseTime = endBrowserCloseTime - startBrowserCloseTime // Calculate the difference

  const svg = result.data.toString('utf-8').replace(`id="my-svg"`, `id="my-svg" class="mermaid-js"`)

  return NextResponse.json({
    status: "ok",
    timing: {
      browserStartMs: Math.round((executionBrowserStartTime ?? 0) * 100) / 100,
      renderMs: Math.round((executionRenderTime ?? 0) * 100) / 100,
      // browserCloseMs: Math.round((executionBrowserCloseTime ?? 0) * 100) / 100,
    },
    svg,
  })
}

// http://localhost:3010/render?code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B