import { setLocale } from '@unbound-app/api/testing';
import { messages } from '@unbound-app/i18n';
import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import source from '../i18n/en-US.json';

const directory = join(import.meta.dir, '../i18n');
const translations = readdirSync(directory).filter((file) => file !== 'en-US.json');

describe('translations', () => {
	test.each(translations)('%s translates every message, and no other', async (file) => {
		const { default: table } = (await import(join(directory, file))) as {
			default: Record<string, string>;
		};

		expect(Object.keys(table).sort()).toEqual(Object.keys(source).sort());
		expect(Object.values(table).filter((message) => !message.trim())).toEqual([]);
	});

	test('reads French when Discord is in French', () => {
		setLocale('fr');

		expect(messages.GUILD_TEXT).toBe('Salons textuels');
	});

	test('falls back to English for a language without a translation', () => {
		setLocale('de');

		expect(messages.GUILD_TEXT).toBe('Text channels');
	});
});
