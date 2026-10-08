/*
 * Heirloom Review - Compare Matrix Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('compare-table');
  if (!table) return;

  const tabWatches = document.getElementById('tab-watches');
  const tabJewelry = document.getElementById('tab-jewelry');
  const toggleDiff = document.getElementById('toggle-differences');
  const emptyState = document.getElementById('compare-empty');
  const matrixContainer = document.getElementById('matrix-container');

  let currentCategory = new URLSearchParams(window.location.search).get('tab') || 'watches';
  if (currentCategory !== 'watches' && currentCategory !== 'jewelry') currentCategory = 'watches';

  let itemsData = [];
  
  function getItemsFromStorage() {
    try {
      const stored = sessionStorage.getItem(`compare_${currentCategory}`);
      if (stored) {
        const ids = JSON.parse(stored);
        itemsData = ids.map(id => window.heirloomData[currentCategory].find(x => x.id === id)).filter(Boolean);
      } else {
        itemsData = [];
      }
    } catch(e) {
      itemsData = [];
    }
  }

  function renderMatrix() {
    getItemsFromStorage();
    
    // Update Tabs UI
    if (currentCategory === 'watches') {
      tabWatches.className = 'btn btn-primary';
      tabJewelry.className = 'btn btn-secondary';
    } else {
      tabWatches.className = 'btn btn-secondary';
      tabJewelry.className = 'btn btn-primary';
    }

    if (itemsData.length === 0) {
      matrixContainer.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    
    matrixContainer.style.display = 'block';
    emptyState.style.display = 'none';

    // Define spec rows based on category
    let rows = [];
    if (currentCategory === 'watches') {
      rows = [
        { label: 'Movement', key: 'movementType', group: 'Movement' },
        { label: 'Caliber', key: 'caliber', group: 'Movement' },
        { label: 'Power Reserve', key: 'powerReserve', group: 'Movement' },
        { label: 'Frequency', key: 'frequency', group: 'Movement' },
        { label: 'Material', key: 'caseMaterial', group: 'Case' },
        { label: 'Diameter', key: 'caseDiameter', group: 'Case' },
        { label: 'Thickness', key: 'caseThickness', group: 'Case' },
        { label: 'Lug Width', key: 'lugWidth', group: 'Case' },
        { label: 'Crystal', key: 'crystal', group: 'Case' },
        { label: 'Water Res.', key: 'waterResistance', group: 'Other' },
        { label: 'Strap', key: 'strap', group: 'Other' },
        { label: 'Complications', key: 'complications', group: 'Other' },
        { label: 'Warranty', key: 'warranty', group: 'Other' },
        { label: 'Price', key: '_price', group: 'Value' },
        { label: 'Score', key: '_score', group: 'Value' }
      ];
    } else {
      rows = [
        { label: 'Metal', key: 'metal', group: 'Materials' },
        { label: 'Metal Weight', key: 'metalWeight', group: 'Materials' },
        { label: 'Gemstone', key: 'gemstone', group: 'Stone' },
        { label: 'Carat Total', key: 'carat', group: 'Stone' },
        { label: 'Cut', key: 'cut', group: 'Stone' },
        { label: 'Color', key: 'color', group: 'Stone' },
        { label: 'Clarity', key: 'clarity', group: 'Stone' },
        { label: 'Setting', key: 'setting', group: 'Design' },
        { label: 'Certification', key: 'certification', group: 'Design' },
        { label: 'Size/Length', key: 'sizeRange', group: 'Design' },
        { label: 'Care', key: 'care', group: 'Other' },
        { label: 'Warranty', key: 'warranty', group: 'Other' },
        { label: 'Price', key: '_price', group: 'Value' },
        { label: 'Score', key: '_score', group: 'Value' }
      ];
    }

    const showDiff = toggleDiff.checked;
    
    // Find highest score to highlight Best Overall
    let bestScore = -1;
    let bestValueScore = -1;
    let bestOverallId = null;
    let bestValueId = null;
    
    itemsData.forEach(item => {
      if (item.score.total > bestScore) {
        bestScore = item.score.total;
        bestOverallId = item.id;
      }
      if (item.score.breakdown.value > bestValueScore) {
        bestValueScore = item.score.breakdown.value;
        bestValueId = item.id;
      }
    });

    let html = `<tr class="matrix-header-row"><th class="matrix-first-col">Features</th>`;
    
    // Header Row with images and remove buttons
    itemsData.forEach(item => {
      let highlights = '';
      if (item.id === bestOverallId) highlights += `<div class="highlight-value mb-2">Best Overall</div>`;
      if (item.id === bestValueId && item.id !== bestOverallId) highlights += `<div class="highlight-value mb-2">Best Value</div>`;
      
      html += `
        <th style="min-width:200px; text-align:center;">
          <div style="position:relative; margin-bottom:8px;">
            <img src="${item.image}" alt="${item.name}" style="width:100px; height:100px; object-fit:cover; margin:0 auto; border-radius:4px;">
            <button class="remove-item" data-id="${item.id}" aria-label="Remove ${item.name}" style="position:absolute; top:-8px; right:calc(50% - 58px); background:var(--color-bg-light); border:1px solid var(--color-border); border-radius:50%; width:24px; height:24px; cursor:pointer;"><i class="ph ph-x"></i></button>
          </div>
          ${highlights}
          <div style="font-family:var(--font-heading); font-size:1.125rem;">${item.name}</div>
          <div style="font-size:0.75rem; color:var(--color-text-light); margin-bottom:8px;">${item.brand}</div>
          <!-- AFFILIATE_LINK -->
          <a href="https://merchant.example/item?utm_source=heirloom-review&utm_medium=affiliate&utm_campaign=compare&utm_content=${item.id}"
             rel="sponsored noopener" target="_blank"
             data-affiliate="true" data-product-id="${item.id}" data-merchant="DemoMerchant" data-placement="matrix"
             class="btn btn-primary" style="padding: 4px 12px; font-size:0.75rem; width:100%;">Check Price</a>
        </th>
      `;
    });
    html += `</tr>`;

    // Grouping tracking
    let currentGroup = '';

    rows.forEach(row => {
      // Extract values
      const vals = itemsData.map(item => {
        if (row.key === '_price') return `$${item.price.toLocaleString()}`;
        if (row.key === '_score') return `${item.score.total}/10`;
        return item.specs[row.key] || 'N/A';
      });

      // Check if all values are the same
      const allSame = vals.every(v => v === vals[0]);
      
      if (showDiff && allSame && itemsData.length > 1) {
        return; // Skip rendering row
      }

      // Group Header
      if (row.group !== currentGroup) {
        currentGroup = row.group;
        html += `<tr><td colspan="${itemsData.length + 1}" style="background:var(--color-bg-offset); font-weight:700; font-size:0.875rem; text-transform:uppercase; padding:4px 12px;">${currentGroup}</td></tr>`;
      }

      // Row Data
      html += `<tr>`;
      html += `<td class="matrix-first-col">${row.label}</td>`;
      vals.forEach(val => {
        html += `<td>${val}</td>`;
      });
      html += `</tr>`;
    });

    table.innerHTML = html;

    // Bind remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        itemsData = itemsData.filter(x => x.id !== id);
        try {
          sessionStorage.setItem(`compare_${currentCategory}`, JSON.stringify(itemsData.map(x => x.id)));
        } catch(err) {}
        renderMatrix();
      });
    });
  }

  tabWatches.addEventListener('click', () => {
    currentCategory = 'watches';
    window.history.replaceState({}, '', '?tab=watches');
    renderMatrix();
  });

  tabJewelry.addEventListener('click', () => {
    currentCategory = 'jewelry';
    window.history.replaceState({}, '', '?tab=jewelry');
    renderMatrix();
  });

  toggleDiff.addEventListener('change', renderMatrix);

  renderMatrix();
});
