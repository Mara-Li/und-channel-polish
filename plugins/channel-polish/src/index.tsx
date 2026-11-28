import { patcher } from '@unbound-app/api';

import { patchChannelNames, restoreChannelNames } from '~/patches';

export { SettingsPanel } from '~/components/settings-panel';

export function start() {
	patchChannelNames();
}

export function stop() {
	// Unpatch first, so the redraw `restoreChannelNames` asks for does not patch the records again.
	patcher.unpatchAll();
	restoreChannelNames();
}
