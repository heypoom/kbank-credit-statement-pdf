import type { Component } from "solid-js";
import { createSignal } from "solid-js";

import { getTextFromPDF } from "./pdf-to-json/getTextFromPDF";
import { intoTransaction } from "./pdf-to-json/intoJSON";
import { preprocessLines } from "./pdf-to-json/preprocessLineItem";

const App: Component = () => {
  const [log, setLog] = createSignal();
  const [csv, setCSV] = createSignal<string>();

  async function onDrop() {
    const [file] = this.files;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = async (e) => {
      const text = await getTextFromPDF(reader.result as ArrayBuffer);
      const transactions = preprocessLines(text)
        .map(intoTransaction)
        .filter((tx) => tx);

      setCSV(JSON.stringify(transactions));
    };
  }

  return (
    <div>
      <h1>Upload Statements</h1>
      <input type="file" onChange={onDrop} multiple />

      <div>{csv()}</div>

      <div>f2: {JSON.stringify(log())}</div>
    </div>
  );
};

export default App;
