## Specialized Content And Layout

| Component | Anatomy | Required behavior |
|---|---|---|
| Aspect Ratio | Ratio-preserving container | Maintains media geometry without layout shift. |
| Attachment | File item, type/status metadata, trailing actions | Uses the neutral-dark.5 surface. Render one action directly as a Ghost Button. With two or more actions, show one More button using the 20px `action/more` icon and put all actions in a menu in their declared order. With zero actions, omit the trailing control. |
| Carousel | Viewport, slides, previous/next, optional indicators | Buttons are labelled; focus is not moved automatically; auto-play is off by default. |
| Bubble | Incoming/outgoing content bubble | Sender and order are explicit; color and alignment are supporting cues only. |
| Typography | Type specimen and semantic roles | Display, title, subtitle, body, label, and caption map directly to typography tokens. |
