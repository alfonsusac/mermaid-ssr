import { cn } from "lazy-cn"
import { codeToHtml } from "shiki"

export async function getCodeProps(
  code: string,
  language?: string,
  className?: string,
) {

  const __html = await codeToHtml(code, {
    lang: language ?? "tsx",
    theme: "catppuccin-macchiato",
    transformers: [{
      pre: (pre) => {
        const style = pre.properties.style?.toString()
        if (style) {
          const newStyle = style.split(';').filter(s => !s.includes('background-color')).join(';')
          pre.properties.style = newStyle
        }
        const className = pre.properties.class?.toString()
        if (className) {
          pre.properties.class = cn(pre.properties.class, className )
        }
        return pre
      }
    }]
  })
  // console.log(__html)
  return {
    dangerouslySetInnerHTML: { __html }
  }
}

export async function CodeBlock(
  props: {
    children?: string,
    language?: string,
    className?: string,
  }
) {
  return (
    <div className={props.className} {...await getCodeProps(props.children ?? "")} />
  )
}