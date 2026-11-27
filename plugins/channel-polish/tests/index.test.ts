import { flux, startPlugin, stopPlugin } from '@unbound-app/api/testing';
import { settings } from '@unbound-app/settings';
import { beforeEach, describe, expect, test } from 'bun:test';

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
