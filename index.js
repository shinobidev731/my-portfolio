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
    initBackToTop();
    initScrollSpy();
    initScrollReveal();
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

    let currentIndex = 1; // Default active center card
    const trackContainer = track.parentElement;

    function updateCarousel() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentIndex) {
                slide.classList.add('active');
            }
        });

        // Calculate offset to center the active slide
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

    // Keyboard Arrow navigation (Left / Right keys)
    document.addEventListener('keydown', (e) => {
        const isModalOpen = document.querySelector('.modal-overlay.show');
        if (isModalOpen) return;
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }
    });

    // Handle Window Resize
    window.addEventListener('resize', updateCarousel);

    // Touch / Swipe support
    let touchStartX = 0;
    let touchEndX   = 0;
    const SWIPE_THRESHOLD = 50; // px minimum swipe distance

    trackContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    trackContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const delta = touchStartX - touchEndX;

        if (Math.abs(delta) >= SWIPE_THRESHOLD) {
            if (delta > 0) {
                // Swiped left → next
                currentIndex = (currentIndex + 1) % slides.length;
            } else {
                // Swiped right → prev
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            }
            updateCarousel();
        }
    }, { passive: true });

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
   3. SHARE FLYER FEATURE
   ============================================== */
function initReferralFeature() {
    const shareBtn      = document.getElementById('shareBtn');
    const sharePopover  = document.getElementById('sharePopover');
    const shareCopyLink = document.getElementById('shareCopyLink');

    if (!shareBtn) return;

    // Caption / share text
    const shareText = `🎨 Check out Ikeoluwa Makinwa's portfolio — Creative Graphic Designer & Frontend Developer.\n\n🔗 ${window.location.href}`;
    const shareUrl  = window.location.href;

    // Build platform URLs
    function buildLinks() {
        const encoded     = encodeURIComponent(shareText);
        const encodedUrl  = encodeURIComponent(shareUrl);

        const wa = document.getElementById('shareWhatsApp');
        const tw = document.getElementById('shareTwitter');
        const fb = document.getElementById('shareFacebook');
        const tg = document.getElementById('shareTelegram');
        const li = document.getElementById('shareLinkedIn');

        if (wa) wa.href = `https://wa.me/?text=${encoded}`;
        if (tw) tw.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent('🎨 Check out Ikeoluwa Makinwa\'s portfolio!')}&url=${encodedUrl}`;
        if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        if (tg) tg.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('Check out this portfolio!')}`;
        if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }
    buildLinks();

    // Copy link handler
    if (shareCopyLink) {
        shareCopyLink.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = shareUrl;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            shareCopyLink.textContent = '✅ Copied!';
            shareCopyLink.classList.add('copied');
            setTimeout(() => {
                shareCopyLink.textContent = '📋 Copy link';
                shareCopyLink.classList.remove('copied');
            }, 2500);
        });
    }

    // Main share button
    shareBtn.addEventListener('click', async () => {
        // Try Web Share API with image file (works on mobile)
        if (navigator.canShare) {
            try {
                const response = await fetch('./photos/social-media-design.png');
                const blob     = await response.blob();
                const file     = new File([blob], 'social-media-design.png', { type: blob.type });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Ikeoluwa Makinwa — Portfolio',
                        text:  shareText,
                        files: [file],
                    });
                    return;
                }
            } catch (err) {
                // File share failed — fall through to URL share or popover
            }
        }

        // Try Web Share API with just URL (most mobile browsers)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ikeoluwa Makinwa — Portfolio',
                    text:  shareText,
                    url:   shareUrl,
                });
                return;
            } catch (err) {
                // User cancelled or not supported — fall through to popover
                if (err.name === 'AbortError') return;
            }
        }

        // Desktop fallback: toggle popover
        const isOpen = sharePopover.classList.toggle('open');
        shareBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close popover on outside click
    document.addEventListener('click', (e) => {
        if (sharePopover && !shareBtn.contains(e.target) && !sharePopover.contains(e.target)) {
            sharePopover.classList.remove('open');
            shareBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ==============================================
   4. CLIENT REVIEWS  (SQLite REST API)
   ============================================== */

// API Base URL: relative when served from the backend, absolute for dev tools
function getApiUrl(endpoint) {
    // Served by our own Node server (port 3000 or standard ports)
    if (window.location.protocol === 'http:' && (window.location.port === '3000' || window.location.port === '')) {
        return endpoint;
    }
    // Live Server, VS Code, or other dev origins — point directly to backend
    const base = window.__API_BASE__ || 'http://localhost:3000';
    return base + endpoint;
}

// Fetch with configurable timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

// Persistent per-browser author token (for edit/delete ownership)
function getAuthorToken() {
    let token = localStorage.getItem(AUTHOR_TOKEN_KEY);
    if (!token) {
        token = 'auth_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(AUTHOR_TOKEN_KEY, token);
    }
    return token;
}

function initReviewForm() {
    const reviewForm    = document.getElementById('reviewForm');
    const reviewerName  = document.getElementById('reviewerName');
    const reviewerText  = document.getElementById('reviewerText');
    const reviewsGrid   = document.getElementById('reviewsGrid');
    const formNotice    = document.getElementById('formNotice');

    // Edit modal
    const editModal     = document.getElementById('editReviewModal');
    const editForm      = document.getElementById('editReviewForm');
    const editIdInput   = document.getElementById('editReviewId');
    const editNameInput = document.getElementById('editReviewName');
    const editTextInput = document.getElementById('editReviewText');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // Delete modal
    const deleteModal      = document.getElementById('deleteReviewModal');
    const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let pendingDeleteId    = null;

    if (!reviewsGrid) return;

    // ── Notification toast ──────────────────────────────────────
    let noticeTimer = null;
    function showNotice(msg, isError = false) {
        if (!formNotice) return;
        formNotice.textContent = msg;
        formNotice.classList.toggle('error-notice', isError);
        formNotice.classList.add('show');
        if (noticeTimer) clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => formNotice.classList.remove('show'), 4500);
    }

    // ── In-memory cache of displayed reviews ────────────────────
    let cachedReviews = [];

    // ── Render helpers ───────────────────────────────────────────
    function renderReviews(reviews) {
        cachedReviews = reviews;
        reviewsGrid.innerHTML = '';

        if (!reviews.length) {
            const msg = document.createElement('div');
            msg.className = 'no-reviews-msg';
            msg.textContent = 'No reviews yet — be the first!';
            reviewsGrid.appendChild(msg);
            return;
        }

        const myToken = getAuthorToken();
        reviews.forEach(review => {
            const isAuthor = review.authorToken === myToken;

            const card = document.createElement('div');
            card.className = 'review-card';
            card.dataset.id = review.id;

            const header = document.createElement('div');
            header.className = 'review-header';

            const h3 = document.createElement('h3');
            h3.className = 'reviewer-name';
            h3.textContent = review.name;
            header.appendChild(h3);

            if (isAuthor) {
                const badge = document.createElement('span');
                badge.className = 'author-pill';
                badge.textContent = 'You';
                header.appendChild(badge);
            }

            const p = document.createElement('p');
            p.className = 'review-text';
            p.textContent = review.text;

            card.appendChild(header);
            card.appendChild(p);

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
                deleteBtn.addEventListener('click', () => openDeleteModal(review.id));

                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                card.appendChild(actions);
            }

            reviewsGrid.appendChild(card);
        });
    }

    // ── Load from server ─────────────────────────────────────────
    async function loadReviews() {
        // Show skeleton while loading
        reviewsGrid.innerHTML = '<div class="no-reviews-msg">Loading reviews…</div>';
        try {
            const res = await fetchWithTimeout(getApiUrl('/api/reviews'), {}, 6000);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            renderReviews(Array.isArray(data.reviews) ? data.reviews : []);
        } catch (err) {
            console.error('Failed to load reviews:', err);
            reviewsGrid.innerHTML = '';
            const errMsg = document.createElement('div');
            errMsg.className = 'no-reviews-msg';
            errMsg.textContent = 'Could not load reviews. Make sure the server is running.';
            reviewsGrid.appendChild(errMsg);
        }
    }

    // ── Submit new review ────────────────────────────────────────
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = reviewerName.value.trim();
            const text = reviewerText.value.trim();
            if (!name || !text) return;

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Posting…'; }

            const authorToken = getAuthorToken();
            const newReview = {
                id:          'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                name,
                text,
                authorToken,
                createdAt:   Date.now(),
            };

            // Optimistic prepend to UI
            renderReviews([newReview, ...cachedReviews]);
            reviewForm.reset();
            showNotice('Thank you for your review!');

            try {
                const res = await fetchWithTimeout(getApiUrl('/api/reviews'), {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'x-author-token': authorToken },
                    body:    JSON.stringify(newReview),
                }, 6000);

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || `HTTP ${res.status}`);
                }
                // Refresh to get server-assigned values
                loadReviews();
            } catch (err) {
                console.error('Submit failed:', err);
                showNotice('Failed to save review — please try again.', true);
                // Revert optimistic update
                renderReviews(cachedReviews.filter(r => r.id !== newReview.id));
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
            }
        });
    }

    // ── Edit modal ───────────────────────────────────────────────
    function openEditModal(review) {
        if (!editModal) return;
        editIdInput.value   = review.id;
        editNameInput.value = review.name;
        editTextInput.value = review.text;
        editModal.classList.add('show');
    }

    function closeEditModal() {
        if (editModal) editModal.classList.remove('show');
    }

    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (editModal)     editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id          = editIdInput.value;
            const updatedName = editNameInput.value.trim();
            const updatedText = editTextInput.value.trim();
            if (!id || !updatedName || !updatedText) return;

            const authorToken = getAuthorToken();

            // Optimistic update
            const updated = cachedReviews.map(r =>
                r.id === id ? { ...r, name: updatedName, text: updatedText } : r
            );
            renderReviews(updated);
            closeEditModal();
            showNotice('Review updated!');

            try {
                const res = await fetchWithTimeout(
                    getApiUrl(`/api/reviews/${encodeURIComponent(id)}`), {
                        method:  'PUT',
                        headers: { 'Content-Type': 'application/json', 'x-author-token': authorToken },
                        body:    JSON.stringify({ name: updatedName, text: updatedText }),
                    }, 6000
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            } catch (err) {
                console.error('Edit failed:', err);
                showNotice('Update failed — please try again.', true);
                loadReviews(); // Re-sync with server truth
            }
        });
    }

    // ── Delete modal ─────────────────────────────────────────────
    function openDeleteModal(id) {
        pendingDeleteId = id;
        if (deleteModal) deleteModal.classList.add('show');
    }

    function closeDeleteModal() {
        pendingDeleteId = null;
        if (deleteModal) deleteModal.classList.remove('show');
    }

    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (deleteModal)     deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!pendingDeleteId) return;
            const id = pendingDeleteId;
            closeDeleteModal();

            const authorToken = getAuthorToken();

            // Optimistic remove
            renderReviews(cachedReviews.filter(r => r.id !== id));
            showNotice('Review deleted.');

            try {
                const res = await fetchWithTimeout(
                    getApiUrl(`/api/reviews/${encodeURIComponent(id)}`), {
                        method:  'DELETE',
                        headers: { 'x-author-token': authorToken },
                    }, 6000
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            } catch (err) {
                console.error('Delete failed:', err);
                showNotice('Delete failed — please try again.', true);
                loadReviews(); // Re-sync
            }
        });
    }

    // Escape closes both modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeEditModal(); closeDeleteModal(); }
    });

    loadReviews();
}

