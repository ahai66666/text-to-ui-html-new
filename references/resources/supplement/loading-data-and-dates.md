## Loading, Data, And Dates

| Component | Anatomy | Required behavior |
|---|---|---|
| Skeleton | Shape placeholders | Mirrors final geometry; hidden from accessibility; reduced motion disables shimmer. |
| Spinner | Animated indicator | Has accessible loading text when standalone; reduced motion preserves status without rotation. |
| Chart | Plot, axes/labels, legend, data summary | Uses chart tokens, direct labels or legend, and a text alternative; color is never the only differentiator. |
| Calendar | Header, grid, day buttons | Arrow keys move dates, PageUp/Down changes month, selected/today states are distinct. |
| Date Picker | Field trigger with 16px `field/date` Calendar icon, custom calendar popover, month controls, 6×7 day grid, Ghost Clear/Today actions | Client UI uses the tokenized custom popover rather than the browser-native picker. The field icon stays static when the popover opens. Arrow keys move by day/week; Escape closes and returns focus; picked dates commit to the field; selected, today, adjacent-month, Hover, Pressed, and Focus states remain distinct. |
| Time Picker | Field trigger with 16px `field/time` Clock icon, custom white time popover, transparent hour/minute listboxes, Ghost Clear/Now actions, Primary Confirm action | Client UI uses a 24-hour tokenized popover. The list columns have no neutral fill. Selected hour/minute options use Ghost styling: brand text on a transparent resting background; Hover, Pressed, and Focus add only their respective state feedback. The Clock icon stays static when open. Up/Down and Home/End move and select options; Confirm commits, Escape discards the draft, and every close path returns focus to the trigger. Default minute step is 5 minutes. |

