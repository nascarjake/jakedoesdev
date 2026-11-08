# Preserve published routes

The October desktop-page restoration existed only on a separate branch. November deployments started from an older branch, so the resulting complete asset upload omitted both routes and three images. The source was not deleted from history; the deployed build never contained it.

This release integrates those exact restoration commits with the current homepage, portfolio, navigation and timeline changes. `verify-public-surface.mjs` blocks both builds and the deploy script if required pages or media are missing. Static-export validation checks the resulting files too. Keep this manifest when adding or intentionally retiring public routes.

Start future publication work from the latest deployed release commit, not a stale canonical checkout. The canonical checkout can contain unrelated dirty work. Before deployment compare the intended build's route and media inventory against the current public catalogue; HTTP-check all published landing pages and their actual image bytes after deployment. Do not assume one homepage check proves all project pages survived.
