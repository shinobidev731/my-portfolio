/**
 * Ikeoluwa Makinwa Portfolio - Interactive Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initClipboardCopy();
    initReferralFeature();
    initReviewForm();
    initSmoothScroll();
    initMobileNav();
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
        tempTextArea.className = 'offscreen-hidden';
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
   4. CLIENT REVIEWS & PERSISTENT STORAGE
   (Node.js REST API + LocalStorage fallback)
   ============================================== */

const STORAGE_KEY = 'portfolio_reviews_data';
const AUTHOR_TOKEN_KEY = 'portfolio_author_token';

// Retrieve or generate unique author token for this client
function getAuthorToken() {
    let token = localStorage.getItem(AUTHOR_TOKEN_KEY);
    if (!token) {
        token = 'auth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem(AUTHOR_TOKEN_KEY, token);
    }
    return token;
}

function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewerName = document.getElementById('reviewerName');
    const reviewerText = document.getElementById('reviewerText');
    const reviewsGrid = document.getElementById('reviewsGrid');
    const formNotice = document.getElementById('formNotice');

    // Edit modal elements
    const editModal = document.getElementById('editReviewModal');
    const editForm = document.getElementById('editReviewForm');
    const editIdInput = document.getElementById('editReviewId');
    const editNameInput = document.getElementById('editReviewName');
    const editTextInput = document.getElementById('editReviewText');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (!reviewsGrid) return;

    let noticeTimeout = null;

    function showNotice(message) {
        if (!formNotice) return;
        formNotice.textContent = message;
        formNotice.classList.add('show');

        if (noticeTimeout) clearTimeout(noticeTimeout);
        noticeTimeout = setTimeout(() => {
            formNotice.classList.remove('show');
        }, 4500);
    }

    // Local storage helpers (fallback & sync)
    function getLocalReviews() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to parse local reviews:', e);
            return [];
        }
    }

    function saveLocalReviews(reviews) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        } catch (e) {
            console.error('Failed to save local reviews:', e);
        }
    }

    // Render review cards or empty state
    function renderReviewsList(reviews) {
        reviewsGrid.innerHTML = '';

        if (!reviews || reviews.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'no-reviews-msg';
            emptyMsg.textContent = 'No reviews yet';
            reviewsGrid.appendChild(emptyMsg);
            return;
        }

        const currentAuthorToken = getAuthorToken();

        reviews.forEach((review) => {
            const isAuthor = review.authorToken === currentAuthorToken;

            const card = document.createElement('div');
            card.className = 'review-card';
            card.dataset.id = review.id;

            // Review header (name + author badge)
            const header = document.createElement('div');
            header.className = 'review-header';

            const h3 = document.createElement('h3');
            h3.className = 'reviewer-name';
            h3.textContent = review.name;
            header.appendChild(h3);

            if (isAuthor) {
                const authorBadge = document.createElement('span');
                authorBadge.className = 'author-pill';
                authorBadge.textContent = 'You';
                header.appendChild(authorBadge);
            }

            // Review text
            const p = document.createElement('p');
            p.className = 'review-text';
            p.textContent = review.text;

            card.appendChild(header);
            card.appendChild(p);

            // Author-only actions (Edit & Delete)
            if (isAuthor) {
                const actions = document.createElement('div');
                actions.className = 'review-actions';

                const editBtn = document.createElement('button');
                editBtn.type = 'button';
                editBtn.className = 'review-action-btn';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', () => openEditModal(review));

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'review-action-btn delete-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => handleDeleteReview(review.id));

                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                card.appendChild(actions);
            }

            reviewsGrid.appendChild(card);
        });
    }

    // Fetch reviews from server API (with local storage fallback)
    async function loadReviews() {
        try {
            const res = await fetch('/api/reviews');
            if (res.ok) {
                const data = await res.json();
                const serverReviews = data.reviews || [];
                saveLocalReviews(serverReviews);
                renderReviewsList(serverReviews);
                return;
            }
        } catch (err) {
            console.log('Server not reachable, reading from local storage:', err);
        }

        // Fallback to local storage if API is not running or network error
        const localReviews = getLocalReviews();
        renderReviewsList(localReviews);
    }

    // Handle new review submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = reviewerName.value.trim();
            const text = reviewerText.value.trim();

            if (!name || !text) return;

            const authorToken = getAuthorToken();

            try {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, text, authorToken })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.authorToken) {
                        localStorage.setItem(AUTHOR_TOKEN_KEY, data.authorToken);
                    }
                    reviewForm.reset();
                    showNotice('Thank you for the review!');
                    await loadReviews();
                    return;
                }
            } catch (err) {
                console.log('Server unreachable on submit, using local fallback:', err);
            }

            // Local fallback
            const newReview = {
                id: 'rev_' + Date.now(),
                name: name,
                text: text,
                authorToken: authorToken,
                createdAt: Date.now()
            };

            const localReviews = getLocalReviews();
            localReviews.unshift(newReview);
            saveLocalReviews(localReviews);
            renderReviewsList(localReviews);

            reviewForm.reset();
            showNotice('Thank you for the review!');
        });
    }

    // Modal Edit functions
    function openEditModal(review) {
        if (!editModal || !editIdInput || !editNameInput || !editTextInput) return;
        editIdInput.value = review.id;
        editNameInput.value = review.name;
        editTextInput.value = review.text;
        editModal.classList.add('show');
    }

    function closeEditModal() {
        if (editModal) editModal.classList.remove('show');
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }

    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = editIdInput.value;
            const updatedName = editNameInput.value.trim();
            const updatedText = editTextInput.value.trim();

            if (!id || !updatedName || !updatedText) return;

            const authorToken = getAuthorToken();

            try {
                const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-author-token': authorToken
                    },
                    body: JSON.stringify({ name: updatedName, text: updatedText })
                });

                if (res.ok) {
                    closeEditModal();
                    showNotice('Your review has been updated successfully!');
                    await loadReviews();
                    return;
                } else {
                    const errData = await res.json().catch(() => ({}));
                    alert(errData.error || 'Unable to update review.');
                    return;
                }
            } catch (err) {
                console.log('Server unreachable on update, fallback to local storage:', err);
            }

            // Local fallback
            const localReviews = getLocalReviews();
            const index = localReviews.findIndex((r) => r.id === id && r.authorToken === authorToken);

            if (index !== -1) {
                localReviews[index].name = updatedName;
                localReviews[index].text = updatedText;
                localReviews[index].updatedAt = Date.now();
                saveLocalReviews(localReviews);

                renderReviewsList(localReviews);
                closeEditModal();
                showNotice('Your review has been updated successfully!');
            }
        });
    }

    // Delete review function
    async function handleDeleteReview(id) {
        if (!confirm('Are you sure you want to delete your review? This cannot be undone.')) {
            return;
        }

        const authorToken = getAuthorToken();

        try {
            const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: {
                    'x-author-token': authorToken
                }
            });

            if (res.ok) {
                showNotice('Your review has been deleted.');
                await loadReviews();
                return;
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.error || 'Unable to delete review.');
                return;
            }
        } catch (err) {
            console.log('Server unreachable on delete, fallback to local storage:', err);
        }

        // Local fallback
        const localReviews = getLocalReviews();
        const filtered = localReviews.filter((r) => !(r.id === id && r.authorToken === authorToken));
        saveLocalReviews(filtered);

        renderReviewsList(filtered);
        showNotice('Your review has been deleted.');
    }

    // Load initial reviews
    loadReviews();
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
            cvNotice.className = 'form-notice toast-notice show';
            cvNotice.textContent = 'Preparing Curriculum Vitae for download...';
            document.body.appendChild(cvNotice);

            setTimeout(() => {
                cvNotice.remove();
            }, 3000);
        });
    }
}

/* ==============================================
   6. MOBILE NAVIGATION (HAMBURGER MENU)
   ============================================== */
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    if (!hamburgerBtn || !navLinks) return;

    // Toggle the nav-open class on button click
    hamburgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('nav-open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close the menu when a nav link is clicked (smooth UX on mobile)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close the menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('nav-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });
}
