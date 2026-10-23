import {defineConfig} from 'vite';
import {getNodeBuildProvenance} from './scripts/node-provenance.mjs';
// Exact build-time fingerprint of the checked-out math sources and lockfile.
// Do not embed secrets or platform identifiers in the public bundle.
const fingerprint=await getNodeBuildProvenance();
export default defineConfig({define:{__QUASI_BUILD_PROVENANCE__:JSON.stringify(fingerprint)}});
