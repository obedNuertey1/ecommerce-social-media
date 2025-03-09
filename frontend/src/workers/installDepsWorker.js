// src/installDepsWorker.js
import { expose } from 'comlink';
import { loadPyodide } from 'pyodide';

async function loadPyodideInstance() {
    // Load Pyodide from your local assets or CDN.
    const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/' });
    // First, load micropip so that you can install additional packages if needed.
    await pyodide.loadPackage("micropip");
    // Then, load other packages.
    await pyodide.loadPackage(['numpy', 'pandas', "requests"
        // , "logging", "re", "math", "filetype", "string", "random", "datetime", "webbrowser", "os"
    ]);
    // Install pandas using micropip to ensure it's available.
    await pyodide.runPythonAsync(`
import micropip
await micropip.install("threadspipepy")
await micropip.install("werkzeug")
  `);
    return pyodide;
}

// Start loading Pyodide as soon as the worker runs.
const pyodidePromise = loadPyodideInstance();

const api = {
    async installDeps() {
        const pyodide = await pyodidePromise;
        const response = await fetch("/pythonFiles/loadPandas.py");
        const pythonCode = await response.text();
        await pyodide.runPythonAsync(pythonCode);
        const loadPandasFunc = pyodide.globals.get("load_pandas");
        const loadNumpyFunc = pyodide.globals.get("load_numpy");
        const loadThreadsPipeFunc = pyodide.globals.get("load_threadspipe");
        const loadWerkzeugFunc = pyodide.globals.get("load_werkzeug");

        const loadThreadsPipeResult = loadThreadsPipeFunc();
        const loadPandasResult = loadPandasFunc();
        const loadNumpyResult = loadNumpyFunc();
        const loadWerkzeugResult = loadWerkzeugFunc();
        return JSON.stringify({ pandas: loadPandasResult, numpy: loadNumpyResult, threadsPipe: loadThreadsPipeResult, werzeug: loadWerkzeugResult });
    }
};

expose(api);
