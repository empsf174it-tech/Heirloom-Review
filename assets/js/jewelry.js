/*
 * Heirloom Review - Jewelry Hub
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('jewelry-grid')) return;

  const grid = document.getElementById('jewelry-grid');
  const noResults = document.getElementById('no-results');
  const activeChips = document.getElementById('active-chips');
  const compareTray = document.getElementById('compare-tray');
  const compareCount = document.getElementById('compare-count');
  const compareList = document.getElementById('compare-items-list');
  const compareMessage = document.getElementById('compare-message');
  
  // Filters
  const filterType = document.getElementById('filter-type');
  const filterMetal = document.getElementById('filter-metal');
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

  let currentItems = [...window.heirloomData.jewelry];
  
  // URL Params initialization
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam) {
    filterType.value = typeParam;
  }
  
  // Compare State
  let compareItems = [];
  try {
    const stored = sessionStorage.getItem('compare_jewelry');
    if (stored) compareItems = JSON.parse(stored);
  } catch (e) {}

  function renderGrid() {
    grid.innerHTML = '';
    
    if (currentItems.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    currentItems.forEach(j => {
      const isComparing = compareItems.includes(j.id);
      grid.innerHTML += `
        <div class="card" data-id="${j.id}">
          <div class="card-img-wrap">
            <img src="${j.image}" alt="${j.name}" loading="lazy">
          </div>
          <h3>${j.name}</h3>
          <p style="margin-bottom:8px; font-size:0.875rem;">${j.brand} • <span class="tabular">$${j.price.toLocaleString()}</span></p>
          <div style="display:flex; gap:8px; justify-content:center; margin-bottom:16px;">
            <div class="score-badge">${j.score.total}/10 Score</div>
            <div style="font-size:0.875rem; color:#f59e0b; font-weight:700;"><i class="ph-fill ph-star"></i> ${j.rating} User</div>
          </div>
          <div style="font-size:0.75rem; text-align:left; background:var(--color-bg-offset); padding:8px; border-radius:4px; width:100%; margin-bottom:16px;">
            <div style="color:var(--color-success);"><i class="ph ph-check"></i> ${j.pros[0]}</div>
            <div style="color:var(--color-success);"><i class="ph ph-check"></i> ${j.pros[1] || ''}</div>
            <div style="color:var(--color-error);"><i class="ph ph-x"></i> ${j.cons[0]}</div>
          </div>
          <div style="margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-secondary view-detail" data-id="${j.id}" style="width: 100%;">View Review</button>
            <label style="display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.875rem; cursor:pointer;">
              <input type="checkbox" class="compare-cb" value="${j.id}" ${isComparing ? 'checked' : ''}> Add to Compare
            </label>
          </div>
        </div>
      `;
    });

    bindEvents();
    renderCompareTray();
  }

  function applyFilters() {
    const type = filterType.value;
    const mat = filterMetal.value;
    const tier = filterTier.value;
    const min = parseFloat(minPrice.value);
    const max = parseFloat(maxPrice.value);
    
    activeChips.innerHTML = '';
    currentItems = window.heirloomData.jewelry.filter(j => {
      let pass = true;
      if (type && j.type !== type) pass = false;
      if (mat && j.specs.metal !== mat) pass = false;
      
      if (tier) {
        const t = tiers[tier];
        if (j.price < t.min || j.price >= t.max) pass = false;
      }
      
      if (!isNaN(min) && j.price < min) pass = false;
      if (!isNaN(max) && j.price > max) pass = false;
      
      return pass;
    });
    
    // Sort
    const sort = sortBy.value;
    if (sort === 'price-asc') currentItems.sort((a,b) => a.price - b.price);
    else if (sort === 'price-desc') currentItems.sort((a,b) => b.price - a.price);
    else if (sort === 'rating') currentItems.sort((a,b) => b.score.total - a.score.total);
    
    // Chips
    if (type) addChip(type, () => { filterType.value = ''; applyFilters(); });
    if (mat) addChip(mat, () => { filterMetal.value = ''; applyFilters(); });
    if (tier) addChip(tiers[tier].label, () => { filterTier.value = ''; applyFilters(); });
    if (!isNaN(min) || !isNaN(max)) addChip(`$${min || 0} - $${max || '∞'}`, () => { minPrice.value = ''; maxPrice.value = ''; applyFilters(); });
    
    // Update URL if type changes without reloading
    if (type) {
      window.history.replaceState({}, '', `?type=${type}`);
    } else if (window.location.search.includes('type=')) {
      window.history.replaceState({}, '', 'jewelry.html');
    }

    renderGrid();
  }

  function addChip(label, onRemove) {
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    chip.innerHTML = `<span style="text-transform:capitalize;">${label}</span> <button aria-label="Remove filter">&times;</button>`;
    chip.querySelector('button').addEventListener('click', onRemove);
    activeChips.appendChild(chip);
  }

  function bindEvents() {
    document.querySelectorAll('.view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.openDetailModal) {
          window.openDetailModal(e.target.dataset.id, 'jewelry');
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
      sessionStorage.setItem('compare_jewelry', JSON.stringify(compareItems));
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
      const j = window.heirloomData.jewelry.find(x => x.id === id);
      if (j) {
        compareList.innerHTML += `
          <div style="display:flex; align-items:center; gap:8px; background:var(--color-bg-offset); padding:4px 8px; border-radius:4px; font-size:0.75rem;">
            <img src="${j.image}" style="width:24px; height:24px; object-fit:cover; border-radius:2px;">
            <span style="max-width:80px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${j.name}</span>
            <button class="remove-compare" data-id="${j.id}" style="background:none; border:none; cursor:pointer;"><i class="ph ph-x"></i></button>
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

  filterType.addEventListener('change', applyFilters);
  filterMetal.addEventListener('change', applyFilters);
  filterTier.addEventListener('change', applyFilters);
  sortBy.addEventListener('change', applyFilters);
  
  applyPrice.addEventListener('click', () => {
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
    filterType.value = '';
    filterMetal.value = '';
    filterTier.value = '';
    sortBy.value = 'featured';
    minPrice.value = '';
    maxPrice.value = '';
    minPrice.classList.remove('error');
    maxPrice.classList.remove('error');
    applyFilters();
  });

  applyFilters(); // Initial render with possible URL params
  
  // Check URL params for deep link to detail modal
  const deepId = urlParams.get('id');
  if (deepId && window.openDetailModal) {
    setTimeout(() => {
      window.openDetailModal(deepId, 'jewelry');
    }, 100);
  }
});
