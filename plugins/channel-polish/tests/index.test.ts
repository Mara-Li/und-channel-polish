import { flux, startPlugin, stopPlugin } from '@unbound-app/api/testing';
import { settings } from '@unbound-app/settings';
import { beforeEach, describe, expect, test } from 'bun:test';

import { DEFAULT_TRANSFORMS } from '../src/lib/transform';

type Channel = { id: string; type: number; name: string };

let text: Channel;
let voice: Channel;
let group: Channel;
let redraws: number;

beforeEach(() => {
	text = { id: '1', type: 0, name: '💬┃𝗴𝗲𝗻𝗲𝗿𝗮𝗹-ᴄʜᴀᴛ' };
	voice = { id: '2', type: 2, name: 'ｌｏｕｎｇｅ-room' };
	group = { id: '3', type: 3, name: '𝓯𝓻𝓲𝓮𝓷𝓭𝓼' };
	redraws = 0;

	const channels: Record<string, Channel> = { '1': text, '2': voice };

	flux.seed({
		Channel: {
			getChannel: (id: string) => channels[id],
			getMutablePrivateChannels: () => ({ '3': group }),
			emitChange: () => {
				redraws++;
			},
		},
		GuildChannel: {
			getChannels: () => ({ VOCAL: [{ channel: voice }], count: 1 }),
		},
	});
});

// The stores the plugin patched, read the way Discord reads them.
async function read() {
	const { flux: api } = await import('@unbound-app/api');
	const channels = api.getStore('Channel') as unknown as {
		getChannel(id: string): Channel;
		getMutablePrivateChannels(): Record<string, Channel>;
	};
	const guildChannels = api.getStore('GuildChannel') as unknown as {
		getChannels(guildId: string): unknown;
	};

	return { channels, guildChannels };
}

