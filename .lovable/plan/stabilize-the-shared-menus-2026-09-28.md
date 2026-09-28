# Stabilize the shared menus

## Goal
Keep each shared menu consistent across all pages and prevent long navigation lists from pushing items off-screen.

## Changes
- Keep the public website header in the existing shared site layout used by every public page.
- Keep the signed-in sidebar and top bar in the existing shared app shell used by every signed-in page.
- Give the desktop sidebar navigation its own vertical scrolling area while keeping the logo, account details, and sign-out control fixed and reachable.
- Limit the mobile menus to the available screen height and allow their navigation items to scroll without moving the page unexpectedly.
- Preserve existing links, styling, authentication behavior, and page content.

## Validation
- Check a public page and signed-in app layout at desktop and mobile widths.
- Confirm all menu links remain reachable and page content no longer competes with menu scrolling.
