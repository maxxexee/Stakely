# Contributing to Stakely

Stakely is a two-sided sports prediction market running on Solana devnet. Keep changes focused, keep the demo honest about devnet, and keep documentation free of em dashes and emojis.

## Ground rules

- Do not commit API keys, private keys, wallet keypairs, or `.env` files.
- Keep documentation and user-facing copy free of emojis and em dashes.
- Keep commit authorship with the repository owner. Do not add co-author or generated-by trailers.
- Report security problems privately using [SECURITY.md](SECURITY.md), not a public issue.
- Open an issue before a large change so the approach can be discussed.

## Setup

Requirements: Node.js 20 or newer, pnpm, and optionally the Solana CLI and Anchor for the escrow program.

```bash
git clone https://github.com/maxxexee/Stakely.git
cd Stakely

cd api
cp .env.example .env
pnpm install

cd ../web
cp .env.example .env
pnpm install
```

Fill in the values documented in [.env.example](.env.example). The service role key belongs on the server only and must never reach the browser bundle.

## Checks

Run the repository checks before opening a pull request:

```bash
node scripts/check-repo.mjs
```

The script covers required files, the no em dash and no emoji rules, internal links, image dimensions, and that `.env` and `node_modules` are not tracked. CI runs the same script on every push and pull request.

## Brand assets

`docs/assets/banner.png` (2560 by 800) and `docs/assets/social-preview.png` (1280 by 640) are rendered from the artboards in `docs/brand.html`. Do not edit the PNGs by hand. Re-render them with headless Chrome:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=2560,800 --virtual-time-budget=6000 \
  --screenshot=docs/assets/banner.png \
  "file://$PWD/docs/brand.html?board=banner"

"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1280,640 --virtual-time-budget=6000 \
  --screenshot=docs/assets/social-preview.png \
  "file://$PWD/docs/brand.html?board=social"
```

## Pull requests

- Keep the change focused and describe the problem it solves.
- Update the README, docs, or screenshots when behavior changes.
- Include the commands you ran and the output that shows the change works.
- Do not include `.env`, `node_modules`, or build output in the change.

## Commit messages

Use a short imperative subject, for example:

```text
Add the challenge settlement receipt link
Fix the leaderboard streak calculation
```

## License

By contributing, you agree that your contribution is licensed under the MIT License. See [LICENSE](LICENSE).
