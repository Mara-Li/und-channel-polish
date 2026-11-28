---
banner: media/banner.png
# Gallery: put the screenshots in media/, then uncomment and adapt.
# media:
#   - image: media/channel-list.png
#     alt: The channel list with plain channel names
#   - image: media/settings.png
#     alt: The settings of each kind of channel
---

Channel names written in decorative Unicode are hard to read, and awkward to type. Channel Polish shows them in plain text, the way you choose.

Your channels are not renamed: only what you see changes.

## :sparkle: What it does

- `𝑳𝒊𝒌𝒆-𝑻𝒉𝒊𝒔` becomes `Like-This`.
- `💬┃𝗴𝗲𝗻𝗲𝗿𝗮𝗹-ᴄʜᴀᴛ` becomes `💬general-chat`: decorative letters turn into plain ones, separators such as `┃` and `・` go, and emoji stay.
- With hyphens replaced and each word capitalized, the same name becomes `💬General Chat`.

## :eye: Editing a channel

A channel shows its original name while its settings are open, so saving them does not rename it.

## :gear: Settings

Each kind of channel has its own settings:

- Text channels, voice channels, forums and media channels
- Categories
- Announcement, public and private threads
- Group DMs

For each of them:

- **Replace fancy Unicode**: turns decorative letters into plain ones and removes decorative symbols. On by default.
- **Replace hyphens with spaces**: off by default.
- **Letter case**: how names are capitalized.
    - **Unchanged**, the default.
    - **Title case**: only the first word, as in `Hello world`.
    - **Capitalize each word**: as in `Hello World`.

Both letter case options turn the other letters into lowercase. Extra spaces are always removed.

Kinds of channel without settings, such as announcement and stage channels, only get fancy Unicode replaced.

Changes apply without restarting Discord.

## :globe: Server overrides

A server can ignore the global settings. In the plugin's settings, choose **Add server**, pick it, then open it to:

- turn **Transform channel names** off, which shows its original names;
- or change the settings of each kind of channel for this server only. They start as a copy of the global ones, and later global changes do not affect them.

**Remove server** makes it follow the global settings again. Group DMs always use the global settings.

## :triangle-warning: Good to know

- **Replace fancy Unicode** only keeps Latin letters, including common accented ones, currency symbols, common punctuation and emoji. It removes other writing systems, such as Cyrillic, Greek or Japanese, and some accented letters, such as the Vietnamese ones. Turn it off for the kinds of channel that use them.
- A name made only of removed characters is shown unchanged.
- Do not enable this plugin together with another one that rewrites channel names.

## :heart: Credits

A port of the [No Fancy](https://github.com/Mara-Li/vc-no-fancy) Vencord plugin by Mara-Li and AutumnVN.
