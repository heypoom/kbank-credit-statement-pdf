import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

export async function getTextFromPDF(buffer: ArrayBuffer): Promise<string[][]> {
  try {
    const doc = await getDocument({
      buffer,
      password: "11072001",
      data: buffer,
    }).promise;

    const contentsByPages: string[][] = [];

    for (let n = 1; n < doc.numPages; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();

      const texts = content.items.map((x) => {
        if ("str" in x) return x.str;
        return "";
      });

      contentsByPages.push(texts);
    }

    return contentsByPages;
  } catch (err) {
    alert(err.message);

    return [];
  }
}
