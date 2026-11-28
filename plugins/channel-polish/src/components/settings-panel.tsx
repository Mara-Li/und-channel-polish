import { settings, useSetting } from '@unbound-app/settings';
import { messages } from '@unbound-app/i18n';
import { ui } from '@unbound-app/api';

import { CHANNEL_TYPE_KEYS, type SectionKey } from '~/lib/transform';

import { TransformPage } from './transform-page';
import { SectionRows } from './section-rows';
import { ServerList } from './server-list';

function GlobalTransformPage({ section }: { section: SectionKey }) {
	const value = useSetting(section);

	return (
		<TransformPage
			value={value}
			onChange={(changes) => Object.assign(settings[section], changes)}
		/>
	);
}

/**
 * @description The plugin's settings: the global ones of each kind of channel, then the server overrides.
 * @returns The panel.
 */
export function SettingsPanel() {
	return (
		<ui.Page>
			<SectionRows
				title={messages.GLOBAL_SETTINGS}
				keys={Object.values(CHANNEL_TYPE_KEYS)}
				renderPage={(section) => <GlobalTransformPage section={section} />}
			/>
			<ServerList />
		</ui.Page>
	);
}
