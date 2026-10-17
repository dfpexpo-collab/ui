/*
 * TextFX: word-by-word text entrances for outlined SVG text (one <g> per word).
 * Shared by the Text Motion Studio (live preview) and the video renderer, so the
 * render matches the preview exactly. Depends on a global `gsap` (3.x).
 *
 * Effects (per word): slide in from a direction, blur -> sharp, colour from the
 * echo colour -> the word's own colour, an echo trail of ghost copies that leads
 * the word by a few frames, and a soft glow behind it.
 */
(function (root) {
  const DEFAULTS = {
    preset: 'echo',        // echo | blur | fade | none
    direction: 'right',    // right | left | up | down | none (where the word comes from)
    distance: 60,          // px of travel
    duration: 0.6,         // s per word
    blur: 14,              // px blur at the start
    echoColor: '#00b3ff',  // echo/glow colour on dark scenes
    echoColorLight: '#0012d6', // echo/glow colour on light scenes
    ghosts: 3,             // number of echo copies
    ghostGap: 2,           // frames between echo copies
    ghostOpacity: 0.55,
    lead: 3,               // frames the first echo copy leads the word
    glow: 0.35,            // glow opacity at its peak (0 = off)
    glowStay: 0.12,        // glow opacity it settles to
    tint: true,            // word starts in the echo colour and turns to its own colour
    ease: 'expo.out',
    stagger: 0.09,         // s between words when no spoken timing is given
  };
  const FPS = 30;
  const SVGNS = 'http://www.w3.org/2000/svg';

  function vec(dir, d) {
    return { right: [d, 0], left: [-d, 0], up: [0, -d], down: [0, d] }[dir] || [0, 0];
  }

  function paint(g, color) {
    g.querySelectorAll('path').forEach(p => p.setAttribute('fill', color));
  }

  // Remove ghosts/glows from a previous build (the studio rebuilds on every change).
  function clean(rootEl) {
    rootEl.querySelectorAll('[data-tfx]').forEach(n => n.remove());
    rootEl.querySelectorAll('[data-tfx-word]').forEach(w => {
      gsap.killTweensOf(w);
      w.querySelectorAll('path').forEach(p => {
        gsap.killTweensOf(p);
        if (p.dataset.fill) p.setAttribute('fill', p.dataset.fill);
      });
      gsap.set(w, { clearProps: 'all' });
    });
  }

  /**
   * Add the entrance of `words` (SVG <g> elements, in reading order) to timeline `tl`.
   * times: start time of each word (s). opts: settings (merged over DEFAULTS); light: light scene.
   */
  function apply(tl, words, times, opts, light) {
    const s = Object.assign({}, DEFAULTS, opts || {});
    if (s.preset === 'none' || !words.length) {
      words.forEach((w, i) => tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.01 }, times[i]));
      return;
    }
    const echo = light ? s.echoColorLight : s.echoColor;
    const [dx, dy] = s.direction === 'none' ? [0, 0] : vec(s.direction, s.distance);
    const useEcho = s.preset === 'echo';
    const blur = s.preset === 'fade' ? 0 : s.blur;

    words.forEach((w, i) => {
      const t = times[i];
      w.setAttribute('data-tfx-word', '');
      const paths = Array.from(w.querySelectorAll('path'));
      paths.forEach(p => { if (!p.dataset.fill) p.dataset.fill = p.getAttribute('fill') || '#000'; });

      if (useEcho) {
        // glow: blurred copy behind the word
        if (s.glow > 0) {
          const glow = w.cloneNode(true);
          glow.removeAttribute('id'); glow.setAttribute('data-tfx', 'glow');
          paint(glow, echo);
          w.parentNode.insertBefore(glow, w);
          tl.fromTo(glow, { opacity: 0, x: dx, y: dy, filter: 'blur(18px)' },
            { opacity: s.glow, x: 0, y: 0, duration: s.duration, ease: s.ease }, t - s.lead / FPS);
          tl.to(glow, { opacity: s.glowStay, duration: s.duration * 1.2, ease: 'sine.out' }, t + s.duration);
        }
        // echo copies lead the word: each one starts a few frames earlier, lands first, then fades as the word arrives
        const lead = s.lead / FPS, gap = s.ghostGap / FPS;
        for (let k = 1; k <= s.ghosts; k++) {
          const gh = w.cloneNode(true);
          gh.removeAttribute('id'); gh.setAttribute('data-tfx', 'ghost');
          paint(gh, echo);
          w.parentNode.insertBefore(gh, w);
          const op = s.ghostOpacity * (1 - (k - 1) / (s.ghosts + 1));
          const t0 = t - lead - (s.ghosts - k) * gap;
          tl.fromTo(gh, { opacity: 0, x: dx, y: dy, filter: `blur(${blur}px)` },
            { opacity: op, x: 0, y: 0, filter: `blur(${blur * 0.35}px)`, duration: s.duration * 0.8, ease: s.ease }, t0);
          tl.to(gh, { opacity: 0, duration: s.duration * 0.5, ease: 'power1.out' }, t + s.duration * 0.55);
        }
      }

      // the word itself
      tl.fromTo(w, { opacity: 0, x: dx, y: dy, filter: `blur(${blur}px)` },
        { opacity: 1, x: 0, y: 0, filter: 'blur(0px)', duration: s.duration, ease: s.ease }, t);
      if (useEcho && s.tint) {
        paths.forEach(p => {
          if (/^url\(/.test(p.dataset.fill)) return;   // gradient fills keep their paint
          tl.fromTo(p, { attr: { fill: echo } }, { attr: { fill: p.dataset.fill }, duration: s.duration * 1.1, ease: 'power1.inOut' }, t);
        });
      }
    });
  }

  root.TextFX = { DEFAULTS, apply, clean };
})(typeof window !== 'undefined' ? window : globalThis);
