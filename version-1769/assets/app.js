(() => {
    const q = (selector, root = document) => root.querySelector(selector);
    const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function initMenu() {
        const button = q("[data-menu-toggle]");
        const panel = q("[data-mobile-panel]");
        if (!button || !panel) return;
        button.addEventListener("click", () => {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        const hero = q("[data-hero]");
        if (!hero) return;
        const slides = qa(".hero-slide", hero);
        const dots = qa("[data-hero-dot]", hero);
        const prev = q("[data-hero-prev]", hero);
        const next = q("[data-hero-next]", hero);
        if (!slides.length) return;

        let index = 0;
        let timer = null;

        const show = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
        };

        const restart = () => {
            if (timer) window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function filterCards(root) {
        const input = q("[data-search-input]", root);
        const sort = q("[data-sort-select]", root);
        const list = q("[data-filterable]", root);
        const empty = q("[data-empty]", root);
        if (!list) return;

        const cards = qa("[data-search]", list);

        const apply = () => {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            let visible = 0;

            cards.forEach((card) => {
                const hit = !keyword || (card.dataset.search || "").includes(keyword);
                card.classList.toggle("is-hidden", !hit);
                if (hit) visible += 1;
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        const applySort = () => {
            if (!sort) return;
            const value = sort.value;
            const sorted = cards.slice().sort((a, b) => {
                if (value === "title") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                if (value === "score") {
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
            sorted.forEach((card) => list.appendChild(card));
            apply();
        };

        if (input) input.addEventListener("input", apply);
        if (sort) sort.addEventListener("change", applySort);
        applySort();
        apply();
    }

    function initFilters() {
        qa("[data-filter-section]").forEach(filterCards);
    }

    function loadHlsScript() {
        if (window.Hls) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const old = q("script[data-hls-loader]");
            if (old) {
                old.addEventListener("load", resolve);
                old.addEventListener("error", reject);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.dataset.hlsLoader = "1";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function attachStream(video, source) {
        if (!video || !source) return false;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.load();
            return true;
        }

        try {
            await loadHlsScript();
            if (window.Hls && window.Hls.isSupported()) {
                if (video._hls) {
                    video._hls.destroy();
                }
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video._hls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                return true;
            }
        } catch (error) {
            return false;
        }

        return false;
    }

    function initPlayers() {
        qa("[data-player]").forEach((frame) => {
            const video = q("video", frame);
            const button = q("[data-play-button]", frame);
            const source = frame.dataset.src || (video ? video.dataset.src : "");
            const note = q("[data-player-note]", frame);
            let ready = false;

            const play = async () => {
                if (!video) return;
                if (!ready) {
                    ready = await attachStream(video, source);
                }
                if (!ready) {
                    if (note) note.textContent = "当前浏览器暂未启动播放，请稍后再试";
                    return;
                }
                try {
                    await video.play();
                    frame.classList.add("is-playing");
                } catch (error) {
                    if (note) note.textContent = "请再次点击播放";
                }
            };

            const toggle = () => {
                if (!video) return;
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                    frame.classList.remove("is-playing");
                }
            };

            if (button) button.addEventListener("click", play);
            if (video) {
                video.addEventListener("click", toggle);
                video.addEventListener("play", () => frame.classList.add("is-playing"));
                video.addEventListener("pause", () => frame.classList.remove("is-playing"));
                video.addEventListener("ended", () => frame.classList.remove("is-playing"));
            }
        });
    }

    function initHeroSearch() {
        const form = q("[data-hero-search]");
        if (!form) return;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = q("input", form);
            const keyword = input ? input.value.trim() : "";
            const url = keyword ? `./library.html?q=${encodeURIComponent(keyword)}` : "./library.html";
            window.location.href = url;
        });
    }

    function applyQuerySearch() {
        const params = new URLSearchParams(window.location.search);
        const qValue = params.get("q");
        if (!qValue) return;
        const input = q("[data-search-input]");
        if (input) {
            input.value = qValue;
            input.dispatchEvent(new Event("input"));
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        initMenu();
        initHero();
        initHeroSearch();
        initFilters();
        initPlayers();
        applyQuerySearch();
    });
})();
