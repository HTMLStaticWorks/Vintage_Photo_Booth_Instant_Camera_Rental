/**
 * Gallery Filter, Masonry & Lightbox JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilter();
  initLightbox();
});

function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.masonry-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter || (cat && cat.includes(filter))) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('vintageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const triggerCards = document.querySelectorAll('.scanned-photo-card, .photostrip-card');

  if (!lightbox) return;

  triggerCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Find image inside
      const img = card.querySelector('img');
      const caption = card.querySelector('.photo-meta span, .strip-date-stamp, .polaroid-caption');
      
      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) {
          lightboxCaption.textContent = caption ? caption.textContent : "ANCO • Archival Print";
        }
        lightbox.classList.add('active');
        if (window.soundEngine) window.soundEngine.playShutter();
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
    }
  });
}
