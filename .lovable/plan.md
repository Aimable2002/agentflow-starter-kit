# Reorganize the EA experience

## What will change

- Keep the public EA page as a concise service presentation only, with its purpose and a sign-up/sign-in call to action.
- Add DirectionalTrendEA to the landing page alongside the other services, without setup instructions, authorization controls, or downloads.
- Move the full EA explanations, risk warning, setup instructions, and FAQ into a signed-in **EA documentation** page.
- Keep **Authorize account** as its own signed-in page.
- Create a signed-in **EA releases** page as the official place where published algorithm versions are listed and downloaded.
- Add **EA documentation**, **Authorize account**, and **EA releases** as clear items in the signed-in menu; retain dashboard and billing access.

## Navigation

```text
Public site
├── Home: EA shown as one service among others
└── EA: short service overview only

Signed-in menu
├── EA documentation
├── Authorize account
├── EA releases
├── EA dashboard
└── EA billing
```

## Technical details

- Add protected routes under `/app/ea/` for documentation and releases so the existing sign-in gate applies automatically.
- Remove session checks and release-download logic from the public EA route.
- Preserve the existing EA wording and risk disclosure when moving it into the signed-in documentation page.
- Structure each published release with a unique version, publication date, release notes, file path, file name, file size, checksum, status, and optional minimum MT5 build.
- Show the latest stable version prominently, followed by searchable release history. Only published releases appear to customers; draft and withdrawn versions remain unavailable.
- Downloads come from the dedicated EA file bucket. Publishing the algorithm itself remains an owner/admin workflow rather than a customer-facing upload control.
- Update the release data rules so signed-in customers can read published versions while only trusted server/admin operations can create, edit, publish, or withdraw them.
- Give each new page its own metadata and verify desktop and mobile navigation after the changes.
