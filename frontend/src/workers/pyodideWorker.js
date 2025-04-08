// src/pyodideWorker.js
import { expose } from 'comlink';
// import { loadPyodide } from 'pyodide';

// async function loadPyodideInstance() {
//   // Load Pyodide from your local assets or CDN.
//   const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/' });
//   return pyodide;
// }

// // Start loading Pyodide as soon as the worker runs.
// const pyodidePromise = loadPyodideInstance();

// Define an API that runs Python code.
const api = {
  // async runPython(val) {
  //   // Wait for Pyodide to load.
  //   const pyodide = await pyodidePromise;

  //   const response = await fetch("/pythonFiles/helloWorld.py");
  //   const pythonCode = await response.text();
  //   await pyodide.runPythonAsync(pythonCode);
  //   const helloFunction = pyodide.globals.get("func");
  //   const result = helloFunction(val);
  //   return result;
  //   // Execute the Python code asynchronously.
  // }
};

// Expose the API to the main thread using Comlink.
expose(api);