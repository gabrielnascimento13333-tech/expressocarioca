/* ============================================================
   EXPRESSO CARIOCA VÔLEI — interações da landing page
   ============================================================ */
(function () {
    'use strict';

    /* --------------------------------------------------------
       Header: sombra/padrão ao rolar
       -------------------------------------------------------- */
    var header = document.getElementById('header');

    function onScrollHeader() {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    /* --------------------------------------------------------
       Menu mobile (hambúrguer)
       -------------------------------------------------------- */
    var menuToggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('nav-menu');

    function closeMenu() {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        var isOpen = nav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';

        if (isOpen) {
            nav.querySelector('.nav-link').focus();
        }
    }

    menuToggle.addEventListener('click', toggleMenu);

    nav.querySelectorAll('.nav-link, .btn-nav').forEach(function (link) {
        link.addEventListener('click', function () {
            if (nav.classList.contains('open')) {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            closeMenu();
            menuToggle.focus();
        }
    });

    /* --------------------------------------------------------
       Animações de entrada ao rolar (reveal)
       -------------------------------------------------------- */
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* --------------------------------------------------------
       Galeria: filtro por categoria
       -------------------------------------------------------- */
    var filters = document.querySelectorAll('.gallery-filter');
    var galleryItems = document.querySelectorAll('.gallery-item');

    filters.forEach(function (filter) {
        filter.addEventListener('click', function () {
            filters.forEach(function (f) {
                f.classList.remove('active');
                f.setAttribute('aria-selected', 'false');
            });

            filter.classList.add('active');
            filter.setAttribute('aria-selected', 'true');

            var target = filter.getAttribute('data-filter');

            galleryItems.forEach(function (item) {
                var match = target === 'all' || item.getAttribute('data-category') === target;
                item.classList.toggle('is-hidden', !match);
            });

            resetLightboxIndex();
        });
    });

    /* --------------------------------------------------------
       Lightbox da galeria
       -------------------------------------------------------- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxClose = document.getElementById('lightbox-close');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');
    var currentIndex = 0;

    function getVisibleItems() {
        return Array.prototype.slice.call(galleryItems).filter(function (item) {
            return !item.classList.contains('is-hidden') && !item.querySelector('video') && !item.classList.contains('gallery-placeholder');
        });
    }

    function renderItem(index) {
        var items = getVisibleItems();
        if (!items.length) return;

        currentIndex = (index + items.length) % items.length;
        var item = items[currentIndex];
        var img = item.querySelector('img');
        var caption = item.querySelector('figcaption');

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightboxCaption.textContent = caption ? caption.textContent : '';
    }

    function openLightbox(index) {
        renderItem(index);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    function resetLightboxIndex() {
        if (lightbox.hidden) {
            currentIndex = 0;
        }
    }

    galleryItems.forEach(function (item) {
        if (item.querySelector('video') || item.classList.contains('gallery-placeholder')) return;

        item.addEventListener('click', function () {
            var items = getVisibleItems();
            openLightbox(items.indexOf(item));
        });
    });

    galleryItems.forEach(function (item) {
        var video = item.querySelector('video');
        if (!video) return;

        var playBadge = item.querySelector('.gallery-play');

        video.addEventListener('play', function () {
            if (playBadge) playBadge.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (playBadge) playBadge.classList.remove('is-playing');
        });
    });

    var galleryVideos = galleryItems.map(function (item) {
        return item.querySelector('video');
    }).filter(Boolean);

    function applyMobileVideos() {
        var isMobile = window.innerWidth <= 820;
        galleryVideos.forEach(function (video) {
            if (isMobile) {
                video.removeAttribute('autoplay');
                video.pause();
            } else {
                video.setAttribute('autoplay', '');
                video.play().catch(function () {});
            }
        });
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyMobileVideos, 250);
    });

    applyMobileVideos();

    lightboxClose.addEventListener('click', closeLightbox);

    lightboxPrev.addEventListener('click', function () {
        renderItem(currentIndex - 1);
    });

    lightboxNext.addEventListener('click', function () {
        renderItem(currentIndex + 1);
    });

    document.addEventListener('keydown', function (e) {
        if (lightbox.hidden) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                renderItem(currentIndex - 1);
                break;
            case 'ArrowRight':
                renderItem(currentIndex + 1);
                break;
        }
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
})();