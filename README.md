# FiberSkynet — Refined Squarespace-inspired Website (V2)

A deliberately restrained visual refresh of the **current** `www.fiberskynet.net` website, not a new rebrand. Static HTML/CSS/JS, suitable for **Cloudflare Pages free tier**.

## What is included

- Homepage with the original purple/blue fiber imagery and familiar sections
- `/packages/` with the **11** existing internet package tiers, from 1 Mbps/$15 to 20 Mbps/$140
- The four existing TV packages: Basic ($6), Entertainment+ ($2), Sports ($5), Complete+ ($13)
- `/contact/` with the same business details and a mailto-based contact form
- Preserved CTA URLs: WhatsApp `https://wa.link/loa4gw`, Speed Test `https://fiberskynet.speedtest.net/`, footer credit `https://www.metnmedia.com/`
- Responsive navigation, accessible focus states, basic SEO metadata
- Small additional section, **Getting connected is simple**

## Important: the official logo and original photos

The `assets/logo.svg` and `assets/logo-white.svg` are **careful vector approximations** of the current Wi-Fi + FiberSkynet wordmark as seen in live branded artwork. They are **not exports of the original brand files**. If you have the original logo SVG/PNG, replace these approximations before going live to guarantee exact logo fidelity.

Original website images are initially referenced from Squarespace CDN to faithfully preview the existing visuals. **Do not cancel Squarespace until all images have been downloaded and made local.** Run `python3 download-original-assets.py` with working internet to download these images and automatically replace each URL in HTML/CSS. Check all pages afterwards. This download utility only retrieves public images already referenced by this project; it does not scrape login-protected files.

## View locally

Open `index.html` in a browser to preview. Internal links use directory URLs (`./packages/` and `./contact/`), so for reliable navigation use:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Upload to Cloudflare Pages

1. Run the download utility and verify all local assets render.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Upload assets.
3. Upload the **contents** of this folder (with `index.html` at root), not the ZIP itself.
4. Test the temporary `*.pages.dev` site on mobile and desktop, verify every button.
5. Add `www.fiberskynet.net` (and apex as needed) as custom domains; migrate DNS carefully, preserving MX/TXT and other non-website records.
6. Only cancel Squarespace once HTTPS, DNS, images, links and contact channels work on production.

## Notes that must be verified before launch

- Homepage intro currently says "Internet & entertainment packages starting from $20/month" as displayed on the live homepage, whereas the internet pricing page includes a $15 package, TV from $2/month; adjust marketing copy if necessary.
- The Squarespace site has a contact form, but the replacement contact form composes an email (`mailto:`) and **does not send mail on its own**. If you need server-side submission, add a Cloudflare Pages Function + email service later.
- `FREE NIGHT QUOTA` / `DOUBLE SPEED` hours are copied from the existing `/packages` page, even though their time windows appear unusual. Confirm before publishing.
- No DNS, Squarespace, or Cloudflare account settings have been modified.

Built from publicly visible live page contents and assets checked November 11, 2026.

## Connected GitHub / Cloudflare preview steps

This repository is prepared for Git integration. Create the repository on GitHub,
push all these files to `main`, then in Cloudflare Pages connect the repository.

- Framework preset: None
- Build command: `python3 download-original-assets.py`
- Build output directory: `.`
- Root directory: `/`

The build step must successfully download the images from the live Squarespace
site to the local `assets/original/` folder before the public preview is served.
Do **not** point the preview domain to the live FiberSkynet domain.

The current header SVG logo is still an approximation until the exact original
`Shelter Design-13.png` logo asset is exported. The downloader below attempts
to discover the official logo dynamically from the live homepage. Review its
result manually before switching production DNS.
