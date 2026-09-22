/**
 * Instant Camera Rental & Polaroid Simulator JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initPolaroidSimulator();
  initBundleCalculator();
});

// Polaroid Canvas Simulator
function initPolaroidSimulator() {
  const shutterBtn = document.getElementById('polaroidSnapBtn');
  const filmFrame = document.getElementById('simulatedPolaroid');
  const captionInput = document.getElementById('polaroidCaptionInput');
  const captionDisplay = document.getElementById('polaroidCaptionText');
  const photoOptions = document.querySelectorAll('.sample-snap-thumb');
  const customUpload = document.getElementById('polaroidUploadInput');
  const polaroidImg = document.getElementById('polaroidImageTarget');
  const statusMsg = document.getElementById('polaroidDevStatus');

  const sampleImages = [
    "images/vintage_photostrip_sample_1789972823467.jpg",
    "IMAGW/pexels-doouglasma-16403732.jpg",
    "IMAGW/pexels-eusouomatteus-32405337.jpg",
    "IMAGW/pexels-airamdphoto-11627196.jpg",
    "IMAGW/pexels-brahollari-35521114.jpg"
  ];

  let currentImgIndex = 0;

  if (photoOptions.length) {
    photoOptions.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        photoOptions.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (polaroidImg) {
          polaroidImg.src = thumb.getAttribute('data-src') || sampleImages[idx % sampleImages.length];
        }
      });
    });
  }

  if (customUpload) {
    customUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && polaroidImg) {
        const reader = new FileReader();
        reader.onload = (event) => {
          polaroidImg.src = event.target.result;
          triggerDevelopment();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (captionInput && captionDisplay) {
    captionInput.addEventListener('input', (e) => {
      captionDisplay.textContent = e.target.value || "First dance • 10.24.26";
    });
  }

  if (shutterBtn) {
    shutterBtn.addEventListener('click', () => {
      currentImgIndex = (currentImgIndex + 1) % sampleImages.length;
      if (polaroidImg) {
        polaroidImg.src = sampleImages[currentImgIndex];
      }
      triggerDevelopment();
    });
  }

  function triggerDevelopment() {
    if (window.soundEngine) {
      window.soundEngine.playShutter();
    }

    if (filmFrame && polaroidImg) {
      filmFrame.classList.remove('developing-film');
      void filmFrame.offsetWidth; // trigger reflow
      filmFrame.classList.add('developing-film');

      if (statusMsg) {
        statusMsg.innerHTML = `<span class="text-peach"><i data-lucide="loader" style="width:14px; height:14px; animation: spin 2s linear infinite;"></i> Developing chemical emulsion...</span>`;
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
          statusMsg.innerHTML = `<span class="text-brass"><i data-lucide="check-circle" style="width:14px; height:14px;"></i> Fully Developed! Ready to keep.</span>`;
          if (window.lucide) window.lucide.createIcons();
        }, 4500);
      }
    }
  }
}

// Bundle Calculator for Instant Cameras
function initBundleCalculator() {
  const cameraCountInput = document.getElementById('calcCameras');
  const filmPacksInput = document.getElementById('calcFilm');
  const guestbookCheck = document.getElementById('calcGuestbook');
  const markersCheck = document.getElementById('calcMarkers');
  const attendantCheck = document.getElementById('calcAttendant');
  const totalDisplay = document.getElementById('bundleTotal');
  const cameraValueDisplay = document.getElementById('calcCamerasValue');
  const filmValueDisplay = document.getElementById('calcFilmValue');

  function calculateTotal() {
    if (!totalDisplay) return;

    const cameras = parseInt(cameraCountInput?.value || 3, 10);
    const filmPacks = parseInt(filmPacksInput?.value || 5, 10); // each pack = 20 shots
    const hasGuestbook = guestbookCheck?.checked || false;
    const hasMarkers = markersCheck?.checked || false;
    const hasAttendant = attendantCheck?.checked || false;

    if (cameraValueDisplay) cameraValueDisplay.textContent = `${cameras} Cameras`;
    if (filmValueDisplay) filmValueDisplay.textContent = `${filmPacks * 20} Prints (${filmPacks} Packs)`;

    let price = 0;
    price += cameras * 45; // $45 per camera rental
    price += filmPacks * 28; // $28 per film cartridge pack (20 shots)
    if (hasGuestbook) price += 65; // Leather keepsake album
    if (hasMarkers) price += 25; // Archival metallic markers & tape kit
    if (hasAttendant) price += 150; // 3-hr dedicated camera concierge

    totalDisplay.textContent = `$${price}`;
  }

  [cameraCountInput, filmPacksInput, guestbookCheck, markersCheck, attendantCheck].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateTotal);
      el.addEventListener('change', calculateTotal);
    }
  });

  calculateTotal();
}
