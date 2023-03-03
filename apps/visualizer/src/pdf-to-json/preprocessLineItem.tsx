const P_DATE = /\d{2}\/\d{2}\/\d{2}/;
const P_AMOUNT = /^-?\b\d[\d,.]*\b$/;

const isDate = (s: string) => P_DATE.test(s);
const isAmount = (s: string) => P_AMOUNT.test(s) && s.includes(".");

export const intoCSV = (t: string[][]) =>
  t.map((t) => t.map((x) => `"${x}"`).join(",")).join("\n");

export function preprocessLineItem(contents: string[]): string[][] {
  const startIndex = contents.findIndex(isDate);

  const lines = contents.slice(startIndex).map((line) => line.trim());
  let groups: string[][] = [];

  let tx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!groups[tx]) groups[tx] = [];

    // Transaction Processing
    groups[tx].push(line);

    if (isAmount(line)) tx += 1;
  }

  groups = groups.map((g) => g.filter((x) => x));

  const [a] = groups;

  return groups
    .filter((g) => isDate(g[0]) && isDate(g[1]))
    .filter((g) => g.length > 3);
}

export const preprocessLines = (pages: string[][]) =>
  pages.flatMap(preprocessLineItem);
