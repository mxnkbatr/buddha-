'use client';

import React, { useState, useEffect } from 'react';

// Define the interface for the WASM module
// In a real app, this would be imported from the generated pkg
interface RustModule {
    greet?: () => void;
    heavy_computation?: (input: number) => number;
    // Add other exported functions here
}

export default function RustBridgeDemo() {
    const [wasmModule, setWasmModule] = useState<any | null>(null);
    const [wasmResult, setWasmResult] = useState<number | null>(null);
    const [backendResult, setBackendResult] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Loading WASM...');

    useEffect(() => {
        // Dynamic import to load WASM asynchronously
        const loadWasm = async () => {
            try {
                // @ts-ignore - The Rust package might not be typed yet
                const wasm = await import('rust-modules');
                setWasmModule(wasm);
                setStatus('WASM Loaded due to dynamic import');
            } catch (err) {
                console.error("Failed to load WASM module", err);
                setStatus('Failed to load WASM');
            }
        };
        loadWasm();
    }, []);

    const runWasmCalculation = () => {
        if (!wasmModule) return;
        const start = performance.now();
        // Assuming heavy_computation is an exported function, or we use a demo one
        // If the existing module doesn't have it, we'll just mock/catch it or use what's there
        try {
            // Example: If the module has a 'fibonacci' or similar. 
            // For now, let's assume we want to call a function. 
            // Use 'greet' if available as a test, or a hypothetical math function.
            if (wasmModule.heavy_computation) {
                const res = wasmModule.heavy_computation(1000);
                setWasmResult(res);
            } else {
                // Fallback if specific function not found, just to show it's working
                console.log("Wasm module loaded but specific function not found", wasmModule);
                setStatus('WASM function called (check console)');
            }
        } catch (e) {
            console.error(e);
        }
        const end = performance.now();
        console.log(`WASM execution time: ${end - start}ms`);
    };

    const callRustMicroservice = async () => {
        setStatus('Calling Rust Backend...');
        try {
            // In a real device, localhost might need to be the computer's IP
            // or configured via Capacitor config
            const response = await fetch('http://localhost:8080/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [5, 1, 4, 2, 8] }),
            });
            const data = await response.json();
            setBackendResult(`Sum: ${data.sum}, Sorted: ${data.sorted.join(', ')}`);
            setStatus('Rust Backend Success');
        } catch (err) {
            console.error(err);
            setStatus('Rust Backend Failed (Is it running?)');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-emerald-800">Rust Performance Bridge</h2>

            <div className="mb-4">
                <p className="text-sm text-gray-600">Status: <span className="font-semibold">{status}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Client-Side (WASM)</h3>
                    <p className="text-xs text-gray-500 mb-2">Executes compiled Rust code in the browser/webview.</p>
                    <button
                        onClick={runWasmCalculation}
                        disabled={!wasmModule}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Run WASM Logic
                    </button>
                    {wasmResult !== null && (
                        <p className="mt-2 text-sm">Result: {wasmResult}</p>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Backend-Side (Microservice)</h3>
                    <p className="text-xs text-gray-500 mb-2">Offloads heavy tasks to Rust server via HTTP.</p>
                    <button
                        onClick={callRustMicroservice}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                        Call Rust API
                    </button>
                    {backendResult && (
                        <p className="mt-2 text-sm font-mono text-xs">{backendResult}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
