import { NextRequest, NextResponse } from "next/server"
import { Browser, Page, PuppeteerLaunchOptions } from "puppeteer-core"
import { Mermaid, MermaidConfig } from "mermaid"
// @ts-ignore
import mermaidHTML from "./mermaid.html"
import { createLogger } from "./timer"
import { unstable_cache } from "next/cache"

const temp = {
  browser: undefined as Browser | undefined,
  page: undefined as Page | undefined
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ status: "no code provided" })
  let cfg
  try {
    cfg = JSON.parse(request.nextUrl.searchParams.get('cfg') ?? "{}")
  } catch (error) {
    if (error) return NextResponse.json({ status: "invalid config" })
  }



  const { ev, logtime, final } = createLogger()
  try {

    const result = await unstable_cache(async (code, cfg) => {
      const page = await initializePuppeteer(ev)
      if (!page) {
        throw new Error("Error intiializing puppeteer")
      }
      logtime('puppeteer initialized')
      const result = await renderCode(page, code, cfg)

      // const encoder = new TextEncoder()
      // const encodedString = encoder.encode(result)
      // console.log(encodedString.length)

      // const buffer = Buffer.from(result as any, 'utf-8')
      // console.log(buffer.length)

      // const base64 = Buffer.from(buffer.toString('ascii'), 'ascii')
      // console.log(base64.length)

      logtime('code rendered')
      return result
    })(code, cfg)

    final('Total time')
    return NextResponse.json({ ev, status: "ok", svg: result, })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ ev, status: error, })
  } finally {
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

  let options = {} as PuppeteerLaunchOptions
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    // chrome.setGraphicsMode = false
    options = {
      // ignoreDefaultArgs: [
      //   "--disable-extensions",
      //   // "--hide-scrollbars",
      //   // "--enable-automation",
      //   // "--disable-setuid-sandbox",
      //   // "--no-first-run",
      //   // "--no-zygote",
      // ],
      args: [
        ...chrome.args,
        // "--no-sandbox",
        "--hide-scrollbars",
        "--disable-web-security"
      ],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      // headless: true,
      ignoreHTTPSErrors: true,
      dumpio: true
    }
  }

  const browser = await puppeteer.launch(options) as Browser
  temp.browser = browser
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
    await page.setContent(mermaidHTML, {
      waitUntil: 'domcontentloaded',
    })
    logtime("mermaid html loaded")
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
        return { error }
      }
    }, code, cfg)

    if (result.error) {
      throw result.error
    }

    return result.svg
  } catch (error) {
    console.log(error)
    throw error
  } finally {
    // await page.close()
  }
}