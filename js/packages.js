/**
 * Packages & Quote Estimator JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initPackageEstimator();
});

function initPackageEstimator() {
  const basePackageSelect = document.getElementById('calcBasePackage');
  const extraHoursSelect = document.getElementById('calcExtraHours');
  const addBackdropCustom = document.getElementById('addonBackdrop');
  const addGuestAlbum = document.getElementById('addonGuestAlbum');
  const addMagnets = document.getElementById('addonMagnets');
  const addAudioGuestbook = document.getElementById('addonAudioGuestbook');
  const addRoamingPolaroid = document.getElementById('addonRoamingPolaroid');

  const basePriceDisplay = document.getElementById('quoteBasePrice');
  const addonsPriceDisplay = document.getElementById('quoteAddonsPrice');
  const totalPriceDisplay = document.getElementById('quoteTotalPrice');
  const depositPriceDisplay = document.getElementById('quoteDepositPrice');

  function calculateQuote() {
    if (!totalPriceDisplay) return;

    let basePrice = parseInt(basePackageSelect?.value || 1450, 10);
    let extraHours = parseInt(extraHoursSelect?.value || 0, 10) * 175;
    
    let addonsTotal = extraHours;
    if (addBackdropCustom?.checked) addonsTotal += 180;
    if (addGuestAlbum?.checked) addonsTotal += 120;
    if (addMagnets?.checked) addonsTotal += 95;
    if (addAudioGuestbook?.checked) addonsTotal += 250;
    if (addRoamingPolaroid?.checked) addonsTotal += 350;

    const grandTotal = basePrice + addonsTotal;
    const deposit = Math.round(grandTotal * 0.3); // 30% deposit

    if (basePriceDisplay) basePriceDisplay.textContent = `$${basePrice}`;
    if (addonsPriceDisplay) addonsPriceDisplay.textContent = `$${addonsTotal}`;
    if (totalPriceDisplay) totalPriceDisplay.textContent = `$${grandTotal}`;
    if (depositPriceDisplay) depositPriceDisplay.textContent = `$${deposit}`;
  }

  const inputs = [
    basePackageSelect, extraHoursSelect, addBackdropCustom,
    addGuestAlbum, addMagnets, addAudioGuestbook, addRoamingPolaroid
  ];

  inputs.forEach(input => {
    if (input) {
      input.addEventListener('change', calculateQuote);
      input.addEventListener('input', calculateQuote);
    }
  });

  calculateQuote();
}
