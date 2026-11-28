import type { Discord } from '@unbound-app/api/metro/components';
import type { ReactNode } from 'react';

type Navigation = ReturnType<typeof Discord.useNavigation>;

// Unbound's settings route, which draws what `render` returns under `title`.
const PAGE_ROUTE = 'UNBOUND_CUSTOM';

/**
 * @description Pushes a settings sub-page; the back button returns.
 * @param navigation The current screen's navigation.
 * @param title The page's header title.
 * @param render Draws the page inside the new screen.
 */
export function openPage(navigation: Navigation, title: string, render: () => ReactNode): void {
	navigation.push(PAGE_ROUTE, { title, render });
}
