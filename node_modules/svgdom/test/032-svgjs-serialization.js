import assert from 'assert'
import { createSVGWindow } from '../main-module.js'
import { SVG, registerWindow } from '@svgdotjs/svg.js'

// https://github.com/svgdotjs/svgdom/issues/141
describe('svg.js serialization', () => {
  it('serializes a canvas whose default namespace was set with setAttribute', () => {
    const window = createSVGWindow()
    const document = window.document
    registerWindow(window, document)

    const canvas = SVG(document.documentElement)
    canvas.rect(10, 10)

    const markup = canvas.svg()
    assert.match(markup, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" /)
    assert.strictEqual(
      markup.match(/xmlns="http:\/\/www.w3.org\/2000\/svg"/g).length,
      1
    )
    assert.match(markup, /xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/)
    assert.match(markup, /<rect width="10" height="10"><\/rect>/)
  })
})
