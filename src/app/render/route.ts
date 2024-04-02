import { NextRequest, NextResponse } from "next/server"
import { Browser, Page } from "puppeteer-core"
import { getDomain } from "../url"
import { Mermaid, MermaidConfig } from "mermaid"
// @ts-ignore
import mermaidHTML from "./mermaid.html"
import { createLogger } from "./timer"

const temp = {
  page: undefined as Page | undefined
}

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

  const { ev, logtime, final } = createLogger()

  const page = await initializePuppeteer(ev)
  if (!page) {
    return NextResponse.json({ status: "error initializing puppeteer" })
  }


  logtime('puppeteer initialized')
  try {
    const  result = await renderCode(page, code, cfg)
    logtime('code rendered')
    if (result.error) {
      return NextResponse.json({ status: result.error, ev })
    } else {
      final('Total time')
      return NextResponse.json({ status: "ok", svg: result.svg, ev })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ status: error, ev })
  } finally {
    // browser.close()
  }
}

// http://localhost:3010/render?code=graph%20TD%3B%0A%20%20%20%20A%5BSquare%20Rect%5D%20--%3E%7CLink%20text%7C%20B(Round%20Rect)%3B%0A%20%20%20%20A%20--%3E%20C%7BDecision%7D%3B%0A%20%20%20%20B%20--%3E%20D%7BDecision%7D%3B%0A%20%20%20%20C%20--%3E%7CYes%7C%20D%3B%0A%20%20%20%20C%20--%3E%7CNo%7C%20E%5BResult%5D%3B%0A%20%20%20%20D%20--%3E%7CYes%7C%20E%3B%0A%20%20%20%20D%20--%3E%7CNo%7C%20F%5BResult%5D%3B%0A%20%20%20%20E%20--%3E%7CSuccess%7C%20G%3B%0A%20%20%20%20F%20--%3E%7CFailure%7C%20H%3B%0A%20%20%20%20G%20--%3E%20Stop%3B%0A%20%20%20%20H%20--%3E%20Stop%3B


let chrome = {} as any
let puppeteer: any

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("@sparticuz/chromium")
  puppeteer = require("puppeteer-core")
} else {
  puppeteer = require("puppeteer")
}

async function launchBrowser() {
  // const startBrowserStartTime = performance.now()
  // chromium.setGraphicsMode = false;
  // temp.browser = await (async () => temp.browser ? temp.browser : await puppeteer.launch({
  //   args: chromium.args,
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath: await chromium.executablePath(
  //     `https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar`
  //   ),
  //   headless: chromium.headless,
  // }))()
  let options = {}
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      ignoreHTTPSErrors: true,
      dumpio: true,
    }
    // options = {
    //   args: chromium.args,
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath(
    //     `https://github.com/Sparticuz/chromium/releases/download/v123.0.0/chromium-v123.0.0-pack.tar`
    //   ),
    //   headless: chromium.headless,
    // }
  }

  const browser = await puppeteer.launch(options) as Browser

  return browser as Browser
}

async function initializePuppeteer(ev: any[]) {
  const { logtime } = createLogger("┌ ", ev)

  if (temp.page) {
    console.log("Page already initialized")
    logtime("browser already launched")
    return temp.page
  }

  try {
    const browser = await launchBrowser()
    logtime("new browser launched")
    const page = await browser.newPage()
    logtime("new page launched")
    page.on('console', async (msg) => {
      const msgArgs = msg.args()
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue())
      }
    })
    page.setDefaultTimeout(5000)
    await page.setContent(mermaidHTML)
    logtime("mermaid html loaded")
    await page.waitForSelector('#container')
    temp.page = page
    console.log("Page initialized.")
    return page
  } catch (error: any) {
    console.log("Error intializing puppeteer", error.message)
    return
  }
}


async function renderCode(page: Page, code: string, cfg: MermaidConfig) {
  try {
    await page.waitForSelector('#container', {

    }) // todo: can we remove this?
    const result = await page.evaluate(async (code, cfg) => {
      const { mermaid } = globalThis as unknown as { mermaid: Mermaid }

      mermaid.initialize({
        startOnLoad: false,
        
        ...cfg
      })

      try {
        // const graphDefinition = 'graph TB\na-->b'
        const { svg } = await mermaid.render('graphDiv', code)
        return { svg }
      } catch (error: any) {
        console.log(error.message)
        return { error: error.message }
      }
    }, code, cfg)


    return result
  } catch (error) {
    console.log(error)
    return { error: "unknown error"}
  } finally {
    // await page.close()
  }
}