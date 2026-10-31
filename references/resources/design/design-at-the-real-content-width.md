## Design at the real content width

Use the Pattern's existing inset; never add the pane padding again. Estimate
the representative row/card at the actual content width, with realistic long
content. For a narrow mailbox list, stack sender/time, subject, summary, then
optional status metadata. Do not allocate a separate grid column to every
field. Use truncation for scanning text, wrapping for reading text, and allow
content groups to shrink (`min-width: 0`) inside their declared scope.

In a detail view, identify the selected object first, then its primary content,
then related objects such as attachments and calendar events. A meeting card
must not displace the email subject merely because it is a library component.
For settings, group fields by user intent and place help next to the affected
field. For tools, make status and the next useful action discoverable without
making every field equally prominent.

