# Email Workbench domain blueprint

Use this reference when a request describes an email, message, inbox, mail
workbench, or communication list-detail application. It constrains business
relationships while leaving copy, density, and visual composition to the page
blueprint.

The primary task is to find a message, understand its context, and complete an
action such as reply, forward, archive, or attachment review. The canonical
Pattern B regions are:

- Primary Navigation: account and product identity, compose action, folders,
  and the bottom first-level mail/calendar/contacts/settings rail.
- Secondary List: search, filter state, unread and priority summaries, and a
  repeated message list. The selected row must identify the detail object.
- Main Detail: message subject, sender metadata, body, attachments, related
  calendar information, and context actions.

The page blueprint must define one shared message entity and use its selected
ID for both the list and detail. Search and filters change the visible list;
empty results provide a recovery action; selecting a message changes detail;
compose and attachment actions have visible outcomes. Loading, empty, failure,
selected, unread, and attachment states are explicit when the request needs
them. A static collection of unrelated cards does not satisfy this reference.

Mail composition (new, reply, reply-all after any brief confirmation, forward,
and reopening a draft) opens as a pop-up Secondary Page using Runtime
`layout: "new-page"`, with the standalone registered Titlebar S and the compose
form in its content slot. Here “pop-up” describes the button-triggered page
opening, not a Dialog. Declare 写邮件 and the other compose entry points as
`open-secondary-page` with `secondaryPage.layout: "new-page"`; keep the parent
mail shell mounted beneath the page host, then restore its selection and focus
on return and preserve unsent draft fields. A short confirmation such as
“回复全部给外部联系人？” may remain a Dialog; the editor itself must use the
Secondary Page Runtime, not a Dialog/Semi-modal contract or `open-overlay`.
When the user requests modal sizing for this page, use the largest Semi-modal
size envelope: `--width-modal-lg` (L, 800px), constrained to the viewport with
scrolling content, modal surface radius, and `--shadow-5`. This borrows the
visual envelope only; do not add Dialog/Semi-modal behavior semantics or
replace the `new-page` Runtime frame. The standalone Titlebar S title uses its
registered `Subtitle_M` role (`--type-subtitle-m-*`: 16px / 20px / 500); do not
apply the larger Dialog/Semi-modal `Title_S` role. Modal-sized presentation
does not change the Titlebar component's typography. Do not add a page-owned
font override.

## Required content recipe: EmailMessageRow

Resolve the repeated message list by capability. When no registered component
supports the required mail fields, use a `page-composite`. It may reuse available controls and status components,
but its capability is a mail-specific scan row. Its recipe records at least:

- shared `message` entity and selection key;
- sender, subject, summary, time, unread, flag, attachment count, and delivery
  or security status fields;
- default, unread, selected, flagged, and attachment states;
- a registry query and rejection reason for generic List Item when it lacks the
  required mail fields;
- a `page-owned` disposition unless the user requests library promotion.

Rows must be generated from distinct local message data. Selecting a row changes
the shared selected message and therefore the detail pane. Date grouping is a
collection property, not a sequence of unrelated text paragraphs.
