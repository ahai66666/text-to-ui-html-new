## Title typography

The standalone `Titlebar_S` title uses `Subtitle_M` (`16px / 20px / 500`).
Pane-aligned title slots on Titlebar M/L/XL use `Title_S` (`20px / 24px / 700`);
the brand/app `label` uses `Subtitle_M` at every size. The component selects the
role from its registered size and emits the matching typography marker. Do not
copy a Dialog or Semi-modal title role onto Titlebar S, and do not add a
page-owned font override.

