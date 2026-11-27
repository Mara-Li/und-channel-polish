import { flux, patcher, storage } from '@unbound-app/api';
import { settings } from '@unbound-app/settings';

import {
	CHANNEL_TYPE_KEYS,
	DEFAULT_TRANSFORMS,
	transformChannelName,
	type ChannelTransforms,
} from '~/lib/transform';

type Channel = { id: string; type?: number; name?: string };

type ChannelsById = Record<string, Channel | undefined>;

type ChannelStore = {
	emitChange(): void;
	getChannel(id: string): Channel | undefined;
	getMutableGuildChannelsForGuild(guildId: string): ChannelsById;
	getMutableBasicGuildChannelsForGuild(guildId: string): ChannelsById;
	getMutablePrivateChannels(): ChannelsById;
};

// `getChannels` groups a guild's channels by kind, such as `SELECTABLE` and `VOCAL`.
type GuildChannelStore = {
	getChannels(guildId: string): Record<string, unknown>;
};

/** Reads the name Discord gave each patched record. */
const originals = new Map<Channel, () => string>();

// The channel whose settings are open, which shows its original name so saving does not rename it.
let editing: string | null = null;
// Changes with the settings, so each record transforms its name again.
let generation = 0;

function transformsFor(type: number | undefined): ChannelTransforms {
	const key = CHANNEL_TYPE_KEYS[type as keyof typeof CHANNEL_TYPE_KEYS];

	return key ? settings[key] : DEFAULT_TRANSFORMS;
}

function patchChannel(channel: Channel | undefined): void {
	if (!channel || typeof channel.name !== 'string' || originals.has(channel)) return;

	let original = channel.name;
	let shown: { generation: number; source: string; value: string } | undefined;

	Object.defineProperty(channel, 'name', {
		configurable: true,
		enumerable: true,
		get() {
			if (channel.id === editing) return original;

			if (shown?.generation !== generation || shown.source !== original) {
				const value = transformChannelName(original, transformsFor(channel.type));

				shown = { generation, source: original, value };
			}

			return shown.value;
		},
		set(value: string) {
			original = value;
		},
	});
	originals.set(channel, () => original);
}

function patchChannelsById(channels: ChannelsById | undefined): void {
	for (const channel of Object.values(channels ?? {})) patchChannel(channel);
}

function patchChannelGroups(groups: Record<string, unknown> | undefined): void {
	for (const group of Object.values(groups ?? {})) {
		if (!Array.isArray(group)) continue;

		for (const entry of group) patchChannel((entry as { channel?: Channel })?.channel);
	}
}

function getChannelStore(): ChannelStore {
	return flux.getStore('Channel') as unknown as ChannelStore;
}

/**
 * @description Shows channel names transformed. Patches the `ChannelStore` and `GuildChannelStore` getters to give each
 * channel record they return a `name` getter, patches the records a channel update replaces, and shows the original name
 * while a channel's settings are open.
 */
export function patchChannelNames(): void {
	const ChannelStore = getChannelStore();
	const GuildChannelStore = flux.getStore('GuildChannel') as unknown as
		| GuildChannelStore
		| undefined;

	function refresh() {
		generation++;
		ChannelStore.emitChange();
	}

	// The cached names stay valid: the getter checks `editing` before reading them, so a redraw is enough.
	function edit(channelId: string | null) {
		editing = channelId;
		ChannelStore.emitChange();
	}

	patcher.after(ChannelStore, 'getChannel', ({ result }) => {
		patchChannel(result as Channel | undefined);
	});

	for (const getter of [
		'getMutableGuildChannelsForGuild',
		'getMutableBasicGuildChannelsForGuild',
		'getMutablePrivateChannels',
	] as const) {
		if (typeof ChannelStore[getter] !== 'function') continue;

		patcher.after(ChannelStore, getter, ({ result }) => {
			patchChannelsById(result as ChannelsById | undefined);
		});
	}

	if (typeof GuildChannelStore?.getChannels === 'function') {
		patcher.after(GuildChannelStore, 'getChannels', ({ result }) => {
			patchChannelGroups(result as Record<string, unknown> | undefined);
		});
	}

	// An update replaces the channel's record with a new object, which no getter may have returned yet.
	for (const type of ['CHANNEL_CREATE', 'CHANNEL_UPDATES']) {
		flux.onAction(type, (action) => {
			const { channel, channels } = action as {
				channel?: { id?: string };
				channels?: { id?: string }[];
			};

			for (const each of channels ?? (channel ? [channel] : [])) {
				if (each?.id) ChannelStore.getChannel(each.id);
			}
		});
	}

	flux.onAction('CHANNEL_SETTINGS_INIT', (action) => {
		edit((action as { channelId?: string }).channelId ?? null);
	});
	flux.onAction('CHANNEL_SETTINGS_CLOSE', () => edit(null));

	storage.onChange(({ store }) => store === addon.id, refresh);
	refresh();
}

/**
 * @description Gives every patched channel record back its plain `name`.
 */
export function restoreChannelNames(): void {
	for (const [channel, readOriginal] of originals) {
		Object.defineProperty(channel, 'name', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: readOriginal(),
		});
	}

	originals.clear();
	editing = null;
	getChannelStore().emitChange();
}
