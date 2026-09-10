(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var header = document.getElementById("header");

        function onScroll() {
            header.classList.toggle("is-scrolled", window.scrollY > 30);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        /* --------------------------------------------------------
           Menu mobile
           -------------------------------------------------------- */
        var menuToggle = document.getElementById("menu-toggle");
        var nav = document.getElementById("nav-menu");

        function closeMenu() {
            nav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");
            document.body.style.overflow = "";
        }

        function toggleMenu() {
            var isOpen = nav.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            document.body.style.overflow = isOpen ? "hidden" : "";

            if (isOpen) {
                var firstLink = nav.querySelector(".nav-link, .btn-nav");
                if (firstLink) firstLink.focus();
            }
        }

        menuToggle.addEventListener("click", toggleMenu);

        nav.querySelectorAll(".nav-link, .btn-nav").forEach(function (link) {
            link.addEventListener("click", function () {
                if (nav.classList.contains("open")) closeMenu();
            });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("open")) {
                closeMenu();
                menuToggle.focus();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 820 && nav.classList.contains("open")) {
                closeMenu();
            }
        });

        /* --------------------------------------------------------
           Galeria — filtros
           -------------------------------------------------------- */
        var galleryGrid = document.getElementById("gallery-grid");
        var galleryItems = Array.prototype.slice.call(galleryGrid.querySelectorAll(".gallery-item"));
        var filters = Array.prototype.slice.call(document.querySelectorAll(".gallery-filter"));

        function applyFilter(filter) {
            galleryItems.forEach(function (item) {
                var show = filter === "all" || item.getAttribute("data-category") === filter;
                item.classList.toggle("is-hidden", !show);
            });
        }

        filters.forEach(function (btn) {
            btn.addEventListener("click", function () {
                filters.forEach(function (b) {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                applyFilter(btn.getAttribute("data-filter"));
            });
        });

        /* --------------------------------------------------------
           Galeria — lightbox (apenas fotos)
           -------------------------------------------------------- */
        var lightbox = document.getElementById("lightbox");
        var lightboxImg = document.getElementById("lightbox-img");
        var lightboxCaption = document.getElementById("lightbox-caption");
        var lightboxClose = document.getElementById("lightbox-close");
        var lightboxPrev = document.getElementById("lightbox-prev");
        var lightboxNext = document.getElementById("lightbox-next");
        var currentIndex = 0;

        function getVisibleItems() {
            return galleryItems.filter(function (item) {
                return !item.classList.contains("is-hidden") &&
                    !item.querySelector("video");
            });
        }

        function renderItem(index) {
            var items = getVisibleItems();
            if (items.length === 0) return;
            currentIndex = (index + items.length) % items.length;
            var fig = items[currentIndex];
            var img = fig.querySelector("img");
            var caption = fig.querySelector("figcaption");
            lightboxImg.src = img.currentSrc || img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption ? caption.textContent.trim() : "";
        }

        function openLightbox(index) {
            renderItem(index);
            lightbox.hidden = false;
            document.body.style.overflow = "hidden";
            lightboxClose.focus();
        }

        function closeLightbox() {
            lightbox.hidden = true;
            lightboxImg.src = "";
            document.body.style.overflow = "";
        }

        galleryItems.forEach(function (item) {
            if (item.querySelector("video")) return;
            item.addEventListener("click", function () {
                var items = getVisibleItems();
                openLightbox(items.indexOf(item));
            });
        });

        galleryItems.forEach(function (item) {
            var video = item.querySelector("video");
            if (!video) return;
            var playBadge = item.querySelector(".gallery-play");
            video.addEventListener("play", function () {
                if (playBadge) playBadge.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (playBadge) playBadge.classList.remove("is-playing");
            });
        });

        nav.closest("body").addEventListener("click", function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        lightboxClose.addEventListener("click", closeLightbox);
        lightboxPrev.addEventListener("click", function () {
            renderItem(currentIndex - 1);
        });
        lightboxNext.addEventListener("click", function () {
            renderItem(currentIndex + 1);
        });

        document.addEventListener("keydown", function (e) {
            if (lightbox.hidden) return;
            switch (e.key) {
                case "Escape":
                    closeLightbox();
                    break;
                case "ArrowLeft":
                    renderItem(currentIndex - 1);
                    break;
                case "ArrowRight":
                    renderItem(currentIndex + 1);
                    break;
            }
        });

        /* --------------------------------------------------------
           Vídeos da galeria — sem autoplay em telas pequenas
           -------------------------------------------------------- */
        var galleryVideos = galleryItems.map(function (item) {
            return item.querySelector("video");
        }).filter(Boolean);

        function applyMobileVideos() {
            var isMobile = window.innerWidth <= 820;
            galleryVideos.forEach(function (video) {
                if (isMobile) {
                    video.removeAttribute("autoplay");
                    video.pause();
                } else {
                    video.setAttribute("autoplay", "");
                    video.play().catch(function () {});
                }
            });
        }

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(applyMobileVideos, 250);
        });

        applyMobileVideos();
    });
})();