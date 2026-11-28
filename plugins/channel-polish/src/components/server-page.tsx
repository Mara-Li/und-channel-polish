import { Discord } from '@unbound-app/api/metro/components';
import { storage, ui } from '@unbound-app/api';
import { messages } from '@unbound-app/i18n';

import {
	readOverrides,
	removeServer,
	SERVER_SECTION_KEYS,
	serverTransforms,
	setServerEnabled,
	setServerTransforms,
	type ServerSectionKey,
} from '~/lib/overrides';

import { TransformPage } from './transform-page';
import { SectionRows } from './section-rows';

function ServerTransformPage({ guildId, section }: { guildId: string; section: ServerSectionKey }) {
	const override = readOverrides(storage.useBucket(addon.id))[guildId];

	if (!override) return null;

	return (
		<TransformPage
			value={serverTransforms(override, section)}
			onChange={(changes) => setServerTransforms(guildId, section, changes)}
		/>
	);
}

/**
 * @description The override of one added server: whether to transform its names, how, and its removal.
 * @param props The server's id.
 * @returns The page, empty once the server is removed.
 */
export function ServerPage({ guildId }: { guildId: string }) {
	const navigation = Discord.useNavigation();
	const override = readOverrides(storage.useBucket(addon.id))[guildId];

	if (!override) return null;

	return (
		<ui.Page>
			<ui.Section>
				<ui.SwitchRow
					label={messages.SERVER_ENABLED}
					subLabel={messages.SERVER_ENABLED_SUBTITLE}
					value={override.enabled}
					onValueChange={(enabled: boolean) => setServerEnabled(guildId, enabled)}
				/>
			</ui.Section>
			{override.enabled ? (
				<SectionRows
					title={messages.SERVER_SETTINGS}
					keys={SERVER_SECTION_KEYS}
					renderPage={(section) => (
						<ServerTransformPage guildId={guildId} section={section} />
					)}
				/>
			) : null}
			<ui.Section>
				<ui.ButtonRow
					label={messages.REMOVE_SERVER}
					variant='danger'
					confirmation={messages.REMOVE_SERVER_CONFIRM}
					onPress={() => {
						navigation.goBack();
						removeServer(guildId);
					}}
				/>
			</ui.Section>
		</ui.Page>
	);
}
