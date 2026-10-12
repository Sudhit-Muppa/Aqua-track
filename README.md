# Aqua Track

Website for the Aqua Track Project — six middle school students in Loudoun County,
Virginia, measuring water quality in local ponds and Potomac tributaries.
Entered in Step Up Loudoun Youth.

**Live sections:** mission · interactive field probe · watershed chart · project log · team · take action

## Running it

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

Deploys as-is to GitHub Pages.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | All page content |
| `style.css` | Design tokens and every component style |
| `script.js` | Masthead, hero canvas, field probe, watershed chart, scroll reveal |

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
