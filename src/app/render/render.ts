import { Mermaid } from "mermaid"
import { Browser } from "puppeteer-core"
import { getDomain } from "../url"

export async function renderCode(
  browser: Browser
) {

  const page = await browser.newPage()

  page.on('console', async (msg) => {
    const msgArgs = msg.args()
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue())
    }
  })

  try {
    await page.goto(getDomain() + '/mermaid.html')
    console.log("content set")

    await page.waitForSelector('#container')
    const text = await page.evaluate(async () => {
      const { mermaid } = globalThis as unknown as { mermaid: Mermaid }

      const graphDefinition = 'graph TB\na-->b'
      const { svg } = await mermaid.render('graphDiv', graphDefinition)
      // console.log(svg)
      return svg

    })
    // console.log("Result:", text)
    console.log('end')

    return text
  } catch (error) {
    console.log(error)
  } finally {
    await page.close()
  }

  return 'nice'
}