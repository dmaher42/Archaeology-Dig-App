# Asset Sources

This folder stores generation inputs, rejected candidates, working sheets, and other retained art sources that are not loaded by the game at runtime.

Keep playable assets and JSON-linked atlas outputs under `public/assets/`. Keep source frames here so Vite does not copy them into the GitHub Pages deployment.

Before moving any additional folder here, verify it is not referenced by runtime code, Stage Select, the trailer, tests, or an asset manifest. Update existing build scripts to read source inputs from this folder while continuing to write runtime outputs to their established `public/assets/` paths.
