/*
 * Heirloom Review - Diamond Guide Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const guideCut = document.getElementById('guide-cut');
  const guideColor = document.getElementById('guide-color');
  const guideClarity = document.getElementById('guide-clarity');
  
  const cutDesc = document.getElementById('cut-desc');
  const colorDesc = document.getElementById('color-desc');
  const clarityDesc = document.getElementById('clarity-desc');

  if (guideCut) {
    const cutText = {
      'excellent': 'Maximizes light return. Highly recommended.',
      'very-good': 'Slightly less brilliance, but still an excellent choice.',
      'good': 'Noticeable drop in sparkle. Usually chosen to maximize size on a budget.',
      'poor': 'Appears dull and lifeless. Not recommended.'
    };
    guideCut.addEventListener('change', (e) => {
      cutDesc.textContent = cutText[e.target.value];
    });
  }

  if (guideColor) {
    const colorText = {
      'd-f': 'Completely colorless. Premium pricing.',
      'g-j': 'Appears colorless face-up. Best value.',
      'k-m': 'Slight warm/yellow tint visible. Good for vintage settings.'
    };
    guideColor.addEventListener('change', (e) => {
      colorDesc.textContent = colorText[e.target.value];
    });
  }

  if (guideClarity) {
    const clarityText = {
      'fl-if': 'Flawless. Extremely rare and expensive.',
      'vvs': 'Very very slightly included. Flaws invisible to naked eye.',
      'vs': 'Eye-clean. Excellent balance of quality and price.',
      'si': 'Flaws might be visible upon close inspection.',
      'i': 'Visible inclusions that may affect durability.'
    };
    guideClarity.addEventListener('change', (e) => {
      clarityDesc.textContent = clarityText[e.target.value];
    });
  }

  // Budget Calculator
  const budgetInput = document.getElementById('budget-input');
  const calcBtn = document.getElementById('calc-budget');
  const budgetResult = document.getElementById('budget-result');

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const budget = parseFloat(budgetInput.value);
      if (isNaN(budget) || budget <= 0) {
        budgetResult.innerHTML = '<span style="color:var(--color-error);">Please enter a valid numeric budget.</span>';
        budgetInput.classList.add('error');
        return;
      }
      
      budgetInput.classList.remove('error');
      
      let suggestion = '';
      if (budget < 1000) {
        suggestion = '<strong>Suggestion:</strong> Focus on Cut (Excellent/Very Good) and sacrifice Carat weight. Consider lab-grown to maximize size, or an alternative gemstone like Sapphire.';
      } else if (budget < 3000) {
        suggestion = '<strong>Suggestion:</strong> You can achieve a beautiful ~0.75ct to 1ct stone. Prioritize Cut. Drop Color to H-I and Clarity to SI1 (ensure it is eye-clean) to maximize Carat weight.';
      } else if (budget < 10000) {
        suggestion = '<strong>Suggestion:</strong> Excellent budget for a premium 1ct+ stone. Go for Excellent Cut, G-H Color, and VS2 Clarity. This is the "sweet spot" for value and visual perfection.';
      } else {
        suggestion = '<strong>Suggestion:</strong> With this budget, you can prioritize Carat weight (1.5ct+) without compromising Cut. You may also explore D-F Color grades for absolute perfection.';
      }

      budgetResult.innerHTML = suggestion;
    });
  }
});
