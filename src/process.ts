import * as csv from 'csv-parse'
import fs from 'fs/promises'

const fromCSV = (buf: Buffer): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    csv.parse(buf, {relax_column_count: true}, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

const costsOf = (q: RegExp, txs: string[][]): number[] => {
  const items = txs.filter((x) => q.test(x[2]))

  return items
    .map((i) => parseFloat(i[4].replace(/,/g, '')))
    .filter((n) => !isNaN(n))
}

const sum = (s: number[]) => s.reduce((a, b) => a + b, 0)

async function main() {
  const buffer = await fs.readFile('./output/combined.csv')
  const txs = await fromCSV(buffer)

  const costs = costsOf(/GRAB/, txs)

  console.log('Costs:', costs)
  console.log('Sum:', sum(costs))
}

main()
