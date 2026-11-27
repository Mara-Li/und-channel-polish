import { describe, expect, test } from 'bun:test';

import { DEFAULT_TRANSFORMS, transformChannelName } from '../src/lib/transform';

const keepFancy = { ...DEFAULT_TRANSFORMS, noFancy: false };

describe('transformChannelName', () => {
	test.each([
		['𝑳𝒊𝒌𝒆-𝑻𝒉𝒊𝒔', 'Like-This'],
		['𝕘𝕖𝕟𝕖𝕣𝕒𝕝', 'general'],
		['ⓖⓔⓝⓔⓡⓐⓛ', 'general'],
		['ɢᴇɴᴇʀᴀʟ', 'general'],
		['💬・general', '💬general'],
		['┃general', 'general'],
		['été-€', 'été-€'],
		['👩‍💻 dev', '👩‍💻 dev'],
	])('replaces the fancy Unicode of %s', (name, expected) => {
		expect(transformChannelName(name, DEFAULT_TRANSFORMS)).toBe(expected);
	});

	test('keeps the original when nothing would be left', () => {
		expect(transformChannelName('┃┃', DEFAULT_TRANSFORMS)).toBe('┃┃');
	});

	test('keeps fancy Unicode when asked', () => {
		expect(transformChannelName('┃𝗮', keepFancy)).toBe('┃𝗮');
	});

	test('collapses and trims whitespace', () => {
		expect(transformChannelName('  a 　  b ', keepFancy)).toBe('a b');
	});

	test('replaces hyphens with spaces', () => {
		expect(transformChannelName('-a--b-', { ...keepFancy, replaceHyphen: true })).toBe('a b');
	});

	test('uppercases only the first letter in title case', () => {
		expect(transformChannelName('💬 hELLO World', { ...keepFancy, casing: 'title' })).toBe(
			'💬 Hello world',
		);
	});

	test('uppercases each word, after spaces and hyphens', () => {
		expect(
			transformChannelName('💬hELLO wORLD-éTÉ 2b', { ...keepFancy, casing: 'capitalize' }),
		).toBe('💬Hello World-Été 2b');
	});
});
