## 5. Common Shortcuts

### Date Picker

- **PROJECT:** The date field is a button with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`; client surfaces do not expose the browser-native date popup.
- **PROJECT:** Opening the field moves focus to the selected date, otherwise today, otherwise the first visible date.
- **PROJECT:** Left/Right moves one day and Up/Down moves one week. Crossing a month boundary updates the visible month.
- **PROJECT:** Escape closes without changing the selected value and returns focus to the field trigger. Picking a date, Today, or Clear commits the value, closes the popover, and returns focus.
- **PROJECT:** The popover renders a complete 6×7 grid so geometry is stable between months. Adjacent-month dates are muted; selected and today states are visually distinct.

