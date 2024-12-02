import wasm from "./Cargo.toml";

export async function loadWasm() {
    const exports = await wasm();
    console.log('exports', exports);
}
