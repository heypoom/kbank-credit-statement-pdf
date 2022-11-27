import * as csv from 'csv-parse'
import fs from 'fs/promises'
import inquirer from 'inquirer'

const P_DATE = /\d{2}\/\d{2}\/\d{2}/
const P_AMOUNT = /^-?\b\d[\d,.]*\b$/

const isDate = (s: string) => P_DATE.test(s)
const isAmount = (s: string) => P_AMOUNT.test(s) && s.includes('.')

const fromCSV = (buf: Buffer): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    csv.parse(buf, {relax_column_count: true}, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

const search = (q: RegExp, txs: string[][]) => txs.filter((x) => q.test(x[2]))

const amountOf = (s: string) => parseFloat(s.replace(/,/g, ''))

const costsOf = (txs: string[][]): number[] =>
  txs.map((i) => amountOf(i[4])).filter((n) => !isNaN(n))

const sum = (s: number[]) => s.reduce((a, b) => a + b, 0)

const isNil = (s: string | null | undefined) => s === null || s === undefined
const c = (s: string | null | undefined) => (isNil(s) ? '' : `| ${s}`)

interface Transaction {
  txd: string
  pd: string
  desc: string
  desc2?: string
  thb: number
  usd?: number
  usdRate?: number
}

function query(pattern: string, txs: string[][]) {
  const items = search(new RegExp(pattern), txs)

  for (const item of items) {
    const [txDate, postDate, D1, D2, D3, D4] = item

    console.log(txDate, c(D1), c(D2), c(D3), c(D4))
  }

  console.log('Sum:', sum(costsOf(items)))
}

async function prompt(txs: string[][]) {
  while (true) {
    const q = await inquirer.prompt([
      {type: 'input', name: 'query', message: 'What is the transaction name?'},
    ])

    query(q.query, txs)
  }
}

function fromTx(tx: string[]): Transaction | null {
  if (tx.length >= 6) {
    if (tx[4].includes('USD')) {
      const [txd, pd, desc, desc2, _, amt] = tx

      const thb = amountOf(amt)
      const usd = amountOf(tx[4].replace('USD ', ''))
      const usdRate = thb / usd

      return {txd, pd, desc, desc2, usd, thb, usdRate}
    }
  }

  return null
}

async function main() {
  const buffer = await fs.readFile('./output/combined.csv')
  const txs = await fromCSV(buffer)

  const mappedTxs = txs.map(fromTx).filter((x) => x)
  prompt(txs)
}

main()
