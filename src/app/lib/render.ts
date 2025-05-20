// ----------------------
// Launch Browser

import { Browser, Page, PuppeteerLaunchOptions } from "puppeteer-core"
import { createLogger } from "../render/timer"

let chrome = {} as any
let puppeteer: any

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("@sparticuz/chromium")
  puppeteer = require("puppeteer-core")
} else {
  puppeteer = require("puppeteer")
}

// In memory cache
const temp = {
  browser: undefined as Browser | undefined,
  page: undefined as Page | undefined
}

export async function launchBrowser() {
  let options = {} as PuppeteerLaunchOptions
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome.setHeadlessMode = true
    options = {
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      headless: chrome.headless,
      ignoreHTTPSErrors: true,
      dumpio: true
    }
  }
  const browser = await puppeteer.launch(options) as Browser
  temp.browser = browser
  return browser
}




// ----------------------
// Initialize Puppeteer

// @ts-ignore
import mermaidHTML from "./mermaid.html"

export async function initializePuppeteer(ev: any[]) {
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

    // Logging console messages from the page to the server console
    page.on('console', async (msg) => {
      const msgArgs = msg.args()
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue())
      }
    })

    // Set default timeout to 5 seconds
    page.setDefaultTimeout(5000)

    await page.setContent(mermaidHTML, { waitUntil: 'domcontentloaded' })
    logtime("mermaid html loaded")
    temp.page = page
    console.log("Page initialized.")
    return page
  } catch (error) {
    if (error instanceof Error) {
      error.message = "render.ts - initializePuppeteer: " + error.message
      throw error
    } else {
      throw new Error("render.ts - initializePuppeteer: " + error)
    }
  }
}




// ----------------------
// Initialize Mermaid

export async function initializeMermaid(page: Page, cfg: any) {
  await page.waitForSelector('#container')
  await page.evaluate(async (cfg) => {
    const { mermaid } = globalThis as unknown as { mermaid: Mermaid }
    mermaid.initialize({
      startOnLoad: false,
      ...cfg
    })
  }, cfg)
}




// ----------------------
// Render Code

import type { Mermaid } from "mermaid"


export async function renderCode(page: Page, code: string) {
  return page.evaluate(
    async code => {
      try {
        const { mermaid } = globalThis as unknown as { mermaid: Mermaid }
        const resEl = document.querySelector('#result');
        if (!resEl) throw new Error("Element #result not found in page.evaluate")
        const mres = await mermaid.render('graphDiv', code)
        resEl.innerHTML = mres.svg
        return mres
      } catch (error: unknown) {
        if (error instanceof Error) {
          error.message = "render.ts - renderCode: " + error.message
          throw error
        } else {
          throw new Error("render.ts - renderCode: " + error)
        }
      }
    },
    code
  )
}

export async function renderSVGAsPNG(page: Page, svg: string) {
  await page.evaluate(async svg => {
    const element = document.querySelector('#result');
    if (!element) throw new Error("Element #graphDiv not found in page.evaluate")
    element.innerHTML = svg
    // @ts-ignore
    element.style = 'background: transparent; width: fit-content;'
  }, svg)
  const element = await page.$('#result')
  if (!element) throw new Error("Element #result not found in puppeteer")
  const imgBuffer = await element.screenshot({ type: 'png', omitBackground: true })
  return imgBuffer
}

export async function renderSVGasHTML(page: Page, svg: string) {
  await page.evaluate(async svg => {
    const element = document.querySelector('#result');
    if (!element) throw new Error("Element #result not found in page.evaluate")
    element.innerHTML = svg
    // @ts-ignore
    element.style = 'background: transparent; width: fit-content;'
  }, svg)
  const html = await page.evaluate(() => document.documentElement.outerHTML)
  return html
}

// export async function renderCode<IsImage extends boolean>(page: Page, code: string, cfg: MermaidConfig, img: IsImage, html?: boolean) {

//   if (img) {
//     // const e = await page.$('#graphDiv')
//     // console.log(await e?.jsonValue())

//     // const aHandle = await page.evaluateHandle(() => document.body);
//     // const resultHandle = await page.evaluate(
//     //   (body, code) => {

//     //     return body.innerHTML
//     //   },
//     //   aHandle, code
//     // );
//     // console.log(await resultHandle.jsonValue());
//     // await resultHandle.dispose();

//     const c = await page.$('body')
//     console.log("before")
//     console.log(await c?.evaluate(el => el.innerHTML, c))

//     await page.evaluate(async (code) => {
//       const { mermaid } = globalThis as unknown as { mermaid: Mermaid }
//       document.body.style.background = 'transparent'
//       const element = document.querySelector('#graphDiv');
//       if (!element) throw new Error("Element #graphDiv not found in page.evaluate")
//       const { svg } = await mermaid.render('graphDiv', code);
//       element.innerHTML = svg;
//       element.style = 'background: transparent; width: fit;'
//       document.body.appendChild(element);
//     }, code)

//     const e = await page.$('body')
//     console.log("after")
//     console.log(await e?.evaluate(el => el.innerHTML, e))

//     if (html) {
//       const html = await page.evaluate(() => document.documentElement.outerHTML)
//       console.log(html)
//       return html as IsImage extends true ? Buffer : string
//     }

//     // const e = await page.$('#graphDiv')
//     // console.log(await element?.boundingBox())
//     // const e = await page.content()
//     // const f = await page.$('#hellloooe')
//     // console.log(await f?.getProperties())
//     const element = await page.$('#graphDiv')
//     if (!element) throw new Error("Element #graphDiv not found in puppeteer")
//     const imgBuffer = await element.screenshot({ type: 'png', omitBackground: true })

//     return imgBuffer as IsImage extends true ? Buffer : string
//   }



//   const result = await page.evaluate(
//     async (code, cfg) => {
//       const { mermaid } = globalThis as unknown as { mermaid: Mermaid }
//       mermaid.initialize({
//         startOnLoad: false,
//         ...cfg
//       })
//       try {
//         const { svg } = await mermaid.render('graphDiv', code)
//         return { svg }
//       } catch (error: unknown) {
//         if (error instanceof Error) {
//           error.message = "render.ts - renderCode: " + error.message
//           throw error
//         } else {
//           throw new Error("render.ts - renderCode: " + error)
//         }
//       }
//     },
//     code,
//     cfg
//   )
//   return result.svg as IsImage extends true ? Buffer : string
// }