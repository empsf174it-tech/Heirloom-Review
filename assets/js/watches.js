/*
 * Heirloom Review - Watches Hub
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('watches-grid')) return;

  const grid = document.getElementById('watches-grid');
  const noResults = document.getElementById('no-results');
  const activeChips = document.getElementById('active-chips');
  const compareTray = document.getElementById('compare-tray');
  const compareCount = document.getElementById('compare-count');
  const compareList = document.getElementById('compare-items-list');
  const compareMessage = document.getElementById('compare-message');
  
  // Filters
  const filterMovement = document.getElementById('filter-movement');
  const filterMaterial = document.getElementById('filter-material');
  const filterTier = document.getElementById('filter-tier');
  const sortBy = document.getElementById('sort-by');
  const minPrice = document.getElementById('min-price');
  const maxPrice = document.getElementById('max-price');
  const applyPrice = document.getElementById('apply-price');
  const resetBtn = document.getElementById('reset-filters');

  // Populate Tiers
  const tiers = window.heirloomData.priceTiers;
  for (const key in tiers) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = tiers[key].label;
    filterTier.appendChild(opt);
  }

  let currentWatches = [...window.heirloomData.watches];
  
  // Compare State
  let compareItems = [];
  try {
    const stored = sessionStorage.getItem('compare_watches');
    if (stored) compareItems = JSON.parse(stored);
  } catch (e) {}

  function renderGrid() {
    grid.innerHTML = '';
    
    if (currentWatches.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    currentWatches.forEach(w => {
      const isComparing = compareItems.includes(w.id);
      grid.innerHTML += `
        <div class="card" data-id="${w.id}">
          <div class="card-img-wrap">
            <img src="${w.image}" alt="${w.name}" loading="lazy">
          </div>
          <h3>${w.name}</h3>
          <p style="margin-bottom:8px; font-size:0.875rem;">${w.brand} • <span class="tabular">$${w.price.toLocaleString()}</span></p>
          <div style="display:flex; gap:8px; justify-content:center; margin-bottom:16px;">
            <div class="score-badge">${w.score.total}/10 Score</div>
            <div style="font-size:0.875rem; color:#f59e0b; font-weight:700;"><i class="ph-fill ph-star"></i> ${w.rating} User</div>
          </div>
          <div style="font-size:0.75rem; text-align:left; background:var(--color-bg-offset); padding:8px; border-radius:4px; width:100%; margin-bottom:16px;">
            <div style="color:var(--color-success);"><i class="ph ph-check"></i> ${w.pros[0]}</div>
            <div style="color:var(--color-success);"><i class="ph ph-check"></i> ${w.pros[1] || ''}</div>
            <div style="color:var(--color-error);"><i class="ph ph-x"></i> ${w.cons[0]}</div>
          </div>
          <div style="margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-secondary view-detail" data-id="${w.id}" style="width: 100%;">View Review</button>
            <label style="display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.875rem; cursor:pointer;">
              <input type="checkbox" class="compare-cb" value="${w.id}" ${isComparing ? 'checked' : ''}> Add to Compare
            </label>
          </div>
        </div>
      `;
    });

    bindEvents();
    renderCompareTray();
  }

  function applyFilters() {
    const mov = filterMovement.value;
    const mat = filterMaterial.value;
    const tier = filterTier.value;
    const min = parseFloat(minPrice.value);
    const max = parseFloat(maxPrice.value);
    
    activeChips.innerHTML = '';
    currentWatches = window.heirloomData.watches.filter(w => {
      let pass = true;
      if (mov && w.specs.movementType !== mov) pass = false;
      if (mat && w.specs.caseMaterial !== mat) pass = false;
      
      if (tier) {
        const t = tiers[tier];
        if (w.price < t.min || w.price >= t.max) pass = false;
      }
      
      if (!isNaN(min) && w.price < min) pass = false;
      if (!isNaN(max) && w.price > max) pass = false;
      
      return pass;
    });
    
    // Sort
    const sort = sortBy.value;
    if (sort === 'price-asc') currentWatches.sort((a,b) => a.price - b.price);
    else if (sort === 'price-desc') currentWatches.sort((a,b) => b.price - a.price);
    else if (sort === 'rating') currentWatches.sort((a,b) => b.score.total - a.score.total);
    
    // Chips
    if (mov) addChip(mov, () => { filterMovement.value = ''; applyFilters(); });
    if (mat) addChip(mat, () => { filterMaterial.value = ''; applyFilters(); });
    if (tier) addChip(tiers[tier].label, () => { filterTier.value = ''; applyFilters(); });
    if (!isNaN(min) || !isNaN(max)) addChip(`$${min || 0} - $${max || '∞'}`, () => { minPrice.value = ''; maxPrice.value = ''; applyFilters(); });
    
    renderGrid();
  }

  function addChip(label, onRemove) {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    chip.innerHTML = `${label} <button aria-label="Remove filter">&times;</button>`;
    chip.querySelector('button').addEventListener('click', onRemove);
    activeChips.appendChild(chip);
  }

  function bindEvents() {
    document.querySelectorAll('.view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.openDetailModal) {
          window.openDetailModal(e.target.dataset.id, 'watch');
        }
      });
    });

    document.querySelectorAll('.compare-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.value;
        if (e.target.checked) {
          if (compareItems.length >= 4) {
            e.target.checked = false;
            compareMessage.textContent = 'Maximum 4 items allowed.';
            compareMessage.style.color = 'var(--color-error)';
            return;
          }
          compareItems.push(id);
        } else {
          compareItems = compareItems.filter(i => i !== id);
        }
        updateCompareState();
      });
    });
  }

  function updateCompareState() {
    compareMessage.textContent = '';
    compareMessage.style.color = '';
    try {
      sessionStorage.setItem('compare_watches', JSON.stringify(compareItems));
    } catch (e) {}
    renderCompareTray();
  }

  function renderCompareTray() {
    compareCount.textContent = compareItems.length;
    if (compareItems.length > 0) {
      compareTray.classList.add('active');
    } else {
      compareTray.classList.remove('active');
    }
    
    compareList.innerHTML = '';
    compareItems.forEach(id => {
      const w = window.heirloomData.watches.find(x => x.id === id);
      if (w) {
        compareList.innerHTML += `
          <div style="display:flex; align-items:center; gap:8px; background:var(--color-bg-offset); padding:4px 8px; border-radius:4px; font-size:0.75rem;">
            <img src="${w.image}" style="width:24px; height:24px; object-fit:cover; border-radius:2px;">
            <span style="max-width:80px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${w.name}</span>
            <button class="remove-compare" data-id="${w.id}" style="background:none; border:none; cursor:pointer;"><i class="ph ph-x"></i></button>
          </div>
        `;
      }
    });

    document.querySelectorAll('.remove-compare').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        compareItems = compareItems.filter(i => i !== id);
        const cb = document.querySelector(`.compare-cb[value="${id}"]`);
        if (cb) cb.checked = false;
        updateCompareState();
      });
    });
  }

  document.getElementById('clear-compare').addEventListener('click', () => {
    compareItems = [];
    document.querySelectorAll('.compare-cb').forEach(cb => cb.checked = false);
    updateCompareState();
  });

  filterMovement.addEventListener('change', applyFilters);
  filterMaterial.addEventListener('change', applyFilters);
  filterTier.addEventListener('change', applyFilters);
  sortBy.addEventListener('change', applyFilters);
  
  applyPrice.addEventListener('click', () => {
    // Validate min <= max
    const min = parseFloat(minPrice.value);
    const max = parseFloat(maxPrice.value);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      minPrice.classList.add('error');
      maxPrice.classList.add('error');
      return;
    }
    minPrice.classList.remove('error');
    maxPrice.classList.remove('error');
    applyFilters();
  });

  resetBtn.addEventListener('click', () => {
    filterMovement.value = '';
    filterMaterial.value = '';
    filterTier.value = '';
    sortBy.value = 'featured';
    minPrice.value = '';
    maxPrice.value = '';
    minPrice.classList.remove('error');
    maxPrice.classList.remove('error');
    applyFilters();
  });

  // Check URL params for deep link to detail modal
  const urlParams = new URLSearchParams(window.location.search);
  const deepId = urlParams.get('id');

  renderGrid();
  
  if (deepId && window.openDetailModal) {
    // Let DOM render first
    setTimeout(() => {
      window.openDetailModal(deepId, 'watch');
    }, 100);
  }
});
