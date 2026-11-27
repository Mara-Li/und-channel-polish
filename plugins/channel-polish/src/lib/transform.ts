/** The transforms applied to the names of one kind of channel. */
export type ChannelTransforms = {
	noFancy: boolean;
	replaceHyphen: boolean;
	casing: 'none' | 'title' | 'capitalize';
};

/** The transforms of the channel types that have no setting, such as announcement and stage channels. */
export const DEFAULT_TRANSFORMS: ChannelTransforms = {
	noFancy: true,
	replaceHyphen: false,
	casing: 'none',
};

/** The settings section of each Discord channel type that has one. */
export const CHANNEL_TYPE_KEYS = {
	0: 'guildText',
	2: 'guildVoice',
	3: 'groupDm',
	4: 'guildCategory',
	10: 'announcementThread',
	11: 'publicThread',
	12: 'privateThread',
	15: 'guildForum',
	16: 'mediaChannel',
} as const;

// NFKC already turns the mathematical, fullwidth and circled letters into plain ones; small capitals have no
// compatibility form, so they are mapped here.
const SMALL_CAPS: Record<string, string> = {
	ᴀ: 'a',
	ʙ: 'b',
	ᴄ: 'c',
	ᴅ: 'd',
	ᴇ: 'e',
	ғ: 'f',
	ꜰ: 'f',
	ɢ: 'g',
	ʜ: 'h',
	ɪ: 'i',
	ᴊ: 'j',
	ᴋ: 'k',
	ʟ: 'l',
	ᴍ: 'm',
	ɴ: 'n',
	ᴏ: 'o',
	ᴘ: 'p',
	ǫ: 'q',
	ʀ: 'r',
	ꜱ: 's',
	ᴛ: 't',
	ᴜ: 'u',
	ᴠ: 'v',
	ᴡ: 'w',
	ʏ: 'y',
	ᴢ: 'z',
};

// Code point ranges kept: Latin text, currency symbols, emoji and what composes them. Everything else goes.
const KEPT_RANGES: readonly (readonly [number, number])[] = [
	[0x0000, 0x024f],
	[0x00a9, 0x00a9],
	[0x00ae, 0x00ae],
	[0x2000, 0x206f],
	[0x20a0, 0x20cf],
	[0x2122, 0x2122],
	[0x2300, 0x23ff],
	[0x25a0, 0x25ff],
	[0x2600, 0x27bf],
	[0x2b00, 0x2bff],
	[0x3000, 0x303f],
	[0xfe00, 0xfe0f],
	[0x1f000, 0x1ffff],
	[0xe0000, 0xe01ff],
];

function isKept(character: string): boolean {
	const point = character.codePointAt(0) ?? 0;

	return KEPT_RANGES.some(([start, end]) => point >= start && point <= end);
}

// Decorative letters become plain ones, and characters outside the kept ranges go.
function uniformizeFancy(value: string): string {
	let result = '';

	for (const raw of value.normalize('NFKC')) {
		const character = SMALL_CAPS[raw] ?? raw;

		if (isKept(character)) result += character;
	}

	return result || value;
}

// Only the first letter of the name is uppercase.
function toTitleCase(value: string): string {
	return value.toLowerCase().replace(/\p{L}/u, (letter) => letter.toUpperCase());
}

// The first letter of the name, and each letter after a space or a hyphen, is uppercase.
function capitalize(value: string): string {
	return value
		.toLowerCase()
		.replace(
			/(^\P{L}*|[\s-])(\p{L})/gu,
			(_match, before: string, letter: string) => before + letter.toUpperCase(),
		);
}

/**
 * @description Transforms a channel name. Runs of whitespace always collapse to one space.
 * @param name The channel's name.
 * @param transforms The transforms of the channel's type.
 * @returns The new name, or the original when nothing would be left.
 */
export function transformChannelName(
	name: string,
	{ noFancy, replaceHyphen, casing }: ChannelTransforms,
): string {
	let next = noFancy ? uniformizeFancy(name) : name;

	if (replaceHyphen) next = next.replace(/-/g, ' ');

	next = next.replace(/\s+/g, ' ').trim();

	if (casing === 'title') next = toTitleCase(next);
	else if (casing === 'capitalize') next = capitalize(next);

	return next || name;
}
