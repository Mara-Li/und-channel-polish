import { ui } from '@unbound-app/api';
import { messages } from '@unbound-app/i18n';

import type { ChannelTransforms } from '~/lib/transform';

type TransformPageProps = {
	value: ChannelTransforms;
	onChange: (changes: Partial<ChannelTransforms>) => void;
};

/**
 * @description The settings of one kind of channel, global or of a server.
 * @param props The transforms and the change handler.
 * @returns The page.
 */
export function TransformPage({ value, onChange }: TransformPageProps) {
	return (
		<ui.Page>
			<ui.Section>
				<ui.SwitchRow
					label={messages.NO_FANCY}
					subLabel={messages.NO_FANCY_SUBTITLE}
					value={value.noFancy}
					onValueChange={(noFancy: boolean) => onChange({ noFancy })}
				/>
				<ui.SwitchRow
					label={messages.REPLACE_HYPHEN}
					value={value.replaceHyphen}
					onValueChange={(replaceHyphen: boolean) => onChange({ replaceHyphen })}
				/>
			</ui.Section>
			<ui.RadioRow
				title={messages.CASING}
				value={value.casing}
				options={[
					{ value: 'none', label: messages.CASING_NONE },
					{
						value: 'title',
						label: messages.CASING_TITLE,
						subLabel: messages.CASING_TITLE_SUBTITLE,
					},
					{
						value: 'capitalize',
						label: messages.CASING_CAPITALIZE,
						subLabel: messages.CASING_CAPITALIZE_SUBTITLE,
					},
				]}
				onChange={(casing) => onChange({ casing: casing as ChannelTransforms['casing'] })}
			/>
		</ui.Page>
	);
}
