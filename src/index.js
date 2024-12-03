import jsonishWasm from "../Cargo.toml";

/** @type Promise<{ repair: (brokenJson: string) => string; }> */
export async function load() {
  const {
    repair: _internalRepair,
  } = await jsonishWasm();

  /** @type {(s: string) => string} */
  const repair = _internalRepair;

  return {
    repair,
  };
}
