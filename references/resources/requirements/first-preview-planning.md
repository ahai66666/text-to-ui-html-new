## 5. First preview planning

Use this optional brief when explaining a material design choice:

```markdown
## Proposed Solution
- Design goal:
- Page structure (tree):
  ```text
  ├── 登录
  ├── 注册
  └── 找回密码
  ```
- Key interactions and states:
- Technology/output:
- Assumptions:
- Open questions:
- Assumptions requiring a user decision, if any:
```

Rules:

- Ask at most three high-impact questions in the same message; infer low-risk details.
- Continue automatically when the request provides enough information.
- Only a specific unresolved user decision pauses dependent work.

Read the selected Pattern and relevant component interfaces before composing
the page. Save planning decisions alongside the project, then generate it.

The proposal must also expose the task model: primary user, work object, start
state, success state, failure/recovery path, and state that must be preserved.
This is the part that prevents the Skill from jumping directly from a one-line
request to a generic page.

