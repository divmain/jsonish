import jsonishWasm from "../Cargo.toml";

const {
  repair: _internalRepair,
} = await jsonishWasm();

/** @type {(s: string) => string} TypeScript syntax */
const repair = _internalRepair;

export {
  repair,
};
