import { defineSettings, setting, type MessageKey } from '@unbound-app/settings/schema';

// The transforms each kind of channel gets. Title case and capitalization exclude each other, hence one choice.
// The build only reads keys written inside `defineSettings(...)`, so it warns that the keys used here are unused. They
// are used: do not remove them from i18n/en-US.json.
function transforms(title: MessageKey) {
	return setting.section(
		{ title, displayAs: 'collapsible' },
		{
			noFancy: setting.boolean({
				default: true,
				title: 'NO_FANCY',
				subtitle: 'NO_FANCY_SUBTITLE',
			}),
			replaceHyphen: setting.boolean({ default: false, title: 'REPLACE_HYPHEN' }),
			casing: setting.choice({
				default: 'none',
				title: 'CASING',
				displayAs: 'radio',
				options: {
					none: 'CASING_NONE',
					title: { title: 'CASING_TITLE', subtitle: 'CASING_TITLE_SUBTITLE' },
					capitalize: {
						title: 'CASING_CAPITALIZE',
						subtitle: 'CASING_CAPITALIZE_SUBTITLE',
					},
				},
			}),
		},
	);
}

export default defineSettings({
	guildText: transforms('GUILD_TEXT'),
	guildVoice: transforms('GUILD_VOICE'),
	guildForum: transforms('GUILD_FORUM'),
	mediaChannel: transforms('MEDIA_CHANNEL'),
	guildCategory: transforms('GUILD_CATEGORY'),
	announcementThread: transforms('ANNOUNCEMENT_THREAD'),
	publicThread: transforms('PUBLIC_THREAD'),
	privateThread: transforms('PRIVATE_THREAD'),
	groupDm: transforms('GROUP_DM'),
});
