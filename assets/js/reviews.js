/*
 * Heirloom Review - Reviews Logic
 */

window.renderReviews = function(item) {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  // In a real app, we'd fetch reviews for this specific item.id. 
  // For demo, we use the global dummy reviews pool.
  let reviews = [...window.heirloomData.reviews];

  // Render initial frame
  container.innerHTML = `
    <div class="reviews-breakdown">
      <div class="rating-summary">
        <h2>${item.rating}</h2>
        <div style="color:#f59e0b; font-size:1.25rem; margin-bottom:8px;">
          ${getStars(item.rating)}
        </div>
        <p style="font-size:0.875rem; color:var(--color-text-light);">${item.reviewsCount} verified reviews</p>
        <p style="font-size:0.75rem; font-style:italic; margin-top:8px;">Demo Data</p>
      </div>
      <div class="star-distribution" id="star-dist">
        <!-- Rendered dynamically -->
      </div>
    </div>
    
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4); flex-wrap:wrap; gap:16px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <label for="review-sort" style="font-size:0.875rem; font-weight:700;">Sort:</label>
        <select id="review-sort" class="filter-select" style="padding:4px 8px;">
          <option value="newest">Newest</option>
          <option value="high">Highest Rating</option>
          <option value="low">Lowest Rating</option>
        </select>
      </div>
      <label style="display:flex; align-items:center; gap:8px; font-size:0.875rem; cursor:pointer;">
        <input type="checkbox" id="review-verified-only"> Verified Only
      </label>
    </div>

    <div id="reviews-list"></div>
  `;

  const distContainer = document.getElementById('star-dist');
  const listContainer = document.getElementById('reviews-list');
  const sortSelect = document.getElementById('review-sort');
  const filterVerified = document.getElementById('review-verified-only');

  // Calculate distribution (mocked based on rating for demo realism)
  const dist = { 5: 65, 4: 20, 3: 10, 2: 3, 1: 2 }; 
  
  let distHtml = '';
  for (let i = 5; i >= 1; i--) {
    distHtml += `
      <div class="dist-bar">
        <span style="width:40px;">${i} Stars</span>
        <div class="dist-track"><div class="dist-fill" style="width:${dist[i]}%"></div></div>
        <span style="width:30px; text-align:right;">${dist[i]}%</span>
      </div>
    `;
  }
  distContainer.innerHTML = distHtml;

  function renderList() {
    let filtered = [...reviews];
    
    if (filterVerified.checked) {
      filtered = filtered.filter(r => r.verified);
    }
    
    const sort = sortSelect.value;
    if (sort === 'newest') {
      filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'high') {
      filtered.sort((a,b) => b.rating - a.rating);
    } else if (sort === 'low') {
      filtered.sort((a,b) => a.rating - b.rating);
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '<p style="text-align:center; padding:32px 0;">No reviews match your criteria.</p>';
      return;
    }

    let listHtml = '';
    filtered.forEach(r => {
      const vBadge = r.verified ? `<span class="badge badge-verified" aria-label="Verified Owner">Verified Owner</span>` : '';
      listHtml += `
        <div style="border-bottom:1px solid var(--color-border); padding-bottom:var(--space-4); margin-bottom:var(--space-4);">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:50%; background:var(--color-bg-offset); display:flex; align-items:center; justify-content:center; font-weight:700;">${r.user}</div>
              <div>
                <div style="color:#f59e0b; font-size:0.875rem;">${getStars(r.rating)}</div>
                <div style="font-size:0.75rem; color:var(--color-text-light);">${new Date(r.date).toLocaleDateString()}</div>
              </div>
            </div>
            ${vBadge}
          </div>
          <h4 style="margin-bottom:8px; font-size:1rem;">${r.title}</h4>
          <p style="font-size:0.875rem; margin-bottom:0;">${r.body}</p>
        </div>
      `;
    });
    listContainer.innerHTML = listHtml;
  }

  function getStars(num) {
    let html = '';
    const full = Math.floor(num);
    const half = num % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    
    for(let i=0; i<full; i++) html += '<i class="ph-fill ph-star"></i>';
    for(let i=0; i<half; i++) html += '<i class="ph-fill ph-star-half"></i>';
    for(let i=0; i<empty; i++) html += '<i class="ph ph-star"></i>';
    return html;
  }

  sortSelect.addEventListener('change', renderList);
  filterVerified.addEventListener('change', renderList);
  
  renderList();
};
