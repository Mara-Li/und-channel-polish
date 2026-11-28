import { flux, render, startPlugin, stopPlugin } from '@unbound-app/api/testing';
import { settings } from '@unbound-app/settings';
import { beforeEach, describe, expect, test } from 'bun:test';

import { searchGuilds } from '../src/lib/guilds';
import {
	addServer,
	readOverrides,
	removeServer,
	setServerEnabled,
	setServerTransforms,
} from '../src/lib/overrides';

type Channel = { id: string; type: number; guild_id: string | null; name: string };

const FANCY = '𝗴𝗲𝗻𝗲𝗿𝗮𝗹-chat';

let here: Channel;
let elsewhere: Channel;

beforeEach(() => {
	here = { id: '1', type: 0, guild_id: '100', name: FANCY };
	elsewhere = { id: '2', type: 0, guild_id: '200', name: FANCY };

	const channels: Record<string, Channel> = { '1': here, '2': elsewhere };
	const guilds: Record<string, { id: string; name: string; icon: null }> = {
		'100': { id: '100', name: 'Zebra', icon: null },
		'200': { id: '200', name: 'Aardvark', icon: null },
	};

	flux.seed({
		Channel: { getChannel: (id: string) => channels[id], emitChange: () => {} },
		GuildChannel: {},
		Guild: { getGuilds: () => guilds, getGuild: (id: string) => guilds[id] },
	});
});

// Starts the plugin and has it patch both channels, as Discord reading them would.
async function start() {
	await startPlugin();

	const { flux: api } = await import('@unbound-app/api');
	const store = api.getStore('Channel');

	store.getChannel('1');
	store.getChannel('2');
}

describe('server overrides', () => {
	test('leaves the names of a disabled server unchanged, live', async () => {
		await start();
		expect(here.name).toBe('general-chat');

		addServer('100');
		setServerEnabled('100', false);

		expect(here.name).toBe(FANCY);
		expect(elsewhere.name).toBe('general-chat');
		await stopPlugin();
	});

	test('applies the settings of the server instead of the global ones', async () => {
		await start();
		addServer('100');
		setServerTransforms('100', 'guildText', { replaceHyphen: true });
		settings.guildText.casing = 'capitalize';

		expect(here.name).toBe('general chat');
		expect(elsewhere.name).toBe('General-Chat');
		await stopPlugin();
	});

	test('starts a server from a copy of the global settings', async () => {
		await start();
		settings.guildText.replaceHyphen = true;
		addServer('100');

		expect(here.name).toBe('general chat');
		await stopPlugin();
	});

	test('keeps the settings of a server added twice', async () => {
		await start();
		addServer('100');
		setServerEnabled('100', false);
		addServer('100');

		expect(readOverrides()['100']?.enabled).toBe(false);
		await stopPlugin();
	});

	test('follows the global settings once the server is removed', async () => {
		await start();
		addServer('100');
		setServerEnabled('100', false);
		removeServer('100');

		expect(here.name).toBe('general-chat');
		expect(readOverrides()).toEqual({});
		await stopPlugin();
	});

	test('searches the servers by name, leaving out the added ones', async () => {
		await start();

		expect(searchGuilds('', []).map(({ id }) => id)).toEqual(['200', '100']);
		expect(searchGuilds('zeb', []).map(({ id }) => id)).toEqual(['100']);
		expect(searchGuilds('', ['200']).map(({ id }) => id)).toEqual(['100']);
		await stopPlugin();
	});

	test('lists the added servers in the settings', async () => {
		await start();
		addServer('100');

		const { Discord } = await import('@unbound-app/api/metro/components');
		Object.assign(Discord, { useNavigation: () => ({ push: () => {} }) });

		const { SettingsPanel } = await import('../src/index');
		const panel = render(<SettingsPanel />);

		expect(panel.text()).toContain('Zebra');
		expect(panel.text()).toContain('Add server');
		await stopPlugin();
	});
});
