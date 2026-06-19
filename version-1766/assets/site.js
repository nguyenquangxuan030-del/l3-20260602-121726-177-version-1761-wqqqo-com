(function () {
    var yearNode = document.querySelector('[data-year]');
    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };

        var start = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    }

    var applyInitialQuery = function (form) {
        var input = form.querySelector('[data-filter-keyword]');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
    };

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var targetId = form.getAttribute('data-filter-target');
        var target = document.getElementById(targetId);
        if (!target) {
            return;
        }
        var input = form.querySelector('[data-filter-keyword]');
        var category = form.querySelector('[data-filter-category]');
        var year = form.querySelector('[data-filter-year]');
        var clear = form.querySelector('[data-filter-clear]');
        var empty = document.querySelector('[data-empty-for="' + targetId + '"]');
        var items = Array.prototype.slice.call(target.querySelectorAll('[data-filter-item]'));

        applyInitialQuery(form);

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var run = function () {
            var q = normalize(input ? input.value : '');
            var cat = category ? category.value : 'all';
            var yr = year ? year.value : 'all';
            var visible = 0;

            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute('data-search'));
                var itemCategory = item.getAttribute('data-category') || '';
                var itemYear = item.getAttribute('data-year') || '';
                var ok = true;

                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (cat !== 'all' && itemCategory !== cat) {
                    ok = false;
                }
                if (yr !== 'all' && itemYear !== yr) {
                    ok = false;
                }

                item.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        ['input', 'change'].forEach(function (eventName) {
            if (input) {
                input.addEventListener(eventName, run);
            }
            if (category) {
                category.addEventListener(eventName, run);
            }
            if (year) {
                year.addEventListener(eventName, run);
            }
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (category) {
                    category.value = 'all';
                }
                if (year) {
                    year.value = 'all';
                }
                run();
            });
        }

        run();
    });

    var playWithPromise = function (video, message) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                if (message) {
                    message.textContent = '点击视频画面继续播放';
                }
            });
        }
    };

    var attachPlayer = function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var button = shell.querySelector('.player-start');
        var message = shell.querySelector('.player-message');
        var source = shell.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        var startPlayer = function () {
            shell.classList.add('is-playing');
            if (ready) {
                playWithPromise(video, message);
                return;
            }
            ready = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playWithPromise(video, message);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && message) {
                        message.textContent = '视频加载失败，请稍后重试';
                    }
                });
                shell._hls = hls;
                return;
            }

            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                playWithPromise(video, message);
            }, { once: true });
            video.load();
            playWithPromise(video, message);
        };

        if (button) {
            button.addEventListener('click', startPlayer);
        }
        if (overlay) {
            overlay.addEventListener('click', startPlayer);
        }
        video.addEventListener('click', function () {
            if (!ready) {
                startPlayer();
            }
        });
    };

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
}());
