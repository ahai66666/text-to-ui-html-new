## Trailing inset

The rendered Titlebar keeps a 12px trailing inset. This applies to the S / 40px
standalone preview as well as the generic generated adapter, which use the
existing `--padding-titlebar-trailing-l` token. Do not replace it with a raw
`12px` value or the legacy `--padding-titlebar-trailing-s` token; the component
style is the shared source for HTML.

