# Research Notes

Research Notes is an interactive notebook about computational neuroscience. The first chapter explores orientation selectivity through a rotating grating, spatial pooling, a response threshold, and a recurrent population model. The mathematical derivations accompany the interactive figures.

## Run locally

Use Node.js 20 or newer.

    npm ci
    npm test
    npm run preview

Open http://127.0.0.1:4173. The test command builds the static site in dist/, including the rendered equations, local fonts, and browser simulations.

## Deploy to GitHub Pages

In Settings → Pages, choose GitHub Actions as the source. The Pages workflow tests the notebook and deploys dist/ on pushes to main. It can also be run from the Actions tab.

## Source and license

The notebook and figures are in src/. The static build is in scripts/ and the numerical checks are in tests/. The original text and code use the MIT license. The chapter links to the papers it discusses.