/* ==============================================
   5. CV DOWNLOAD & SMOOTH SCROLLING
   ============================================== */
function initSmoothScroll() {
    const cvBtn = document.getElementById('cv-btn');
    if (cvBtn) {
        cvBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Trigger real PDF download
            const link = document.createElement('a');
            link.href = './Ikeoluwa_Ayanfe_Makinwa_Resume.pdf';
            link.download = 'Ikeoluwa_Ayanfe_Makinwa_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Visual feedback for user & hiring officers
            const originalText = cvBtn.innerHTML;
            cvBtn.innerHTML = '&#10003; Resume Downloaded!';
            cvBtn.style.backgroundColor = '#22c55e';
            cvBtn.style.color = '#ffffff';

            setTimeout(() => {
                cvBtn.innerHTML = originalText;
                cvBtn.style.backgroundColor = '';
                cvBtn.style.color = '';
            }, 2500);
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

/* ==============================================
   7. BACK TO TOP BUTTON
   ============================================== */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 350) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ==============================================
   8. ACTIVE NAVIGATION SCROLLSPY
   ============================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-bar li a');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    } else if (link.getAttribute('href').startsWith('#')) {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }, { rootMargin: '-25% 0px -55% 0px' });

    sections.forEach(sec => observer.observe(sec));
}

/* ==============================================
   9. SCROLL REVEAL ANIMATIONS
   ============================================== */
function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const revealElements = document.querySelectorAll('.skill-card-link, .review-card, .intro-content, .portrait-frame, .share-patch');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.classList.add('reveal-init');
        observer.observe(el);
    });
}

