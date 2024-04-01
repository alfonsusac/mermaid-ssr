export function createLogger(prefix?: string, _ev?: { name: string, time: number }[]) {
  const ev = _ev ?? []
  let mark = performance.now()
  let initial = mark

  return {
    ev,
    logtime(name: string) {
      const temp = performance.now()
      ev.push({ name: (prefix ?? "") + name, time: _2dp(temp - mark) })
      mark = temp
    },
    final(name: string) {
      const temp = performance.now()
      ev.push({ name: name, time: _2dp(temp - initial) })
    }
  }
}


function _2dp(num: number) {
  return Math.round(num * 100) / 100000
}