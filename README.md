# SNSPD 3D Visualization Lab

An educational, interactive visualization of a Superconducting Nanowire Single-Photon Detector (SNSPD). The project presents the detector's operating principle, photon interaction, hotspot formation, current redistribution, and electrical readout concepts.

## Run locally

**Requirements:** Node.js 22 (or a compatible newer LTS release) and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Production build

```bash
npm run build
npm run preview
```

The production site is generated in the `dist/` directory.

## Deploy to GitHub Pages

This repository is configured for the GitHub Pages project site at:

`https://<your-github-username>.github.io/snspd-3d-visualization/`

1. Push the project to the `main` branch of the `snspd-3d-visualization` repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Leave **Custom domain** empty unless you own and intend to configure a domain.
5. Open the **Actions** tab and wait for **Deploy SNSPD Lab to GitHub Pages** to complete.
6. Open the Pages URL shown in the deployment job.

The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the Vite site, uploads `dist/`, and deploys it. The Vite `base` setting and public image paths are configured for this repository name. If you rename the repository, update the `base` value in `vite.config.ts` and the URL above.

## Project structure

- `src/components/` — interface and visualization components
- `src/pages/` — Home, Simulation, Working Principle, Knowledge, Applications, and About pages
- `src/three/` — Three.js scene implementation
- `src/hooks/` — simulation state and behavior
- `src/utils/` and `src/data/` — physics helpers and educational content
- `public/images/` — scientific diagrams

## Educational-use note

This project is an educational visualization. Its animations and simplified models are intended to explain concepts and should not be treated as calibrated device-design or experimental-prediction software.
