//src/components/kaspa/RpcContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as kaspa from './kaspa';
import kaspaWasmUrl from './kaspa_bg.wasm?url';


const RpcClientContext = createContext();

const loadWasm = async (setError) => {
    try {
        await kaspa.default(kaspaWasmUrl);
        return true; // Indicate success
    } catch (err) {
        console.error("Error loading WASM module:", err);
        setError('Failed to load WASM module. Please try again later.');
        return false; // Indicate failure
    }
};

const initializeRPC = async (setRpcClient, setError) => {
    try {
        const client = new kaspa.RpcClient({
            resolver: new kaspa.Resolver(),
            networkId: 'mainnet',
        });

        await client.connect();
        console.log("Connected to rpcContext");



        setRpcClient(client);
    } catch (err) {
        setError('Error connecting to RPC. Please check the endpoint.');
        console.error('Connection error:', err);
    }
};


export const RpcClientProvider = ({ children }) => {
    const [rpcClient, setRpcClient] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const setup = async () => {
            const wasmLoaded = await loadWasm(setError);
            if (wasmLoaded) {
                await initializeRPC(setRpcClient, setError);
            }
        };

        setup();
    }, []);

    return (
        <RpcClientContext.Provider value={{ rpcClient, error }}>
            {children}
        </RpcClientContext.Provider>
    );
};

export const useRpcClient = () => {
    return useContext(RpcClientContext);
};
