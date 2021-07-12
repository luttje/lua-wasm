const scrapy = require('node-scrapy')
const fetch = require('node-fetch')

const url = 'https://www.lua.org/versions.html'
const model = 'a[HREF^="ftp/lua-"]'

fetch(url)
  .then((res) => res.text())
  .then((body) => {
    console.log(scrapy.extract(body, model).trim().replace('Lua ', ''))
  })
  .catch(console.error)