// ! THIS scripts doesn't scrape for ALL functions!
// ! Because emcc can't see macro aliasses those are ignored

let luaVersion, luaSource, outputDirectory

for (let index = 0; index < process.argv.length; index++) {
  const value = process.argv[index];
  
  if(value == '-version')
    luaVersion = process.argv[index + 1]

  if(value == '-output')
    outputDirectory = process.argv[index + 1]

  if(value == '-source')
    luaSource= process.argv[index + 1]
}

if(!outputDirectory)
  throw 'Output directory not provided! Specify where to build files.'

if(!luaVersion)
  throw 'Lua version not provided! Specify which version to look into.'

const { readFileSync, writeFileSync, existsSync } = require("fs")
const { search, getFilesFromDir } = require('search-in-file')
const fetch = require('node-fetch')
const jsdom = require("jsdom")
const { JSDOM } = jsdom

if(!luaSource){
  luaSource = `../../lua-${luaVersion}`
  //console.log(`No Lua source provided with -source, defaulting to ${luaSource}`)
}

if(!existsSync(luaSource))
  throw new 'Lua Source non-existant! Be sure to run this after downloading the source!'

const luaShortVersion = luaVersion.match(/(^\d.\d)/)[0]
const url = `https://www.lua.org/manual/${luaShortVersion}/manual.html`

fetch(url)
  .then((res) => res.text())
  .then((html) => {
    parseDocument(new JSDOM(html).window.document)
  })
  //.catch(console.error)

// Scrape for functions
let extractFunction = /^((?:const )?[^\s]*) ([^\s]*) \(([^)]*)\);/
let extractParameters = /([^,]+\(.+?\))|([^,]+)/g
let luaFunctions = {}
parseDocument = function(document){
  let functions = document.querySelectorAll('a[name^=lua]')

  for (const el of functions) {
    let signatureEl = el.closest('h3').nextSibling

    while(signatureEl.tagName != 'PRE'){
      signatureEl = signatureEl.nextSibling
    }

    const parts = signatureEl.innerHTML.match(extractFunction)

    if(parts == null){
      //console.error(`Could not automatically generate wrapper for function signature: ${signatureEl.innerHTML}`)
    }else{
      let [, returnType,, parameters] = parts

      let returns = (returnType == 'char' || returnType == 'const char') ? 'string' : 'number'
      let parameterTypes = []

      parameters.match(extractParameters).forEach(p => {
        p = p.trim()
        
        if(p.startsWith('char') || p.startsWith('const char'))
          parameterTypes.push('string')
        else if(p != 'void')
          parameterTypes.push('number')
      })

      luaFunctions[el.name] = {
        returnType: returns,
        parameterTypes: parameterTypes
      }
    }
  }

  // Remove functions that are registered with macros (which emcc can't see)
  getFilesFromDir(luaSource, true, true)
  .then((files) => {
    for (var f in files) {
      const filePath = files[f]

      for (const functionName in luaFunctions) {
        const textToSearch = `#define ${functionName}`

        const content = readFileSync(filePath, {encoding: "utf-8"})
        const result = search(content, textToSearch, {})
        if (result) {
          //console.log('found "' + functionName + '" to be macro (skipping)')
  
          delete luaFunctions[functionName]
        }
      }
    }
  })
  //.catch((e) => console.error(e))
}

process.on('exit', function() {
  let luaFunctionNames = JSON.stringify(Object.keys(luaFunctions).map(func => `_${func}`))
  
  writeFileSync(`${outputDirectory}/luafunctions.js`, `let luaFunctions = ${JSON.stringify(luaFunctions, null, 2)}`)

  console.log(luaFunctionNames);
})