/*
 * Heirloom Review - Detail Modal
 */

window.openDetailModal = function(id, type) {
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  const item = window.heirloomData[type === 'watch' ? 'watches' : 'jewelry'].find(x => x.id === id);
  if (!item) return;

  // Update Title
  document.title = `${item.name} Review | Heirloom Review`;
  
  // Inject JSON-LD dynamically
  let oldJsonLd = document.getElementById('dynamic-json-ld');
  if (oldJsonLd) oldJsonLd.remove();
  
  const jsonLd = document.createElement('script');
  jsonLd.id = 'dynamic-json-ld';
  jsonLd.type = 'application/ld+json';
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": item.name,
    "brand": { "@type": "Brand", "name": item.brand },
    "image": item.image,
    "description": `Review and specifications for ${item.name}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": item.rating,
      "reviewCount": item.reviewsCount
    }
  });
  document.head.appendChild(jsonLd);

  // Generate Scorecard
  let scoresHtml = '';
  for (const [key, val] of Object.entries(item.score.breakdown)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    scoresHtml += `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.875rem;">
        <span>${label}</span>
        <span style="font-weight:700;">${val}/10</span>
      </div>
      <div style="width:100%; height:4px; background:var(--color-border); border-radius:2px; margin-bottom:12px;">
        <div style="height:100%; width:${val*10}%; background:var(--color-primary); border-radius:2px;"></div>
      </div>
    `;
  }

  // Generate Specs Table
  let specsHtml = '<table class="matrix-table" style="width:100%; font-size:0.875rem;"><tbody>';
  for (const [key, val] of Object.entries(item.specs)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    specsHtml += `<tr><td style="font-weight:700; width:40%; background:var(--color-bg-offset);">${label}</td><td>${val}</td></tr>`;
  }
  specsHtml += '</tbody></table>';

  // Generate Pros Cons
  let pcHtml = `<div class="pros-cons-grid mt-4">`;
  pcHtml += `<div class="pros-box"><h4>Pros</h4><ul class="pc-list">`;
  item.pros.forEach(p => pcHtml += `<li><i class="ph ph-check-circle" style="color:var(--color-success); font-size:1.125rem;"></i> ${p}</li>`);
  pcHtml += `</ul></div>`;
  
  pcHtml += `<div class="cons-box"><h4>Cons</h4><ul class="pc-list">`;
  item.cons.forEach(c => pcHtml += `<li><i class="ph ph-x-circle" style="color:var(--color-error); font-size:1.125rem;"></i> ${c}</li>`);
  pcHtml += `</ul></div></div>`;

  const author = type === 'watch' ? 'E. Thorne, Horologist' : 'A. Vance, Gemologist';
  const pageParam = type === 'watch' ? 'watches' : 'jewelry';

  body.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:var(--space-6);">
      <!-- Left Col -->
      <div style="flex:1; min-width:300px;">
        <img src="${item.image}" alt="${item.name}" style="width:100%; border-radius:var(--border-radius); margin-bottom:var(--space-4);">
        <div style="background:var(--color-bg-offset); padding:var(--space-4); border-radius:var(--border-radius);">
          <h3 style="margin-bottom:16px;">Editorial Scorecard</h3>
          ${scoresHtml}
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-border); padding-top:12px; margin-top:8px;">
            <span style="font-family:var(--font-heading); font-weight:700; font-size:1.125rem;">Total Score</span>
            <span class="score-badge" style="font-size:1.25rem;">${item.score.total}/10</span>
          </div>
          <div style="text-align:right; margin-top:8px;">
            <a href="about.html#methodology" style="font-size:0.75rem; text-decoration:underline;">How we score</a>
          </div>
        </div>
      </div>
      
      <!-- Right Col -->
      <div style="flex:2; min-width:300px;">
        <h2 style="margin-bottom:4px;" id="modal-title">${item.name}</h2>
        <div style="color:var(--color-text-light); margin-bottom:var(--space-4); font-size:0.875rem;">
          By ${author} • Updated Oct 2026
        </div>
        
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:var(--space-4);">
          <span class="tabular" style="font-family:var(--font-heading); font-size:1.5rem; color:var(--color-primary);">$${item.price.toLocaleString()}</span>
          <!-- AFFILIATE_LINK -->
          <a href="https://merchant.example/item?utm_source=heirloom-review&utm_medium=affiliate&utm_campaign=${pageParam}&utm_content=${item.id}"
             rel="sponsored noopener" target="_blank"
             data-affiliate="true" data-product-id="${item.id}" data-merchant="DemoMerchant" data-placement="modal"
             class="btn btn-primary">Check Price</a>
        </div>
        <p class="affiliate-disclosure" style="text-align:left;">Affiliate link. Prices are demo data.</p>
        
        <div style="margin-bottom:var(--space-5);">
          <h3 style="font-size:1.25rem;">The Verdict</h3>
          <p style="margin-bottom:8px;"><strong>Who it's for:</strong> ${item.verdict.for}</p>
          <p><strong>Who should skip:</strong> ${item.verdict.skip}</p>
        </div>

        <h3 style="font-size:1.25rem;">Specifications</h3>
        ${specsHtml}
        
        ${pcHtml}
      </div>
    </div>

    <!-- Reviews Section Container -->
    <div style="margin-top:var(--space-6); border-top:1px solid var(--color-border); padding-top:var(--space-5);" id="reviews-container">
      <h3 style="margin-bottom:var(--space-4);">Verified User Reviews</h3>
      <!-- Reviews injected here by reviews.js -->
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Call to initialize reviews
  if (window.renderReviews) {
    window.renderReviews(item);
  }
  
  // Trap focus
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.focus();
};
