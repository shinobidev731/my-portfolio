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
   4. CLIENT REVIEWS & PERSISTENT STORAGE
   (Node.js REST API + LocalStorage fallback)
   ============================================== */

const STORAGE_KEY = 'portfolio_reviews_data';
const AUTHOR_TOKEN_KEY = 'portfolio_author_token';

// API Base URL helper (supports localhost:3000, Live Server, and relative)
function getApiUrl(endpoint) {
    if (window.location.protocol === 'http:' && (window.location.port === '3000' || window.location.port === '')) {
        return endpoint;
    }
    return 'http://localhost:3000' + endpoint;
}

// Resilient fetch with fast timeout to avoid UI blocking
async function fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return res;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

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

    // Delete modal elements
    const deleteModal = document.getElementById('deleteReviewModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let pendingDeleteReviewId = null;

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
            // Author check: matches token, or review has no authorToken but was created on this client
            const isAuthor = review.authorToken === currentAuthorToken || (!review.authorToken && String(review.id).startsWith('rev_'));

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
                deleteBtn.addEventListener('click', () => openDeleteModal(review.id));

                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                card.appendChild(actions);
            }

            reviewsGrid.appendChild(card);
        });
    }

    // Fetch reviews from server API (with bidirectional auto-sync and local storage fallback)
    async function loadReviews() {
        // 1. Instantly display local reviews for 0ms initial render
        const initialLocal = getLocalReviews();
        renderReviewsList(initialLocal);

        // 2. Fetch fresh reviews from server API (with fast timeout)
        try {
            const res = await fetchWithTimeout(getApiUrl('/api/reviews'), {}, 2000);
            if (res.ok) {
                const data = await res.json();
                const serverReviews = Array.isArray(data.reviews) ? data.reviews : [];

                // 3. Auto-sync unsynced local reviews to server database
                const currentLocal = getLocalReviews();
                const currentAuthorToken = getAuthorToken();

                for (const localRev of currentLocal) {
                    const existsOnServer = serverReviews.some(sr => sr.id === localRev.id);
                    if (!existsOnServer && localRev.name && localRev.text) {
                        // Push unsynced review to server in background
                        fetchWithTimeout(getApiUrl('/api/reviews'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-author-token': localRev.authorToken || currentAuthorToken
                            },
                            body: JSON.stringify({
                                id: localRev.id,
                                name: localRev.name,
                                text: localRev.text,
                                authorToken: localRev.authorToken || currentAuthorToken,
                                createdAt: localRev.createdAt || Date.now()
                            })
                        }, 2000).catch(err => console.warn('Background sync item error:', err));
                    }
                }

                // 4. Merge server & local reviews (deduplicated by id, sorted newest first)
                const map = new Map();
                serverReviews.forEach(r => map.set(r.id, r));
                currentLocal.forEach(r => {
                    if (!map.has(r.id)) map.set(r.id, r);
                });
                const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

                saveLocalReviews(merged);
                renderReviewsList(merged);
                return;
            }
        } catch (err) {
            console.log('Server not reachable or timed out, keeping local cache:', err);
        }

        // Fallback: local reviews are already rendered
    }

    // Handle new review submission (Instant Optimistic UI + Background Sync)
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = reviewerName.value.trim();
            const text = reviewerText.value.trim();

            if (!name || !text) return;

            const authorToken = getAuthorToken();
            const reviewId = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
            const newReview = {
                id: reviewId,
                name: name,
                text: text,
                authorToken: authorToken,
                createdAt: Date.now()
            };

            // 1. Optimistic instant UI update (<10ms)
            const localReviews = getLocalReviews();
            localReviews.unshift(newReview);
            saveLocalReviews(localReviews);
            renderReviewsList(localReviews);

            reviewForm.reset();
            showNotice('Thank you for the review!');

            // 2. Background async sync to server without blocking UI
            fetchWithTimeout(getApiUrl('/api/reviews'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-author-token': authorToken
                },
                body: JSON.stringify(newReview)
            }, 3000).then(async (res) => {
                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    if (data.authorToken && data.authorToken !== authorToken) {
                        localStorage.setItem(AUTHOR_TOKEN_KEY, data.authorToken);
                    }
                }
            }).catch((err) => {
                console.warn('Review stored locally; server sync deferred:', err);
            });
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

            // 1. Optimistic instant UI update
            const localReviews = getLocalReviews();
            const index = localReviews.findIndex((r) => r.id === id);

            if (index !== -1) {
                localReviews[index].name = updatedName;
                localReviews[index].text = updatedText;
                localReviews[index].updatedAt = Date.now();
                saveLocalReviews(localReviews);
                renderReviewsList(localReviews);
            }

            closeEditModal();
            showNotice('Your review has been updated successfully!');

            // 2. Background server update
            fetchWithTimeout(getApiUrl(`/api/reviews/${encodeURIComponent(id)}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-author-token': authorToken
                },
                body: JSON.stringify({ name: updatedName, text: updatedText })
            }, 3000).catch((err) => {
                console.warn('Server edit request error:', err);
            });
        });
    }

    // Delete Modal Functions (In-Page Popup instead of window.confirm/alert)
    function openDeleteModal(id) {
        pendingDeleteReviewId = id;
        if (deleteModal) {
            deleteModal.classList.add('show');
        }
    }

    function closeDeleteModal() {
        pendingDeleteReviewId = null;
        if (deleteModal) {
            deleteModal.classList.remove('show');
        }
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (pendingDeleteReviewId) {
                const id = pendingDeleteReviewId;
                closeDeleteModal();
                executeDeleteReview(id);
            }
        });
    }

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
        }
    });

    // Execute Delete review (Instant Optimistic UI + Background Server Sync)
    async function executeDeleteReview(id) {
        const authorToken = getAuthorToken();

        // 1. Optimistic instant UI update
        const localReviews = getLocalReviews();
        const filtered = localReviews.filter((r) => r.id !== id);
        saveLocalReviews(filtered);
        renderReviewsList(filtered);
        showNotice('Your review has been deleted.');

        // 2. Background server deletion
        fetchWithTimeout(getApiUrl(`/api/reviews/${encodeURIComponent(id)}`), {
            method: 'DELETE',
            headers: {
                'x-author-token': authorToken
            }
        }, 3000).catch((err) => {
            console.warn('Server delete request error:', err);
        });
    }

    // Load initial reviews
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

