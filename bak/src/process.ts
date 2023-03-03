import * as csv from "csv-parse";
import fs from "fs/promises";
import inquirer from "inquirer";

const fromCSV = (buf: Buffer): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    csv.parse(buf, { relax_column_count: true }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

async function main() {
  const buffer = await fs.readFile("./output/combined.csv");
  const lines = await fromCSV(buffer);
  const txs = lines.map(fromTx).filter((x) => x) as Transaction[];

  await fs.writeFile("./output/cleaned.csv", intoCSV(txs));
  await prompt(txs);
}

main();
