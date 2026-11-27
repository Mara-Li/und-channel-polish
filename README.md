# Channel Polish

Normalize channel name to remove fancy Unicode characters, remove hyphen and capitalize (or title case). Based on cleanChannelName.

A port of the [No Fancy](https://github.com/Mara-Li/vc-no-fancy) Vencord plugin by Mara-Li and AutumnVN. See [its description](plugins/channel-polish/ADDON.md) for the settings.

An [Unbound](https://unbound.rip) addon workspace scaffolded with `ubd create`.

## Development

```sh
bun install
bun run dev
```

`ubd dev` watches every addon under `plugins/` and `themes/`, rebuilding the one you change.

## Building

```sh
bun run build
```

Builds every addon once into its `dist/` directory.

## Learn more

- Plugins: https://docs.unbound.rip/plugins/introduction
- Themes: https://docs.unbound.rip/themes/introduction
- Manifest reference: https://unbound.rip/docs/developer/publishing/manifest
