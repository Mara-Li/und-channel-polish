import { Discord } from '@unbound-app/api/metro/components';
import { assets, storage } from '@unbound-app/api';
import { messages } from '@unbound-app/i18n';

import { addServer, readOverrides } from '~/lib/overrides';
import { getGuild } from '~/lib/guilds';

import { openServerPicker } from './server-picker';
import { ServerPage } from './server-page';
import { GuildIcon } from './guild-icon';
import { openPage } from './open-page';

/**
 * @description The added servers, each opening its override, and a row to add one.
 * @returns The group.
 */
export function ServerList() {
	const navigation = Discord.useNavigation();
	const overrides = readOverrides(storage.useBucket(addon.id));

	return (
		<Discord.TableRowGroup
			title={messages.SERVERS}
			description={messages.SERVERS_SUBTITLE}
			hasIcons
		>
			{Object.entries(overrides).map(([guildId, { enabled }]) => {
				const guild = getGuild(guildId);
				// A server the user left keeps its row, so it can be removed.
				const name = guild?.name ?? guildId;

				return (
					<Discord.TableRow
						key={guildId}
						label={name}
						subLabel={enabled ? messages.SERVER_CUSTOM : messages.SERVER_DISABLED}
						icon={<GuildIcon guild={guild} />}
						arrow
						onPress={() =>
							openPage(navigation, name, () => <ServerPage guildId={guildId} />)
						}
					/>
				);
			})}
			<Discord.TableRow
				label={messages.ADD_SERVER}
				icon={<Discord.TableRow.Icon source={assets.getIdByName('PlusSmallIcon')} />}
				onPress={() =>
					openServerPicker({ exclude: Object.keys(overrides), onPick: addServer })
				}
			/>
		</Discord.TableRowGroup>
	);
}
