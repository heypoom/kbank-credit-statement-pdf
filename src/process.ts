import * as csv from 'csv-parse'
import fs from 'fs/promises'
import inquirer from 'inquirer'

const fromCSV = (buf: Buffer): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    csv.parse(buf, {relax_column_count: true}, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

const search = (q: RegExp, txs: string[][]) => txs.filter((x) => q.test(x[2]))

const costsOf = (txs: string[][]): number[] =>
  txs.map((i) => parseFloat(i[4].replace(/,/g, ''))).filter((n) => !isNaN(n))

const sum = (s: number[]) => s.reduce((a, b) => a + b, 0)

const isNil = (s: string | null | undefined) => s === null || s === undefined

function query(pattern: string, txs: string[][]) {
  const items = search(new RegExp(pattern), txs)

  for (const item of items) {
    const [txd, pd, desc, A, B, C] = item

    console.log(`${txd} | ${desc} | ${A} | ${B} ${isNil(C) ? '' : `| ${C}`}`)
  }

  console.log('Sum:', sum(costsOf(items)))
}

async function main() {
  const buffer = await fs.readFile('./output/combined.csv')
  const txs = await fromCSV(buffer)

  while (true) {
    const q = await inquirer.prompt([
      {type: 'input', name: 'query', message: 'What is the transaction name?'},
    ])

    query(q.query, txs)
  }
}

main()
