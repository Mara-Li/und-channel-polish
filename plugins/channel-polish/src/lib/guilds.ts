import type { FluxGuild } from '@unbound-app/api/flux';

import { flux } from '@unbound-app/api';

/**
 * @description Reads a server the user is in.
 * @param id The server's id.
 * @returns The server, or `undefined` when the user is not in it.
 */
export function getGuild(id: string): FluxGuild | undefined {
	return flux.getStore('Guild').getGuild(id);
}

/**
 * @description Searches the user's servers by name or id.
 * @param query The search text; empty matches every server.
 * @param exclude Ids to leave out.
 * @returns The matches, sorted by name.
 */
export function searchGuilds(query: string, exclude: readonly string[]): FluxGuild[] {
	const needle = query.trim().toLowerCase();

	return Object.values(flux.getStore('Guild').getGuilds())
		.filter(
			({ id, name }) =>
				!exclude.includes(id) && (id === needle || name.toLowerCase().includes(needle)),
		)
		.sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * @description Builds the address of a server's icon.
 * @param guild The server.
 * @returns The address, or `undefined` when the server has no icon.
 */
export function guildIconUrl({ id, icon }: FluxGuild): string | undefined {
	return icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.png?size=64` : undefined;
}
