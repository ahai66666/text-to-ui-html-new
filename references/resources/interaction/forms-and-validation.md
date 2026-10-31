## 9. Forms And Validation

- **PROJECT:** Use the approved client text hierarchy: Body_L (16px / 20px / Regular 400) for visible primary content and standard 40px controls; Body_M (14px / 16px / Regular 400) for secondary copy and Checkbox, Radio, or Switch labels; Body_S (12px / 14px / Regular 400) for references, helpers, status labels, and supporting prompts; Caption_M (10px / 12px / Regular 400) only for extremely small auxiliary notes. Tabs and 28px Small Buttons also use Body_M. `Caption_L` is deprecated.

- **PROJECT:** Table headers use muted Body_M (14px / 16px / Regular 400). Table data cells use Body_L (16px / 20px / Regular 400) with Regular 400 weight; neither is bold by default. Status and helper text use Body_S.

- **PROJECT:** Card titles use Title_S (20px / 28px / Bold 700). Card body content keeps its component-specific Body or Caption role.

- **PROJECT:** A standard Form Field stacks title above the content control. The title uses Body_M (14px / 20px / Regular 400) and the primary text color; title-to-control spacing is the 8px `--gap-field-label` token. Adjacent fields, including row and column gaps in a multi-column form, use the 16px `--gap-form-field` token.
- **PROJECT:** Text entered or displayed inside Input, Search, Textarea, field Select/Combobox, Date Picker, Time Picker, and Input OTP always uses Body_L (16px / 22px / Regular 400). Popup menu options and helper text retain their own component typography.
- **PROJECT:** Allow users to type without disruptive validation on every keystroke unless immediate validation is necessary.
- **PROJECT:** Run complete validation on blur or submit according to field semantics.
- **PROJECT:** Place field errors near the affected control and explain how to resolve them.
- **PROJECT:** On failed submit, move focus to the first invalid field when practical.
- **PROJECT:** Prevent duplicate submission while a request is in progress.
- **PROJECT:** Disabled controls are visually disabled and cannot be activated.
- **PROJECT:** Success produces clear visual feedback and the expected next state.
- **DEMO:** Demonstrate at least one valid and one invalid path for forms central to the primary workflow.

