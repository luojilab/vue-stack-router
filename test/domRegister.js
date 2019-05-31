const jsdom = require('jsdom-global')
module.exports.default = jsdom(undefined,{
  url: 'http://localhost',
  globalize: true,
  console: true,
  useEach: false,
  skipWindowCheck: false,
  html:
    "<!doctype html><html><head><meta charset='utf-8'></head>" +
    '<body></body></html>'
})
