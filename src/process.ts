import * as csv from 'csv-parse'
import fs from 'fs/promises'
import inquirer from 'inquirer'

const P_DATE = /\d{2}\/\d{2}\/\d{2}/
const P_AMOUNT = /^-?\b\d[\d,.]*\b$/
const P_CURR = /^(USD|JPY)/

const isDate = (s: string) => P_DATE.test(s)
const isAmount = (s: string) => P_AMOUNT.test(s) && s.includes('.')

const fromCSV = (buf: Buffer): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    csv.parse(buf, {relax_column_count: true}, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

const amountOf = (s: string | null | undefined) =>
  parseFloat(s?.replace(/,/g, '') ?? '')

const sum = (s: number[]) => s.reduce((a, b) => a + b, 0)

const isNil = (s: string | number | null | undefined) =>
  s === null || s === undefined

const c = (s: string | number | null | undefined) => (isNil(s) ? '' : `| ${s}`)

interface Transaction {
  txd: string
  pd: string
  desc: string
  desc2?: string
  desc3?: string
  thb: number
  usd?: number
  usdRate?: number
}

async function prompt(txs: Transaction[]) {
  while (true) {
    const q = await inquirer.prompt([
      {type: 'input', name: 'query', message: 'What is the transaction name?'},
    ])

    const p = new RegExp(q.query)

    const filtered = txs.filter(
      (t) => p.test(t.desc) || (t.desc2 && p.test(t.desc2))
    )

    for (const t of filtered) {
      console.log(
        t.txd,
        c(t.desc),
        c(t.desc2),
        c(t.thb),
        c(t.usd),
        c(t.usdRate)
      )
    }
  }
}

const intoCSV = (txs: Transaction[]): string =>
  'txd,pd,desc,desc2,desc3,thb,usd,usdRate\n' +
  txs
    .map((t) =>
      [t.txd, t.pd, t.desc, t.desc2, t.desc3, t.thb, t.usd, t.usdRate]
        .map((n) => (isNil(n) ? '' : n))
        .map((i) => `"${i}"`)
        .join(',')
    )
    .join('\n')

function fromTx(tx: string[]): Transaction | null {
  if (tx.length <= 5) {
    const [txd, pd, desc, desc2, amt] = tx

    return {txd, pd, desc, desc2, thb: amountOf(amt)}
  }

  if (tx.length >= 6) {
    const usdIdx = tx.findIndex((x) => P_CURR.test(x))

    if (usdIdx > -1) {
      const [txd, pd, desc, desc2, _, amt] = tx

      const thb = amountOf(amt)
      const usd = amountOf(tx[usdIdx].replace(P_CURR, '').trim())
      const usdRate = thb / usd

      return {txd, pd, desc, desc2, usd, thb, usdRate}
    }
  }

  if (tx.length === 6) {
    const [txd, pd, desc, desc2, desc3, amt] = tx

    return {txd, pd, desc, desc2, desc3, thb: amountOf(amt)}
  }

  return null
}

async function main() {
  const buffer = await fs.readFile('./output/combined.csv')
  const lines = await fromCSV(buffer)
  const txs = lines.map(fromTx).filter((x) => x) as Transaction[]

  await fs.writeFile('./output/cleaned.csv', intoCSV(txs))
  await prompt(txs)
}

main()