describe('channel names', () => {
	test('replaces fancy Unicode by default', async () => {
		await startPlugin();
		const { channels } = await read();

		expect(channels.getChannel('1').name).toBe('💬general-chat');
		await stopPlugin();
	});

	test('transforms the channels of every patched getter', async () => {
		await startPlugin();
		const { channels, guildChannels } = await read();

		channels.getMutablePrivateChannels();
		guildChannels.getChannels('guild');

		expect(group.name).toBe('friends');
		expect(voice.name).toBe('lounge-room');
		await stopPlugin();
	});

	test('applies the settings of the channel type, live', async () => {
		await startPlugin();
		const { channels } = await read();

		channels.getChannel('1');
		channels.getChannel('2');
		const before = redraws;

		settings.guildText.replaceHyphen = true;
		settings.guildText.casing = 'capitalize';

		expect(text.name).toBe('💬General Chat');
		expect(voice.name).toBe('lounge-room');
		expect(redraws).toBeGreaterThan(before);
		await stopPlugin();
	});

	test('shows the original name while its settings are open', async () => {
		await startPlugin();
		const { channels } = await read();
		const original = text.name;

		channels.getChannel('1');
		expect(text.name).toBe('💬general-chat');
		const before = redraws;

		await flux.dispatch({ type: 'CHANNEL_SETTINGS_INIT', channelId: '1' } as never);
		expect(text.name).toBe(original);
		expect(redraws).toBe(before + 1);

		await flux.dispatch({ type: 'CHANNEL_SETTINGS_CLOSE' });
		expect(text.name).toBe('💬general-chat');
		expect(redraws).toBe(before + 2);
		await stopPlugin();
	});

	test('transforms a name Discord writes to the record', async () => {
		await startPlugin();
		const { channels } = await read();

		channels.getChannel('1');
		text.name = '𝗻𝗲𝘄𝘀';

		expect(text.name).toBe('news');
		await stopPlugin();
	});

	test('patches the record a channel update names', async () => {
		await startPlugin();

		await flux.dispatch({ type: 'CHANNEL_UPDATES', channels: [{ id: '1' }] } as never);

		expect(text.name).toBe('💬general-chat');
		await stopPlugin();
	});

	test.each(['getMutableGuildChannelsForGuild', 'getMutableBasicGuildChannelsForGuild'])(
		'transforms the channels %s returns',
		async (getter) => {
			flux.seed({ Channel: { [getter]: () => ({ '1': text }) } });
			await startPlugin();
			const { channels } = await read();

			(channels as unknown as Record<string, (guildId: string) => void>)[getter]?.('guild');

			expect(text.name).toBe('💬general-chat');
			await stopPlugin();
		},
	);

	test('starts when Discord lacks the optional getters', async () => {
		flux.seed({
			Channel: { getMutablePrivateChannels: undefined },
			GuildChannel: { getChannels: undefined },
		});
		await startPlugin();
		const { channels } = await read();

		expect(channels.getChannel('1').name).toBe('💬general-chat');
		await stopPlugin();
	});

	test('ignores a channel Discord does not know', async () => {
		await startPlugin();
		const { channels } = await read();

		expect(channels.getChannel('unknown')).toBeUndefined();
		await stopPlugin();
	});

	test.each([
		[0, 'guildText'],
		[2, 'guildVoice'],
		[3, 'groupDm'],
		[4, 'guildCategory'],
		[10, 'announcementThread'],
		[11, 'publicThread'],
		[12, 'privateThread'],
		[15, 'guildForum'],
		[16, 'mediaChannel'],
	] as const)('gives a channel of type %i the %s settings', async (type, section) => {
		text.type = type;
		text.name = 'a-b';
		settings[section].replaceHyphen = true;
		await startPlugin();
		const { channels } = await read();

		expect(channels.getChannel('1').name).toBe('a b');
		await stopPlugin();
	});

	// settings.ts spells out every section, so check none drifted from the others.
	test.each([
		'guildText',
		'guildVoice',
		'guildForum',
		'mediaChannel',
		'guildCategory',
		'announcementThread',
		'publicThread',
		'privateThread',
		'groupDm',
	] as const)('starts the %s settings with the default transforms', (section) => {
		expect({ ...settings[section] }).toEqual(DEFAULT_TRANSFORMS);
	});

	// 5 is an announcement channel and 13 a stage channel, which have no settings.
	test.each([5, 13])('only replaces fancy Unicode for type %i', async (type) => {
		text.type = type;
		settings.guildText.replaceHyphen = true;
		settings.guildText.casing = 'capitalize';
		await startPlugin();
		const { channels } = await read();

		expect(channels.getChannel('1').name).toBe('💬general-chat');
		await stopPlugin();
	});

	test('leaves fancy Unicode when its setting is off', async () => {
		const original = text.name;

		await startPlugin();
		const { channels } = await read();

		channels.getChannel('1');
		settings.guildText.noFancy = false;

		expect(text.name).toBe(original);
		await stopPlugin();
	});

	test('applies a setting changed while the channel settings were open', async () => {
		await startPlugin();
		const { channels } = await read();
		const original = text.name;

		channels.getChannel('1');
		expect(text.name).toBe('💬general-chat');

		await flux.dispatch({ type: 'CHANNEL_SETTINGS_INIT', channelId: '1' } as never);
		settings.guildText.replaceHyphen = true;
		expect(text.name).toBe(original);

		await flux.dispatch({ type: 'CHANNEL_SETTINGS_CLOSE' });
		expect(text.name).toBe('💬general chat');
		await stopPlugin();
	});

	test('keeps the other channels transformed while one is edited', async () => {
		await startPlugin();
		const { channels } = await read();

		channels.getChannel('1');
		channels.getChannel('2');
		await flux.dispatch({ type: 'CHANNEL_SETTINGS_INIT', channelId: '1' } as never);

		expect(voice.name).toBe('lounge-room');
		await stopPlugin();
	});

	test('patches the record a channel creation names', async () => {
		await startPlugin();

		await flux.dispatch({ type: 'CHANNEL_CREATE', channel: { id: '2' } } as never);

		expect(voice.name).toBe('lounge-room');
		await stopPlugin();
	});

	test('gives back the latest name of a record read several times', async () => {
		await startPlugin();
		const { channels } = await read();

		channels.getChannel('1');
		channels.getChannel('1');
		text.name = '𝗻𝗲𝘄𝘀';
		await stopPlugin();

		expect(text.name).toBe('𝗻𝗲𝘄𝘀');
	});

	test('transforms again after a restart, forgetting the channel being edited', async () => {
		await startPlugin();
		await flux.dispatch({ type: 'CHANNEL_SETTINGS_INIT', channelId: '1' } as never);
		await stopPlugin();

		await startPlugin();
		const { channels } = await read();

		expect(channels.getChannel('1').name).toBe('💬general-chat');
		await stopPlugin();
	});

	test('gives the names back on stop', async () => {
		await startPlugin();
		const { channels } = await read();
		const original = text.name;

		channels.getChannel('1');
		await stopPlugin();

		expect(text.name).toBe(original);
		expect(Object.getOwnPropertyDescriptor(text, 'name')?.value).toBe(original);
	});
});
