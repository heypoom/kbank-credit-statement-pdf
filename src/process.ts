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
const c = (s: string | null | undefined) => (isNil(s) ? '' : `| ${s}`)

function query(pattern: string, txs: string[][]) {
  const items = search(new RegExp(pattern), txs)

  for (const item of items) {
    const [txDate, postDate, D1, D2, D3, D4] = item

    console.log(txDate, c(D1), c(D2), c(D3), c(D4))
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
