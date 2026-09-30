# Sangah Lee — Academic research portfolio

Website: https://se2929.github.io

A static multipage academic website. The home page contains a short introduction, a personal portrait, and clickable research images and titles leading to separate introduction pages.

## Pages

- `index.html`: compact home page
- `about.html`: academic profile
- `machine-learning.html`: physics-informed machine learning
- `electrochemistry.html`: CO₂ reduction and electrochemical interfaces
- `mlip.html`: prospective ML interatomic potential interests
- `workflow.html`: interactive notebook workflow and 20 candidate waveforms
- `selection.html`: selection-method explanation and illustrative weights
- `poster.html`: WEEF & GEDC 2025 team poster

## Assets and implementation

`pages.css` and `styles.css` style the pages. `page-interactions.js` runs the workflow tabs, waveform explorer, endpoint comparison, and weighting demo. `protocols.js` contains the 20 deterministic candidate waveforms exported from the research notebook. The electrochemistry card photograph is an original image extracted from the supplied research poster. The other cards use a notebook waveform preview and a conceptual MLIP diagram. The personal portrait was supplied by Sangah Lee.

GitHub Pages serves `main` at the repository root; no build step is needed. Optional Google Fonts have system-font fallbacks.

The adaptive information-weighted revision is a method pending full evaluation. Demonstration weights use hypothetical inputs. MLIP topics are future interests. CO₂RR comparisons show reported gas-product endpoints. The original CV and full team report are not distributed.
