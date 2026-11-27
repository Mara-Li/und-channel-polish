import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');

describe('build', () => {
	// The minifier once emptied the bundle while the build still succeeded: see rollup.config.mjs.
	test('exports what the client calls', async () => {
		const build = Bun.spawnSync(['bun', 'run', 'build'], { cwd: root });

		expect(build.exitCode).toBe(0);

		const code = await Bun.file(join(root, 'dist/index.js')).text();
		// The only calls the bundle makes while it loads.
		const unbound = {
			i18n: { createLocales: () => ({}) },
			storage: { define: () => ({ values: {} }) },
		};
		const bundle = new Function('unbound', `return ${code}`)(unbound) as {
			__load(): Record<string, unknown>;
		};
		const exports = bundle.__load();

		expect(exports.start).toBeFunction();
		expect(exports.stop).toBeFunction();
		expect(exports).toHaveProperty('SettingsPanel');
	}, 60_000);
});
