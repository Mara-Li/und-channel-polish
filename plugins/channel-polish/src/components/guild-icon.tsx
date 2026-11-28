import type { FluxGuild } from '@unbound-app/api/flux';

import { Discord } from '@unbound-app/api/metro/components';
import { assets } from '@unbound-app/api';
import { Image } from 'react-native';

import { guildIconUrl } from '~/lib/guilds';

/**
 * @description A server's icon at the size of a row's icon, or Discord's server glyph when it has none.
 * @param props The server, if known.
 * @returns The icon.
 */
export function GuildIcon({ guild }: { guild: FluxGuild | undefined }) {
	const uri = guild && guildIconUrl(guild);

	if (!uri) return <Discord.TableRow.Icon source={assets.getIdByName('ServerIcon')} />;

	return <Image source={{ uri }} style={{ width: 24, height: 24, borderRadius: 8 }} />;
}
