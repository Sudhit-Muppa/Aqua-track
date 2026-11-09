# Aqua Track

Website for the Aqua Track Project: six high school students in Loudoun County,
Virginia, measuring water quality in local ponds and Potomac tributaries.
Entered in Step Up Loudoun Youth.

**Live sections:** mission · interactive field probe · watershed chart · project log · team · take action

## Running it

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

Vercel deploys `main` to https://www.aquatrackproject.org. Every file is served
at its own path, so the legal pages live at `/privacy.html`, `/terms.html`,
`/delete-account.html` and `/auth.html`; the apps link to those addresses.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | All page content |
| `style.css` | Design tokens and every component style |
| `script.js` | Masthead, hero canvas, field probe, watershed chart, scroll reveal |
| `privacy.html`, `terms.html` | Privacy policy and terms for the site and the AquaTrack app |
| `delete-account.html` | How to delete an AquaTrack account; the app stores link here |
| `auth.html` | Finishes the app's email confirmation and password reset links |

## The account page

`auth.html` is where Supabase sends people from the app's confirmation and
password-reset emails. It loads a pinned supabase-js from jsDelivr with an
integrity hash, reads `token_hash` and `type` from the link, calls
`verifyOtp`, and shows either "Email confirmed" or a new-password form. Before
it works, paste the project URL and the anon (publishable) key into the two
constants at the top of its script; the anon key is public by design, so row
level security must be on for every table and bucket.

In the Supabase dashboard set Site URL to `https://www.aquatrackproject.org`,
add `https://www.aquatrackproject.org/auth.html` to the redirect URLs, and
change the email templates to link to
`{{ .SiteURL }}/auth.html?token_hash={{ .TokenHash }}&type=signup` (and
`type=recovery` for the reset template) instead of `{{ .ConfirmationURL }}`.

## The field probe

The interactive panel in the Probe section runs a simplified water quality index
over eleven parameters in four groups: physical (temperature, turbidity,
conductivity), chemistry (pH, dissolved oxygen, chloride), nutrients (nitrate,
nitrite, ammonia, phosphate) and bacteria (E. coli). The ESP32 rig reads the
physical parameters, pH and oxygen; the rest stand in for test-kit readings.
Sub-index curves and weights live in `SCORE` and `WEIGHT` in `script.js`, and the
single worst sub-score caps the total so one failing parameter cannot be averaged
away. It is a demonstration model, not a live sensor feed. The page says so on
screen.

## Logo

`favicon.svg` is the three-wave mark on a transparent background: navy in light
mode, white in dark mode. The same waves are inlined in the masthead and footer of
`index.html`, drawn in `currentColor` so they follow the text color.

## The watershed chart

The map is a hand-built SVG generated from the waypoint coordinates in the
`REACHES` array in `script.js`, projected with a cosine-corrected equirectangular
projection. No mapping API and no key required. Reach lengths shown in the panel
are computed from the coordinates at runtime.

To publish a measured grade for a reach, add a `grade` value to its entry and
colour its path from the index ramp (`--wq-good` through `--wq-bad` in
`style.css`); the legend already documents the bands.
