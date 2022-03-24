figma.showUI(__html__)
function componentToRGBNumber(c: number) {
  return Math.round(c * 255)
}
function componentToHex(c: number) {
  var hex = (componentToRGBNumber(c) | (1 << 8)).toString(16).slice(1)
  return hex.length == 1 ? '0' + hex : hex
}

function rgbaToHex(r: number, g: number, b: number, a?: number) {
  let hex = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  let alpha = a ? String(a) : '1'
  alpha =
    alpha === '1'
      ? ''
      : ((Number(alpha) * 255) | (1 << 8)).toString(16).slice(1)
  return hex + alpha
}
async function changeText(name: string, colorName: string) {
  const test = figma.currentPage.findOne((n) => {
    return n.name === name
  })

  if (test && test.type === 'TEXT') {
    await figma.loadFontAsync(test.fontName as FontName)
    test.deleteCharacters(0, test.characters.length)
    test.insertCharacters(0, colorName)
  }
}
async function colorText(paintItem: Paint, name: string) {
  if (paintItem.type === 'SOLID') {
    const hexColor = rgbaToHex(
      paintItem.color.r,
      paintItem.color.g,
      paintItem.color.b,
      1
    )
    const opacityText =
      typeof paintItem.opacity === 'number' && paintItem.opacity < 1
        ? `, opacity ${(paintItem.opacity * 100).toFixed(0)}`
        : ''
    console.log('opacityText', opacityText)

    return await changeText(name, hexColor + opacityText)
  } else if (paintItem.type === 'IMAGE') {
  } else {
    const complexColor = paintItem.gradientStops
      .map((paintItem) => {
        const hexColor = rgbaToHex(
          paintItem.color.r,
          paintItem.color.g,
          paintItem.color.b,
          paintItem.color.a
        )
        return hexColor
      })
      .join(', ')

    return await changeText(name, complexColor)
  }
}
function promiseSync() {
  return new Promise((res, rej) => {
    const paintStyles = figma.getLocalPaintStyles()
    const allDone = paintStyles.map((paint: PaintStyle) => {
      paint.paints.map(async (paintItem) => {
        await colorText(paintItem, paint.name)
      })
      return true
    })
    if (allDone) {
      res({})
    } else {
      rej('unexpected error')
    }
  })
}
async function colorSync() {
  await promiseSync()
}
colorSync()

figma.ui.onmessage = (msg) => {
  figma.closePlugin()
}
