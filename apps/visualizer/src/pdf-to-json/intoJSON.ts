export interface Transaction {
  transactionDate: string;
  paymentDate: string;
  desc: string;
  desc2?: string;
  desc3?: string;
  thb: number;
  usd?: number;
  usdRate?: number;
}

const P_CURR = /^(USD|JPY)/;

const amountOf = (s: string | null | undefined) =>
  parseFloat(s?.replace(/,/g, "") ?? "");

export function intoTransaction(tx: string[]): Transaction | null {
  if (tx.length === 4) {
    const [transactionDate, paymentDate, desc, amt] = tx;

    return { transactionDate, paymentDate, desc, thb: amountOf(amt) };
  }

  if (tx.length === 5) {
    const [transactionDate, paymentDate, desc, desc2, amt] = tx;

    return { transactionDate, paymentDate, desc, desc2, thb: amountOf(amt) };
  }

  if (tx.length >= 6) {
    const usdIdx = tx.findIndex((x) => P_CURR.test(x));

    if (usdIdx > -1) {
      const [transactionDate, paymentDate, desc, desc2, _, amt] = tx;

      const thb = amountOf(amt);
      const usd = amountOf(tx[usdIdx].replace(P_CURR, "").trim());
      const usdRate = thb / usd;

      return { transactionDate, paymentDate, desc, desc2, usd, thb, usdRate };
    }
  }

  if (tx.length === 6) {
    const [transactionDate, paymentDate, desc, desc2, desc3, amt] = tx;

    return {
      transactionDate,
      paymentDate,
      desc,
      desc2,
      desc3,
      thb: amountOf(amt),
    };
  }

  return null;
}
