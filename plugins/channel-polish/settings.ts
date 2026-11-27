import { defineSettings, setting } from '@unbound-app/settings/schema';

// One section per channel type, all with the same settings. Title case and capitalization exclude each other, hence one
// choice. Keep every section written out here: the build only reads the message keys inside `defineSettings(...)`, so a
// shared helper would make it report them as unused and stop checking that they exist.
export default defineSettings({
	guildText: setting.section(
		{ title: 'GUILD_TEXT', displayAs: 'collapsible' },
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
	),
	guildVoice: setting.section(
		{ title: 'GUILD_VOICE', displayAs: 'collapsible' },
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
	),
	guildForum: setting.section(
		{ title: 'GUILD_FORUM', displayAs: 'collapsible' },
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
	),
	mediaChannel: setting.section(
		{ title: 'MEDIA_CHANNEL', displayAs: 'collapsible' },
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
	),
	guildCategory: setting.section(
		{ title: 'GUILD_CATEGORY', displayAs: 'collapsible' },
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
	),
	announcementThread: setting.section(
		{ title: 'ANNOUNCEMENT_THREAD', displayAs: 'collapsible' },
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
	),
	publicThread: setting.section(
		{ title: 'PUBLIC_THREAD', displayAs: 'collapsible' },
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
	),
	privateThread: setting.section(
		{ title: 'PRIVATE_THREAD', displayAs: 'collapsible' },
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
	),
	groupDm: setting.section(
		{ title: 'GROUP_DM', displayAs: 'collapsible' },
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
	),
});
