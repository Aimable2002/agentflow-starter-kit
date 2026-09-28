<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public navigation stays in `SiteLayout`, while authenticated navigation stays in `AppShell`, so every page inherits one consistent, scroll-safe menu.

- DirectionalTrendEA binaries live in `directional-ea/<version>/` with `directional-ea/releases.json` as the manifest; they are embedded server-side and served only to signed-in users for `published` entries, so drafts/withdrawn versions can't be downloaded.
