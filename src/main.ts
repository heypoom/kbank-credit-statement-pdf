import {PDFExtract} from 'pdf.js-extract'
import * as fs from 'fs/promises'

const isDate = (s: string) => /\d{2}\/\d{2}\/\d{2}/.test(s)

function processLineItem(contents: string[]): string[][] {
    const startIndex = contents.findIndex(isDate)

    const lines = contents.slice(startIndex)
    let groups: string[][] = []

    let p = 0
    let tx = 0
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Start transaction processing
        if (isDate(line)) {
            if (p === 2) {
                p = 1
                tx += 1
            } else {
                p += 1
            }
        }

        if (!groups[tx]) groups[tx] = []

        // Transaction Processing
        groups[tx].push(line)
    
    }
    
    groups[tx] = groups[tx].slice(0, 5)

    return groups
}

async function main() {
    const extractor = new PDFExtract()
    const file = await extractor.extract('./input/in.pdf')
    console.log(file.pages.length)

    const transactions = file.pages.slice(2).flatMap(page => {
        const contents = page.content.map(c => c.str.trim()).filter(c => c)

        return processLineItem(contents)
    })
    
    console.log(transactions.length)
    
    const csv = transactions.map(t => t.map(x => `"${x}"`).join(',')).join('\n')
    await fs.writeFile('./tx.csv', csv)
}

main()
