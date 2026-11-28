import type { ReactNode } from 'react';

import { Discord } from '@unbound-app/api/metro/components';
import { messages, type MessageKey } from '@unbound-app/i18n';
import { ui } from '@unbound-app/api';

import type { SectionKey } from '~/lib/transform';

import { openPage } from './open-page';

const TITLES = {
	guildText: 'GUILD_TEXT',
	guildVoice: 'GUILD_VOICE',
	guildForum: 'GUILD_FORUM',
	mediaChannel: 'MEDIA_CHANNEL',
	guildCategory: 'GUILD_CATEGORY',
	announcementThread: 'ANNOUNCEMENT_THREAD',
	publicThread: 'PUBLIC_THREAD',
	privateThread: 'PRIVATE_THREAD',
	groupDm: 'GROUP_DM',
} as const satisfies Record<SectionKey, MessageKey>;

type SectionRowsProps<K extends SectionKey> = {
	title: string;
	keys: readonly K[];
	/** Draws the page of one kind of channel; it reads its settings with hooks there. */
	renderPage: (key: K) => ReactNode;
};

/**
 * @description A group with one row per kind of channel, each opening its settings.
 * @param props The group's title, the kinds of channel and what their page draws.
 * @returns The group.
 */
export function SectionRows<K extends SectionKey>({
	title,
	keys,
	renderPage,
}: SectionRowsProps<K>) {
	const navigation = Discord.useNavigation();

	return (
		<ui.Section title={title}>
			{keys.map((key) => (
				<ui.Row
					key={key}
					label={messages[TITLES[key]]}
					arrow
					onPress={() =>
						openPage(navigation, messages[TITLES[key]], () => renderPage(key))
					}
				/>
			))}
		</ui.Section>
	);
}
