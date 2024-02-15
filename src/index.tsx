import type { Spec } from "./NativeNcwSdk";

const NcwSdk: Spec = require('./NativeNcwSdk').default;

export { NcwSdk };

export * from "./interfaces";
export * from "./types";

export { FireblocksNCWFactory } from "./FireblocksNCWFactory";