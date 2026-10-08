# Heirloom Review

Fine Jewelry Watches Comparison & Review Guide.

## Setup

This project uses plain HTML, CSS, and JS.
No build step is required. Serve the files using any static server (e.g., VS Code Live Server, python -m http.server).

## Files
- `index.html`: Home page
- `watches.html`: Watches hub
- `jewelry.html`: Jewelry hub & Diamond Guide
- `compare.html`: Feature matrix
- `services.html`: Platform services and FAQ
- `about.html`: Methodology, heritage, and contact
- `404.html`: Not found page

## Affiliate Tracking Spec
Every "Check price" button implements affiliate tracking via data attributes:
```html
<a href="https://merchant.example/item?utm_source=heirloom-review&utm_medium=affiliate&utm_campaign=[page]&utm_content=[product-slug]"
   rel="sponsored noopener" target="_blank"
   data-affiliate="true"
   data-product-id="[product-slug]"
   data-merchant="[merchant-name]"
   data-placement="[hero|card|matrix|modal|compare|guide|sticky]">
  Check price
</a>
```
Clicks are pushed to `window.dataLayer` via `main.js`.
