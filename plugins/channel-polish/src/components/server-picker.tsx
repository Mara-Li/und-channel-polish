import { BottomSheets, Discord, GorhomSheet } from '@unbound-app/api/metro/components';
import { messages } from '@unbound-app/i18n';
import { metro } from '@unbound-app/api';
import { useState } from 'react';

import { searchGuilds } from '~/lib/guilds';

import { GuildIcon } from './guild-icon';

const SHEET_KEY = 'channel-polish-server-picker';

type ServerPickerProps = {
	/** Ids already added, left out of the list. */
	exclude: string[];
	onPick: (id: string) => void;
	onClose: () => void;
};

/**
 * @description A sheet listing the user's servers, with a search; picking one closes it.
 * @param props The ids to leave out, and what to do with the pick.
 * @returns The sheet.
 */
export function ServerPicker({ exclude, onPick, onClose }: ServerPickerProps) {
	const [query, setQuery] = useState('');
	const guilds = searchGuilds(query, exclude);

	return (
		<BottomSheets.ActionSheet scrollable>
			<BottomSheets.BottomSheetTitleHeader title={messages.ADD_SERVER} />
			{/* A `scrollable` sheet scrolls only a bottom-sheet scroll view. */}
			<GorhomSheet.BottomSheetScrollView
				contentContainerStyle={{ gap: 16, paddingVertical: 16 }}
				keyboardShouldPersistTaps='handled'
			>
				<Discord.SearchBar
					size='md'
					value={query}
					onChange={setQuery}
					placeholder={messages.SEARCH_SERVERS}
				/>
				{guilds.length ? (
					<Discord.TableRowGroup hasIcons>
						{guilds.map((guild) => (
							<Discord.TableRow
								key={guild.id}
								label={guild.name}
								icon={<GuildIcon guild={guild} />}
								onPress={() => {
									onPick(guild.id);
									onClose();
								}}
							/>
						))}
					</Discord.TableRowGroup>
				) : (
					<Discord.Text variant='body-sm/medium' color='text-muted'>
						{messages.NO_SERVERS}
					</Discord.Text>
				)}
			</GorhomSheet.BottomSheetScrollView>
		</BottomSheets.ActionSheet>
	);
}

/**
 * @description Opens the {@link ServerPicker} as a Discord action sheet.
 * @param props The ids to leave out, and what to do with the pick.
 */
export function openServerPicker(props: Omit<ServerPickerProps, 'onClose'>): void {
	const { ActionSheets } = metro.api;

	ActionSheets.openLazy(Promise.resolve({ default: ServerPicker }), SHEET_KEY, {
		...props,
		onClose: () => ActionSheets.hideActionSheet(SHEET_KEY),
	});
}
