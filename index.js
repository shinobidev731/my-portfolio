/**
 * Ikeoluwa Makinwa Portfolio - Interactive Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initClipboardCopy();
    initReferralFeature();
    initReviewForm();
    initSmoothScroll();
});

/* ==============================================
   1. GRAPHICS DESIGNS 3D CAROUSEL
   ============================================== */
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || slides.length === 0) return;

    let currentIndex = 1; // Default active center card (Logo Design for GOD'S OWN CRECHE)

    function updateCarousel() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentIndex) {
                slide.classList.add('active');
            }
        });

        // Calculate offset to center the active slide
        const trackContainer = track.parentElement;
        const containerWidth = trackContainer.offsetWidth;
        const activeSlide = slides[currentIndex];
        
        if (activeSlide) {
            const slideLeft = activeSlide.offsetLeft;
            const slideWidth = activeSlide.offsetWidth;
            const targetOffset = (containerWidth / 2) - (slideLeft + (slideWidth / 2));
            
            track.style.transform = `translateX(${targetOffset}px)`;
        }
    }

    // Prev Button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        });
    }

    // Next Button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        });
    }

    // Clicking directly on a side slide activates it
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (currentIndex !== index) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    // Handle Window Resize
    window.addEventListener('resize', updateCarousel);

    // Initial positioning
    setTimeout(updateCarousel, 100);
}

/* ==============================================
   2. COPY TO CLIPBOARD INTERACTION
   ============================================== */
function initClipboardCopy() {
    const copyBtn = document.getElementById('copyBtn');
    const captionText = document.getElementById('captionText');

    if (!copyBtn || !captionText) return;

    copyBtn.addEventListener('click', async () => {
        const textToCopy = captionText.innerText.trim();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // Fallback for older browsers or file:// context
                fallbackCopy(textToCopy);
            }

            // Visual feedback matching design ("Copied!")
            const originalText = copyBtn.innerText;
            copyBtn.innerText = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.classList.remove('copied');
            }, 2500);

        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });

    function fallbackCopy(text) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        tempTextArea.style.position = 'fixed';
        tempTextArea.style.top = '-9999px';
        document.body.appendChild(tempTextArea);
        tempTextArea.focus();
        tempTextArea.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(tempTextArea);
        }
    }
}

/* ==============================================
   3. REFERRAL FLYER FEEDBACK ("Thanks for the referral")
   ============================================== */
function initReferralFeature() {
    const downloadFlyerBtn = document.getElementById('downloadFlyerBtn');
    const flyerCard = document.getElementById('flyerCard');
    const referralOverlay = document.getElementById('referralOverlay');

    if (!referralOverlay) return;

    let overlayTimeout = null;

    function triggerReferralNotice() {
        referralOverlay.classList.add('show');

        // Trigger flyer download simulation
        downloadMockFlyer();

        if (overlayTimeout) clearTimeout(overlayTimeout);

        overlayTimeout = setTimeout(() => {
            referralOverlay.classList.remove('show');
        }, 3200);
    }

    if (downloadFlyerBtn) {
        downloadFlyerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerReferralNotice();
        });
    }

    if (flyerCard) {
        flyerCard.addEventListener('click', () => {
            triggerReferralNotice();
        });
    }

    function downloadMockFlyer() {
        // Generate and download a simple branded flyer SVG
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
                <rect width="100%" height="100%" fill="#4f1e0c"/>
                <circle cx="400" cy="300" r="140" fill="#361508" stroke="#ede8d1" stroke-width="6"/>
                <text x="400" y="325" fill="#ede8d1" font-size="70" font-family="sans-serif" font-weight="bold" text-anchor="middle">IM</text>
                <text x="400" y="520" fill="#ede8d1" font-size="42" font-family="sans-serif" font-weight="bold" text-anchor="middle">IKEOLUWA MAKINWA</text>
                <text x="400" y="580" fill="#d1ceb6" font-size="26" font-family="sans-serif" text-anchor="middle">Graphic Design &bull; Photography &bull; Frontend Development</text>
                <text x="400" y="640" fill="#d1ceb6" font-size="22" font-family="sans-serif" text-anchor="middle">WhatsApp: +234 810 658 2764</text>
            </svg>
        `.trim();

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Ikeoluwa_Makinwa_Promo_Flyer.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

/* ==============================================
   4. CLIENT REVIEWS FORM SUBMISSION
   ============================================== */
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewerName = document.getElementById('reviewerName');
    const reviewerText = document.getElementById('reviewerText');
    const reviewsGrid = document.getElementById('reviewsGrid');
    const formNotice = document.getElementById('formNotice');

    if (!reviewForm || !reviewsGrid) return;

    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = reviewerName.value.trim();
        const review = reviewerText.value.trim();

        if (!name || !review) return;

        // Create new review card
        const card = document.createElement('div');
        card.className = 'review-card';
        card.style.animation = 'fadeIn 0.5s ease';

        const h3 = document.createElement('h3');
        h3.className = 'reviewer-name';
        h3.textContent = name;

        const p = document.createElement('p');
        p.className = 'review-text';
        p.textContent = review;

        card.appendChild(h3);
        card.appendChild(p);

        // Prepend new review card to grid
        reviewsGrid.prepend(card);

        // Feedback notice
        if (formNotice) {
            formNotice.textContent = 'Thank you! Your review has been added successfully.';
            formNotice.style.display = 'block';
            setTimeout(() => {
                formNotice.style.display = 'none';
            }, 4000);
        }

        // Reset form inputs
        reviewForm.reset();
    });
}

/* ==============================================
   5. CV DOWNLOAD & SMOOTH SCROLLING
   ============================================== */
function initSmoothScroll() {
    // CV Download button feedback
    const cvBtn = document.getElementById('cv-btn');
    if (cvBtn) {
        cvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Simulate CV download
            const cvNotice = document.createElement('div');
            cvNotice.className = 'form-notice';
            cvNotice.style.position = 'fixed';
            cvNotice.style.bottom = '30px';
            cvNotice.style.right = '30px';
            cvNotice.style.zIndex = '9999';
            cvNotice.textContent = 'Preparing Curriculum Vitae for download...';
            document.body.appendChild(cvNotice);

            setTimeout(() => {
                cvNotice.remove();
            }, 3000);
        });
    }
}
