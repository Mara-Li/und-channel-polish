import { storage } from '@unbound-app/api';
import { settings } from '@unbound-app/settings';

import {
	CHANNEL_TYPE_KEYS,
	DEFAULT_TRANSFORMS,
	type ChannelTransforms,
	type SectionKey,
} from '~/lib/transform';

/** The sections a server can override: group DMs belong to no server. */
export type ServerSectionKey = Exclude<SectionKey, 'groupDm'>;

export const SERVER_SECTION_KEYS: readonly ServerSectionKey[] = [
	'guildText',
	'guildVoice',
	'guildForum',
	'mediaChannel',
	'guildCategory',
	'announcementThread',
	'publicThread',
	'privateThread',
];

/** What a server the user added does instead of the global settings. */
export type ServerOverride = {
	/** `false` shows the server's channel names unchanged. */
	enabled: boolean;
	/** The server's own transforms, used while `enabled`; a missing section follows the global one. */
	transforms: Partial<Record<ServerSectionKey, ChannelTransforms>>;
};

/** The added servers, by id. */
export type ServerOverrides = Record<string, ServerOverride>;

// Saved in the plugin's Bucket beside the settings, whose schema cannot describe a map.
const KEY = 'servers';

/**
 * @description Reads the added servers.
 * @param bucket The plugin's Bucket; a component passes the one `storage.useBucket` returned, to re-render with it.
 * @returns The servers' overrides, by server id.
 */
export function readOverrides(bucket = storage.getBucket(addon.id)): ServerOverrides {
	return bucket.get(KEY, {}) as ServerOverrides;
}

function write(overrides: ServerOverrides): void {
	storage.getBucket(addon.id).set(KEY, overrides);
}

function update(guildId: string, change: (override: ServerOverride) => ServerOverride): void {
	const overrides = readOverrides();
	const override = overrides[guildId];

	if (override) write({ ...overrides, [guildId]: change(override) });
}

function globalTransforms(key: SectionKey): ChannelTransforms {
	const { noFancy, replaceHyphen, casing } = settings[key];

	return { noFancy, replaceHyphen, casing };
}

/**
 * @description Adds a server, with a copy of the global settings as its own, so nothing changes until they are edited.
 * A server already added keeps its override.
 * @param guildId The server's id.
 */
export function addServer(guildId: string): void {
	const overrides = readOverrides();

	if (overrides[guildId]) return;

	const transforms = Object.fromEntries(
		SERVER_SECTION_KEYS.map((key) => [key, globalTransforms(key)]),
	);

	write({ ...overrides, [guildId]: { enabled: true, transforms } });
}

/**
 * @description Removes a server, which follows the global settings again.
 * @param guildId The server's id.
 */
export function removeServer(guildId: string): void {
	const { [guildId]: _removed, ...rest } = readOverrides();

	write(rest);
}

/**
 * @description Turns the transforms of an added server on or off. Its own transforms are kept either way.
 * @param guildId The server's id.
 * @param enabled Whether to transform the server's channel names.
 */
export function setServerEnabled(guildId: string, enabled: boolean): void {
	update(guildId, (override) => ({ ...override, enabled }));
}

/**
 * @description Reads the transforms an added server applies to one kind of channel.
 * @param override The server's override.
 * @param key The kind of channel.
 * @returns The server's own transforms, or the global ones when it has none for this kind.
 */
export function serverTransforms(
	override: ServerOverride,
	key: ServerSectionKey,
): ChannelTransforms {
	return override.transforms[key] ?? globalTransforms(key);
}

/**
 * @description Changes the transforms of one kind of channel in an added server.
 * @param guildId The server's id.
 * @param key The kind of channel.
 * @param changes The transforms to change.
 */
export function setServerTransforms(
	guildId: string,
	key: ServerSectionKey,
	changes: Partial<ChannelTransforms>,
): void {
	update(guildId, (override) => ({
		...override,
		transforms: {
			...override.transforms,
			[key]: { ...serverTransforms(override, key), ...changes },
		},
	}));
}

/**
 * @description Picks the transforms of a channel: its server's override when it has one, else the global settings.
 * @param type The channel's Discord type.
 * @param guildId The channel's server; none for a DM.
 * @returns The transforms, or `undefined` when the server shows its names unchanged.
 */
export function resolveTransforms(
	type: number | undefined,
	guildId: string | null | undefined,
): ChannelTransforms | undefined {
	const override = guildId ? readOverrides()[guildId] : undefined;

	if (override && !override.enabled) return undefined;

	const key = CHANNEL_TYPE_KEYS[type as keyof typeof CHANNEL_TYPE_KEYS];

	if (!key) return DEFAULT_TRANSFORMS;

	return override && key !== 'groupDm' ? serverTransforms(override, key) : settings[key];
}
