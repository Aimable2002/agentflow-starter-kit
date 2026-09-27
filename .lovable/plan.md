# Reorganize the EA experience

## What will change

- Keep the public EA page as a concise service presentation only, with its purpose and a sign-up/sign-in call to action.
- Add DirectionalTrendEA to the landing page alongside the other services, without setup instructions, authorization controls, or downloads.
- Move the full EA explanations, risk warning, setup instructions, and FAQ into a signed-in **EA documentation** page.
- Keep **Authorize account** as its own signed-in page.
- Create a separate signed-in **Download EA** page containing release details and the download action.
- Add **EA documentation**, **Authorize account**, and **Download EA** as clear items in the signed-in menu; retain dashboard and billing access.

## Navigation

```text
Public site
├── Home: EA shown as one service among others
└── EA: short service overview only

Signed-in menu
├── EA documentation
├── Authorize account
├── Download EA
├── EA dashboard
└── EA billing
```

## Technical details

- Add protected routes under `/app/ea/` for documentation and download so the existing sign-in gate applies automatically.
- Remove session checks and release-download logic from the public EA route.
- Preserve the existing EA wording and risk disclosure when moving it into the signed-in documentation page.
- Give each new page its own metadata and verify desktop and mobile navigation after the changes.
