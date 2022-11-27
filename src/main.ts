import {PDFExtract} from 'pdf.js-extract'
import * as fs from 'fs/promises'

const P_DATE = /\d{2}\/\d{2}\/\d{2}/
const P_AMOUNT = /^-?\b\d[\d,.]*\b$/

const isDate = (s: string) => P_DATE.test(s)
const isAmount = (s: string) => P_AMOUNT.test(s) && s.includes('.')

function processLineItem(contents: string[]): string[][] {
  const startIndex = contents.findIndex(isDate)

  const lines = contents.slice(startIndex)
  let groups: string[][] = []

  let p = 0
  let tx = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!groups[tx]) groups[tx] = []

    // Transaction Processing
    groups[tx].push(line)

    if (isAmount(line)) tx += 1
  }

  groups = groups.filter((g) => isDate(g[0]) && isDate(g[1]))

  return groups
}

async function parse(key: string) {
  const extractor = new PDFExtract()
  const file = await extractor.extract(`./input/${key}.pdf`)

  console.log(`${key} has ${file.pages.length} pages`)

  const transactions = file.pages.flatMap((page) => {
    const contents = page.content.map((c) => c.str.trim()).filter((c) => c)

    return processLineItem(contents)
  })

  console.log(`${key} has ${transactions.length} transactions.`)

  const csv = transactions
    .map((t) => t.map((x) => `"${x}"`).join(','))
    .join('\n')

  await fs.writeFile(`./output/${key}.csv`, csv)
}

async function main() {
  const fileNames = await fs.readdir('./input')
  const inputs = fileNames.map((k) => k.replace('.pdf', ''))

  await Promise.all(inputs.map(parse))

  console.log('Done')
}

main()
