import csv from 'csv-parse'
import fs from 'fs/promises'

const fromCSV = (buf: Buffer): Promise<string[][]> => new Promise((resolve, reject) => {
  csv.parse(buf, {relax_column_count: true}, (err, data) => {
    if (err) reject(err)
    else resolve(data)
  })
})

async function main() {
  const buffer = await fs.readFile('./tx.csv')
  const txs = await fromCSV(buffer)

  const items = txs.filter(x => /GRAB/.test(x[2]))
  const costs = items.map(i => parseFloat(i[4].replace(/,/g, "")))
  console.log(costs)

  console.log('Sum:', costs.reduce((a, b) => a + b))
}

main()

