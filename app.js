/* ═══════════════════════════════════════════════════════════════
   MARIACHI JUVENIL VIVA MÉXICO — León, Guanajuato
   Sin dependencias · Vanilla JS

   01 Utilidades            08 Motor de scroll (suavizado)
   02 Enlaces WhatsApp      09 Escenario · imagen que se expande
   03 Loader                10 Galería horizontal fijada
   04 Split de texto        11 Proceso · línea que se dibuja
   05 Reveal + contadores   12 Celebraciones · vista previa
   06 Navegación + menú     13 Interacciones (tilt, imán, cursor…)
   07 Partículas del hero   14 FAQ · hotspots · formulario
═══════════════════════════════════════════════════════════════ */
(() => {
    'use strict';

    const root = document.documentElement;
    root.classList.add('is-loading');
    // Seguro: si algo fallara, nunca dejamos la página bloqueada
    setTimeout(() => root.classList.remove('is-loading'), 9000);

    /* ───────── 01 · UTILIDADES ───────── */
    const $  = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    // Acerca el valor actual al objetivo, independiente de los fps
    const smooth = (cur, target, k, dt) => {
        const d = target - cur;
        return Math.abs(d) < 0.0003 ? target : cur + d * (1 - Math.pow(1 - k, dt));
    };
    const safe = (fn, name) => { try { fn(); } catch (err) { console.warn('[init:' + (name || fn.name) + ']', err); } };

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

    const WA_NUMBER = '524772275085';
    const WA_GREETING = 'Hola, Mariachi Juvenil Viva México. ';

    /* ───────── 02 · ENLACES WHATSAPP ───────── */
    const waUrl = msg => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

    safe(() => {
        $$('[data-wa]').forEach(a => {
            a.href = waUrl(WA_GREETING + a.dataset.wa + '.');
            a.target = '_blank';
            a.rel = 'noopener';
        });
    }, 'whatsapp-links');

    /* ───────── 03 · LOADER ───────── */
    const loader = $('#loader');
    let loaded = document.readyState === 'complete';
    window.addEventListener('load', () => { loaded = true; });
    setTimeout(() => { loaded = true; }, 6000); // no esperamos más de 6 s por recursos lentos

    const heroIn = () => {
        $$('[data-hero]').forEach(el => {
            if (el.hasAttribute('data-split')) {
                el.style.setProperty('--base', (el.style.getPropertyValue('--d') || '0s').trim());
            }
            el.classList.add('is-in');
        });
    };

    const showFloat = () => {
        const wa = $('#wa-float');
        if (!wa) return;
        wa.classList.add('is-visible');
        setTimeout(() => wa.classList.add('show-tip'), 3500);
        setTimeout(() => wa.classList.remove('show-tip'), 9500);
    };

    safe(() => {
        if (!loader) { root.classList.remove('is-loading'); heroIn(); showFloat(); return; }
        const num = $('#ld-num');
        const msg = $('.ld-msg');
        const msgs = ['Afinando violines…', 'Puliendo trompetas…', 'Ajustando la vihuela…', 'Preparando tu fiesta…', '¡Listos para cantar!'];
        const MIN = reduceMotion ? 300 : 2600;
        const t0 = performance.now();
        let shown = 0, last = t0, lastMsg = -1;

        const finish = () => {
            loader.classList.add('is-done');
            root.classList.remove('is-loading');
            setTimeout(heroIn, reduceMotion ? 0 : 650);
            setTimeout(showFloat, 1800);
            setTimeout(() => loader.remove(), 1700);
        };

        const tick = now => {
            const dt = Math.min(64, now - last) / 16.667; last = now;
            const timeP = clamp((now - t0) / MIN);
            const target = loaded ? timeP : Math.min(timeP, .9);
            shown = smooth(shown, target, .14, dt);
            const pct = Math.round(shown * 100);
            num.textContent = pct;
            loader.style.setProperty('--ld', pct);
            const mi = Math.min(msgs.length - 1, Math.floor(shown * msgs.length));
            if (mi !== lastMsg) { msg.textContent = msgs[mi]; lastMsg = mi; }
            if (loaded && timeP >= 1 && shown > .995) { num.textContent = 100; loader.style.setProperty('--ld', 100); finish(); return; }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, 'loader');

    /* ───────── 04 · SPLIT DE TEXTO ───────── */
    // Envuelve cada palabra en <span.w><span.wi> para animar con máscara.
    // Respeta elementos internos (<em>, etc.).
    const splitText = el => {
        let idx = 0;
        const walk = node => {
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                        const w = document.createElement('span');
                        const wi = document.createElement('span');
                        w.className = 'w';
                        wi.className = 'wi';
                        wi.style.setProperty('--w', idx++);
                        wi.textContent = part;
                        w.appendChild(wi);
                        frag.appendChild(w);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                    walk(child);
                }
            });
        };
        walk(el);
        $$('.t-gold', el).forEach(e => e.classList.add('is-split'));
        if (el.matches('.t-gold')) el.classList.add('is-split');
    };
    safe(() => $$('[data-split]').forEach(splitText), 'split');

    /* ───────── 05 · REVEAL + CONTADORES ───────── */
    safe(() => {
        const targets = $$('[data-reveal], [data-split]:not([data-hero])');
        if (!('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-in'));
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (!en.isIntersecting) return;
                const el = en.target;
                el.classList.add('is-in');
                io.unobserve(el);
                // Al terminar la entrada liberamos el elemento para que sus hover/transiciones propias vuelvan a funcionar
                if (el.hasAttribute('data-reveal')) {
                    const i = parseFloat(el.style.getPropertyValue('--i')) || 0;
                    setTimeout(() => el.removeAttribute('data-reveal'), 1400 + i * 90);
                }
            });
        }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
        targets.forEach(el => io.observe(el));
    }, 'reveal');

    safe(() => {
        const counters = $$('[data-count]');
        const section = $('.stats');
        if (!counters.length || !section || reduceMotion || !('IntersectionObserver' in window)) return;
        counters.forEach(c => { c.textContent = '0'; });
        const io = new IntersectionObserver(([en]) => {
            if (!en.isIntersecting) return;
            io.disconnect();
            counters.forEach((c, i) => {
                const target = parseInt(c.dataset.count, 10);
                const dur = 1900;
                const t0 = performance.now() + i * 140;
                const step = now => {
                    const p = clamp((now - t0) / dur);
                    c.textContent = Math.round(easeOut(p) * target);
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            });
        }, { threshold: .35 });
        io.observe(section);
    }, 'counters');

    /* ───────── 06 · NAVEGACIÓN + MENÚ ───────── */
    const nav = $('#nav');
    const burger = $('#burger');
    const menu = $('#menu');

    safe(() => {
        const setMenu = open => {
            menu.classList.toggle('is-open', open);
            nav.classList.toggle('is-open', open);
            root.classList.toggle('is-menu-open', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            menu.setAttribute('aria-hidden', String(!open));
        };
        burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
        $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
        matchMedia('(min-width: 1060px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
    }, 'menu');

    safe(() => {
        // Enlace activo según la sección que cruza el centro de la pantalla
        const links = $$('.nav-links a');
        const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
        if (!('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                const a = map.get(en.target.id);
                if (a && en.isIntersecting) { links.forEach(l => l.classList.toggle('is-active', l === a)); }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }, 'nav-active');

    /* ───────── 07 · PARTÍCULAS DEL HERO ───────── */
    // Polvo dorado + constelaciones que reaccionan al cursor + notas musicales flotando
    safe(() => {
        const cv = $('#fx');
        const hero = $('#inicio');
        if (!cv || !hero || reduceMotion) return;
        const ctx = cv.getContext('2d');
        let W = 0, H = 0, dots = [], notes = [], raf = 0, visible = true;
        const mouse = { x: -999, y: -999, on: false };
        const GLYPHS = ['♪', '♫', '♬', '♩'];
        const small = () => W < 700;

        const mkDot = init => ({
            x: Math.random() * W, y: init ? Math.random() * H : H + 12,
            r: Math.random() * 1.8 + .5, vx: (Math.random() - .5) * .28, vy: -(Math.random() * .34 + .07),
            a: Math.random() * .6 + .25, tw: Math.random() * 6.28
        });
        const mkNote = init => ({
            x: Math.random() * W, y: init ? Math.random() * H : H + 40,
            s: 14 + Math.random() * 20, vy: -(.22 + Math.random() * .4), vx: (Math.random() - .5) * .25,
            rot: Math.random() * .8 - .4, vr: (Math.random() - .5) * .008,
            ch: GLYPHS[(Math.random() * GLYPHS.length) | 0], a: .1 + Math.random() * .24, ph: Math.random() * 6.28
        });

        const resize = () => {
            const r = hero.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = r.width; H = r.height;
            cv.width = W * dpr; cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = small() ? 36 : Math.min(92, Math.round(W * H / 15000));
            dots = Array.from({ length: n }, () => mkDot(true));
            notes = Array.from({ length: small() ? 5 : 9 }, () => mkNote(true));
        };

        const LINK = 118, MOUSE = 150;
        const frame = t => {
            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'lighter';

            for (const p of dots) {
                p.x += p.vx; p.y += p.vy; p.tw += .03;
                if (mouse.on) {
                    const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
                    if (d2 < 16000 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d2 / 16000) * 2.2; p.x += dx / d * f; p.y += dy / d * f; }
                }
                if (p.y < -12 || p.x < -12 || p.x > W + 12) Object.assign(p, mkDot(false));
                ctx.fillStyle = `rgba(243,210,122,${p.a * (.55 + .45 * Math.sin(p.tw))})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
            }

            if (!small()) {
                ctx.lineWidth = 1;
                for (let i = 0; i < dots.length; i++) {
                    const a = dots[i];
                    for (let j = i + 1; j < dots.length; j++) {
                        const b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
                        if (d2 < LINK * LINK) {
                            ctx.strokeStyle = `rgba(243,210,122,${(1 - Math.sqrt(d2) / LINK) * .2})`;
                            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                        }
                    }
                    if (mouse.on) {
                        const dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
                        if (d2 < MOUSE * MOUSE) {
                            ctx.strokeStyle = `rgba(255,233,168,${(1 - Math.sqrt(d2) / MOUSE) * .5})`;
                            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                        }
                    }
                }
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.textAlign = 'center';
            for (const n of notes) {
                n.y += n.vy; n.x += n.vx + Math.sin(t * .001 + n.ph) * .35; n.rot += n.vr;
                if (n.y < -40) Object.assign(n, mkNote(false));
                ctx.save();
                ctx.translate(n.x, n.y); ctx.rotate(n.rot);
                ctx.font = `${n.s}px serif`;
                ctx.fillStyle = `rgba(243,210,122,${n.a})`;
                ctx.fillText(n.ch, 0, 0);
                ctx.restore();
            }
            raf = requestAnimationFrame(frame);
        };

        const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };

        hero.addEventListener('pointermove', e => {
            const r = cv.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = e.pointerType === 'mouse';
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { mouse.on = false; });
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(hero);
        }
        let rt;
        window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
        resize();
        start();
    }, 'particles');

    /* ───────── 08 · MOTOR DE SCROLL ───────── */
    // Un único bucle rAF. Todo lo que depende del scroll se suaviza (inercia)
    // para lograr ese "motion lento" sin secuestrar el scroll nativo.
    const S = { y: 0, vh: window.innerHeight, vw: root.clientWidth, docH: 0 };
    const hooks = [];
    const onFrame = fn => hooks.push(fn);
    const absTop = el => el.getBoundingClientRect().top + window.scrollY;
    const measures = [];
    const onMeasure = fn => measures.push(fn);

    let running = false, idle = 0, lastT = 0;
    const kick = () => {
        idle = 0;
        if (running) return;
        running = true; lastT = performance.now();
        requestAnimationFrame(loop);
    };
    function loop(now) {
        const dt = Math.min(4, (now - lastT) / 16.667); lastT = now;
        S.y = window.scrollY;
        let busy = false;
        for (const h of hooks) { try { if (h(S, dt)) busy = true; } catch (e) { console.warn(e); } }
        idle = busy ? 0 : idle + 1;
        if (idle > 20) { running = false; return; }
        requestAnimationFrame(loop);
    }

    const measure = () => {
        S.vh = window.innerHeight; S.vw = root.clientWidth;
        measures.forEach(fn => safe(fn, 'measure'));
        S.docH = root.scrollHeight;
        kick();
    };
    let mt;
    const queueMeasure = () => { clearTimeout(mt); mt = setTimeout(measure, 120); };
    window.addEventListener('resize', queueMeasure);
    window.addEventListener('load', () => setTimeout(measure, 100));
    if ('ResizeObserver' in window) new ResizeObserver(queueMeasure).observe(document.body);
    window.addEventListener('scroll', kick, { passive: true });

    /* — Barra de progreso, navbar y botón flotante — */
    const bar = $('.progress');
    let stuck = null;
    onFrame(S => {
        const max = Math.max(1, S.docH - S.vh);
        bar.style.setProperty('--sp', clamp(S.y / max).toFixed(4));
        const s = S.y > 30;
        if (s !== stuck) { stuck = s; nav.classList.toggle('is-stuck', s); }
        return false;
    });

    /* — Hero: profundidad al hacer scroll — */
    safe(() => {
        const hero = $('#inicio');
        const copy = $('.hero-copy', hero);
        const vis = $('.hero-visual', hero);
        const inner = $('.hero-inner', hero);
        const foot = $('.hero-foot', hero);
        let hh = 0, p = 0, reset = true;
        onMeasure(() => { hh = hero.offsetHeight; });
        onFrame((S, dt) => {
            if (reduceMotion) return false;
            if (S.y > hh) { if (!reset) { copy.style.transform = vis.style.transform = ''; inner.style.opacity = foot.style.opacity = ''; reset = true; } return false; }
            reset = false;
            const prev = p;
            p = smooth(p, S.y, .14, dt);
            copy.style.transform = `translate3d(0,${(p * .16).toFixed(1)}px,0)`;
            vis.style.transform = `translate3d(0,${(p * -.07).toFixed(1)}px,0)`;
            const o = clamp(1 - p / (hh * .8));
            inner.style.opacity = o.toFixed(3);
            foot.style.opacity = o.toFixed(3);
            return p !== prev;
        });
    }, 'hero-scroll');

    /* — Manifiesto: el texto se ilumina palabra por palabra — */
    safe(() => {
        const el = $('#scrub');
        if (!el) return;
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map(w => `<span class="sw">${w}</span>`).join(' ');
        const spans = $$('.sw', el);
        if (reduceMotion) { spans.forEach(s => (s.style.opacity = 1)); return; }
        let top = 0, h = 0, p = 0;
        onMeasure(() => { top = absTop(el); h = el.offsetHeight; });
        onFrame((S, dt) => {
            const raw = clamp((S.y + S.vh * .82 - top) / (S.vh * .42 + h));
            p = smooth(p, raw, .1, dt);
            const k = p * (spans.length + 5);
            spans.forEach((s, i) => {
                const o = (.15 + .85 * clamp(k - i)).toFixed(3);
                if (s._o !== o) { s._o = o; s.style.opacity = o; }
            });
            return p !== raw;
        });
    }, 'scrub');

    /* — Parallax de imágenes — */
    safe(() => {
        if (reduceMotion) return;
        const items = $$('[data-parallax]').map(el => {
            const inner = $('.px', el);
            return { wrap: el, node: inner || el, speed: parseFloat(el.dataset.parallax) || .1, top: 0, h: 0, cur: 0 };
        });
        onMeasure(() => items.forEach(it => {
            const prev = it.node.style.transform;
            it.node.style.transform = '';
            it.top = absTop(it.wrap); it.h = it.wrap.offsetHeight;
            it.node.style.transform = prev;
        }));
        onFrame((S, dt) => {
            let moving = false;
            items.forEach(it => {
                const d = (S.y + S.vh / 2) - (it.top + it.h / 2);
                if (Math.abs(d) > S.vh * 1.2) return;
                const target = clamp(d, -S.vh, S.vh) * -it.speed;
                const next = smooth(it.cur, target, .1, dt);
                if (next !== it.cur) { it.cur = next; it.node.style.transform = `translate3d(0,${next.toFixed(1)}px,0)`; moving = true; }
            });
            return moving;
        });
    }, 'parallax');

    /* — Texto gigante que se desplaza en CTA y footer — */
    safe(() => {
        if (reduceMotion) return;
        const drifts = [
            { el: $('.cta-word'), sec: $('#reserva'), range: 16, cur: 0, top: 0, h: 0 },
            { el: $('.foot-giant span'), sec: $('.foot'), range: 5, cur: 0, top: 0, h: 0 }
        ].filter(d => d.el && d.sec);
        onMeasure(() => drifts.forEach(d => { d.top = absTop(d.sec); d.h = d.sec.offsetHeight; }));
        onFrame((S, dt) => {
            let moving = false;
            drifts.forEach(d => {
                const raw = clamp((S.y + S.vh - d.top) / (d.h + S.vh));
                const target = (raw - .5) * 2 * d.range;
                const next = smooth(d.cur, target, .08, dt);
                if (next !== d.cur) { d.cur = next; d.el.style.setProperty('--dx', next.toFixed(2) + 'vw'); moving = true; }
            });
            return moving;
        });
    }, 'drift');

    /* ───────── 09 · ESCENARIO · IMAGEN QUE SE EXPANDE ───────── */
    safe(() => {
        const sec = $('#escenario');
        const copy = $('.xp-copy', sec);
        if (!sec) return;
        if (reduceMotion) { sec.style.setProperty('--e', 1); sec.style.setProperty('--c', 1); copy.classList.add('is-on'); return; }
        let top = 0, h = 0, p = -1, on = false;
        onMeasure(() => { top = absTop(sec); h = sec.offsetHeight; });
        onFrame((S, dt) => {
            const raw = clamp((S.y - top) / Math.max(1, h - S.vh));
            const next = p < 0 ? raw : smooth(p, raw, .085, dt);
            if (next !== p) {
                p = next;
                const e = easeIO(clamp(p / .58));
                const c = clamp((p - .6) / .24);
                sec.style.setProperty('--e', e.toFixed(4));
                sec.style.setProperty('--c', c.toFixed(4));
                const o = c > .65;
                if (o !== on) { on = o; copy.classList.toggle('is-on', o); }
            }
            return p !== raw;
        });
    }, 'expand');

    /* ───────── 10 · GALERÍA HORIZONTAL FIJADA ───────── */
    safe(() => {
        const gl = $('#galeria');
        const track = $('#gl-track');
        const view = $('.gl-viewport', gl);
        const fill = $('#gl-fill');
        const cur = $('#gl-cur');
        if (!gl || !track) return;
        const cards = $$('.gl-card', track);
        const mq = matchMedia('(min-width: 900px)');
        let pinned = false, max = 0, top = 0, p = 0, idx = -1, centers = [];

        const setIdx = i => { if (i !== idx) { idx = i; cur.textContent = String(i + 1).padStart(2, '0'); } };

        onMeasure(() => {
            pinned = mq.matches && !reduceMotion;
            gl.classList.toggle('is-pinned', pinned);
            if (pinned) {
                track.style.transform = '';
                max = Math.max(0, track.scrollWidth - root.clientWidth);
                const hgt = Math.round(max + window.innerHeight) + 'px';
                if (gl.style.height !== hgt) gl.style.height = hgt;
                centers = cards.map(c => c.offsetLeft + c.offsetWidth / 2);
            } else {
                gl.style.height = '';
                track.style.transform = '';
                fill.style.transform = '';
            }
            top = absTop(gl);
        });

        onFrame((S, dt) => {
            if (!pinned) return false;
            const raw = max > 0 ? clamp((S.y - top) / max) : 0;
            const next = smooth(p, raw, .09, dt);
            p = next;
            track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
            fill.style.transform = `scaleX(${Math.max(.04, p).toFixed(4)})`;
            const mid = S.vw / 2 + p * max;
            let best = 0, bd = Infinity;
            centers.forEach((c, i) => { const d = Math.abs(c - mid); if (d < bd) { bd = d; best = i; } });
            setIdx(best);
            return p !== raw;
        });

        // En móvil / tablet: scroll nativo con snap; sólo actualizamos la barra
        view.addEventListener('scroll', () => {
            if (pinned) return;
            const m = view.scrollWidth - view.clientWidth;
            const q = m > 0 ? view.scrollLeft / m : 0;
            fill.style.transform = `scaleX(${Math.max(.04, q).toFixed(4)})`;
            const mid = view.scrollLeft + view.clientWidth / 2;
            let best = 0, bd = Infinity;
            cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
            setIdx(best);
        }, { passive: true });
        mq.addEventListener('change', queueMeasure);
    }, 'gallery');

    /* ───────── 11 · PROCESO · LÍNEA QUE SE DIBUJA ───────── */
    safe(() => {
        const list = $('#steps');
        if (!list) return;
        const steps = $$('.step', list);
        const mq = matchMedia('(min-width: 1000px)');
        let pr = 0;
        const lit = steps.map(() => false);
        const setLit = (i, v) => { if (lit[i] !== v) { lit[i] = v; steps[i].classList.toggle('is-lit', v); } };

        onFrame(S => {
            const rects = steps.map(s => $('.step-dot', s).getBoundingClientRect());
            if (rects[0].top > S.vh * 1.2 || rects[rects.length - 1].bottom < -S.vh * .2) return false;
            const line = S.vh * .72;
            let target;
            if (mq.matches) {
                target = clamp((line - rects[0].top) / (S.vh * .32));
                steps.forEach((_, i) => setLit(i, rects[0].top < line && target >= i / (steps.length - 1) - .001));
            } else {
                const a = rects[0].top, b = rects[rects.length - 1].top;
                target = clamp((line - a) / Math.max(1, b - a));
                steps.forEach((_, i) => setLit(i, rects[i].top < line));
            }
            if (Math.abs(target - pr) > .001) { pr = target; list.style.setProperty('--pr', pr.toFixed(4)); }
            return false;
        });
    }, 'steps');

    /* ───────── 12 · CELEBRACIONES · VISTA PREVIA ───────── */
    safe(() => {
        const links = $$('.occ-link');
        const stage = $('.occ-stage');
        const cta = $('#occ-cta');
        const label = $('#occ-cta-label');
        const mq = matchMedia('(min-width: 1024px)');
        if (!links.length || !stage) return;

        const build = () => {
            if (stage.childElementCount) return;
            links.forEach(l => {
                const img = new Image();
                img.alt = '';
                img.decoding = 'async';
                img.dataset.src = l.dataset.img;
                img.style.objectPosition = l.dataset.pos || '50% 40%';
                // Zoom anclado arriba para recortar marcas de agua / texto incrustado en la parte baja de la foto
                if (l.dataset.zoom) img.style.setProperty('--z', l.dataset.zoom);
                stage.appendChild(img);
                l._img = img;
            });
        };
        const activate = l => {
            if (!l._img) return;
            if (!l._img.src) l._img.src = l._img.dataset.src;
            links.forEach(x => x.classList.toggle('is-active', x === l));
            $$('img', stage).forEach(i => i.classList.toggle('is-on', i === l._img));
            label.textContent = l.dataset.cta;
            cta.href = l.href;
            cta.target = '_blank';
            cta.rel = 'noopener';
        };
        const setup = () => {
            if (!mq.matches) return;
            build();
            if (!links.some(l => l.classList.contains('is-active'))) activate(links[0]);
        };
        links.forEach(l => {
            l.addEventListener('mouseenter', () => mq.matches && activate(l));
            l.addEventListener('focus', () => mq.matches && activate(l));
        });
        mq.addEventListener('change', setup);
        setup();
    }, 'occasions');

    /* ───────── 13 · INTERACCIONES ───────── */
    // Tilt 3D con brillo en las tarjetas del hero
    safe(() => {
        if (!finePointer || reduceMotion) return;
        $$('[data-tilt]').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                card.style.transform = `perspective(900px) rotateY(${((px - .5) * 14).toFixed(2)}deg) rotateX(${((.5 - py) * 14).toFixed(2)}deg) scale3d(1.03,1.03,1.03)`;
                card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
                card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
    }, 'tilt');

    // Botones magnéticos
    safe(() => {
        if (!finePointer || reduceMotion) return;
        $$('[data-magnetic]').forEach(el => {
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
                el.style.transform = `translate(${(x * .16).toFixed(1)}px,${(y * .26).toFixed(1)}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }, 'magnetic');

    // Spotlight que sigue al cursor en las tarjetas de compromiso
    safe(() => {
        if (!finePointer) return;
        $$('[data-spot]').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }, 'spotlight');

    // Cursor circular con inercia
    safe(() => {
        const c = $('.cursor');
        if (!c || !finePointer || reduceMotion) return;
        let x = -100, y = -100, tx = x, ty = y, raf = 0;
        const loop = () => {
            x += (tx - x) * .2; y += (ty - y) * .2;
            c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
            raf = (Math.abs(tx - x) + Math.abs(ty - y) > .1) ? requestAnimationFrame(loop) : 0;
        };
        window.addEventListener('pointermove', e => {
            tx = e.clientX; ty = e.clientY;
            c.classList.add('is-on');
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
        document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
        document.addEventListener('pointerover', e => {
            c.classList.toggle('is-hover', !!e.target.closest('a, button, [data-tilt], .hot, .faq-q'));
        });
    }, 'cursor');

    /* ───────── 14 · FAQ · HOTSPOTS · FORMULARIO ───────── */
    safe(() => {
        const items = $$('.faq-item');
        items.forEach(item => {
            const btn = $('.faq-q', item);
            btn.addEventListener('click', () => {
                const open = btn.getAttribute('aria-expanded') !== 'true';
                items.forEach(i => {
                    const b = $('.faq-q', i);
                    const isThis = i === item;
                    b.setAttribute('aria-expanded', String(isThis && open));
                    i.classList.toggle('is-open', isThis && open);
                });
            });
        });
    }, 'faq');

    safe(() => {
        const hots = $$('.hot');
        hots.forEach(h => h.addEventListener('click', e => {
            e.stopPropagation();
            const open = !h.classList.contains('is-open');
            hots.forEach(x => x.classList.remove('is-open'));
            h.classList.toggle('is-open', open);
        }));
        document.addEventListener('click', () => hots.forEach(x => x.classList.remove('is-open')));
    }, 'hotspots');

    safe(() => {
        const form = $('#wa-form');
        if (!form) return;
        const status = $('#f-status');
        const btn = $('#f-submit');
        const fields = {
            name: $('#f-name'), phone: $('#f-phone'), event: $('#f-event'),
            date: $('#f-date'), place: $('#f-place'), msg: $('#f-msg')
        };
        // No permitir fechas pasadas
        const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        fields.date.min = today.toISOString().slice(0, 10);

        const setErr = (key, text) => {
            const wrap = fields[key].closest('.field');
            const out = $('#e-' + key);
            wrap.classList.toggle('has-err', !!text);
            fields[key].setAttribute('aria-invalid', text ? 'true' : 'false');
            if (out) out.textContent = text || '';
        };
        ['name', 'event'].forEach(k => fields[k].addEventListener('input', () => setErr(k, '')));
        fields.event.addEventListener('change', () => setErr('event', ''));

        form.addEventListener('submit', e => {
            e.preventDefault();
            const name = fields.name.value.trim();
            const event = fields.event.value;
            setErr('name', name.length < 2 ? 'Cuéntanos tu nombre para saludarte.' : '');
            setErr('event', event ? '' : 'Elige qué vas a celebrar.');
            if (name.length < 2) { fields.name.focus(); return; }
            if (!event) { fields.event.focus(); return; }

            const lines = [`¡Hola, Mariachi Juvenil Viva México! 👋`, `Soy *${name}*.`, '', `🎉 Quiero cotizar música en vivo para: *${event}*`];
            if (fields.date.value) {
                const d = new Date(fields.date.value + 'T12:00:00');
                lines.push(`📅 Fecha: ${d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`);
            }
            if (fields.place.value.trim()) lines.push(`📍 Lugar: ${fields.place.value.trim()}`);
            if (fields.phone.value.trim()) lines.push(`📞 Mi teléfono: ${fields.phone.value.trim()}`);
            if (fields.msg.value.trim()) lines.push('', `💬 ${fields.msg.value.trim()}`);
            lines.push('', '¡Gracias! Quedo al pendiente de su respuesta.');

            const label = $('.btn-label', btn);
            btn.disabled = true;
            label.textContent = 'Abriendo WhatsApp…';
            status.classList.remove('is-ok');
            status.textContent = 'Un momento, te llevamos a WhatsApp con tu mensaje listo.';

            setTimeout(() => {
                const url = waUrl(lines.join('\n'));
                const w = window.open(url, '_blank', 'noopener');
                if (!w) window.location.href = url;
                form.reset();
                btn.disabled = false;
                label.textContent = 'Quiero reservar mi fecha';
                status.classList.add('is-ok');
                status.textContent = '¡Listo! Si WhatsApp no se abrió, escríbenos al 477 227 5085.';
            }, 700);
        });
    }, 'form');

    /* ───────── ARRANQUE ───────── */
    measure();
})();
