import { unbound } from '@unbound-app/cli/rollup';

const config = unbound(import.meta.url);

// Workaround: the minifier reads the `es` output format as "this chunk is a module" and, with @swc/core 1.16.22, drops
// the unused variable holding the plugin's exports, leaving a bundle with no `start` or `stop`. By then the chunk is an
// IIFE, so tell it that. Check `dist/index.js` still has them before removing this.
const index = config.plugins.findIndex((plugin) => plugin?.name === 'swc-minify');

if (index === -1) {
	throw new Error('Failed to patch the minifier: the Unbound preset has no swc-minify plugin.');
}

const minifier = config.plugins[index];

config.plugins[index] = {
	...minifier,
	renderChunk: {
		...minifier.renderChunk,
		handler(code, chunk, options) {
			return minifier.renderChunk.handler.call(this, code, chunk, {
				...options,
				format: 'iife',
			});
		},
	},
};

export default config;
