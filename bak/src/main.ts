import {PDFExtract} from 'pdf.js-extract'
import * as fs from 'fs/promises'

const P_DATE = /\d{2}\/\d{2}\/\d{2}/
const P_AMOUNT = /^-?\b\d[\d,.]*\b$/

const isDate = (s: string) => P_DATE.test(s)
const isAmount = (s: string) => P_AMOUNT.test(s) && s.includes('.')

const intoCSV = (t: string[][]) =>
  t.map((t) => t.map((x) => `"${x}"`).join(',')).join('\n')

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

  groups = groups
    .filter((g) => isDate(g[0]) && isDate(g[1]))
    .filter((g) => g.length > 3)

  return groups
}

async function parse(key: string): Promise<string[][]> {
  const extractor = new PDFExtract()
  const file = await extractor.extract(`./input/${key}.pdf`)

  console.log(`${key} has ${file.pages.length} pages`)

  const transactions = file.pages.flatMap((page) => {
    const contents = page.content.map((c) => c.str.trim()).filter((c) => c)

    return processLineItem(contents)
  })

  console.log(`${key} has ${transactions.length} transactions.`)

  await fs.writeFile(`./output/${key}.csv`, intoCSV(transactions))

  return transactions
}

async function main() {
  const fileNames = await fs.readdir('./input')
  const inputs = fileNames.map((k) => k.replace('.pdf', ''))

  const tasks = await Promise.all(inputs.map(parse))
  const transactions = tasks.flat()

  await fs.writeFile('./output/combined.csv', intoCSV(transactions))

  console.log('Done', transactions.length)
}

main()
