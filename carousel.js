(() => {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const slides = [
    { image: 'assets/port-crane.jpg', alt: 'Large industrial crane working at a waterside facility', kicker: 'CRANE SALES & LIFTING', title: 'Built around the work.', copy: 'Explore lifting systems for demanding industrial sites.' },
    { image: 'assets/gantry-cranes.jpg', alt: 'Gantry cranes and lifting equipment at an industrial port', kicker: 'ENGINEERED LIFTING', title: 'Move heavy work with confidence.', copy: 'Find the right equipment for your layout and duty cycle.' },
    { image: 'assets/mining-crane.jpg', alt: 'Large yellow mining crane at an open industrial site', kicker: 'HEAVY INDUSTRY', title: 'Ready for demanding environments.', copy: 'Plan for the site, the load and the conditions.' },
    { video: 'assets/kbs-crane-film.mp4', poster: 'assets/heavy-lift-crane.jpg', alt: 'KBS industrial crane film', kicker: 'SEE THE WORK IN MOTION', title: 'A closer look at industrial lifting.', copy: 'Play the short film to view the equipment in motion.' },
    { image: 'assets/tower-crane.jpg', alt: 'Tower crane lifting a load against an open sky', kicker: 'SITE-SPECIFIC PLANNING', title: 'The right fit starts with your site.', copy: 'Share your requirements and explore practical next steps.' },
    { image: 'assets/heavy-lift-crane.jpg', alt: 'Heavy-duty yellow lifting equipment at an industrial site', kicker: 'LIFTING EQUIPMENT', title: 'Support for the whole equipment life.', copy: 'Ask about supply, rental, refurbishment and service.' },
    { image: 'assets/yard-crane.jpg', alt: 'Industrial lifting and yard equipment at a port facility', kicker: 'KBS INDUSTRIAL', title: 'Lifting, access and support.', copy: 'One team to help you understand the options.' }
  ];

  const stage = carousel.querySelector('.carousel-stage');
  const image = carousel.querySelector('[data-carousel-image]');
  const video = carousel.querySelector('[data-carousel-video]');
  const kicker = carousel.querySelector('[data-carousel-kicker]');
  const title = carousel.querySelector('[data-carousel-title]');
  const copy = carousel.querySelector('[data-carousel-copy]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  const pause = carousel.querySelector('[data-carousel-pause]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let paused = reduceMotion.matches;

  const render = index => {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    stage.classList.add('is-changing');
    stage.classList.toggle('is-video', Boolean(slide.video));
    if (slide.video) stop();
    video.pause();
    video.hidden = true;
    image.hidden = false;
    if (slide.video) {
      image.hidden = true;
      video.hidden = false;
      video.poster = slide.poster;
      video.setAttribute('aria-label', slide.alt);
      if (!video.querySelector('source')) {
        const source = document.createElement('source');
        source.src = slide.video;
        source.type = 'video/mp4';
        video.append(source);
        video.load();
      }
    } else {
      image.src = slide.image;
      image.alt = slide.alt;
    }
    kicker.textContent = slide.kicker;
    title.textContent = slide.title;
    copy.textContent = slide.copy;
    dots.querySelectorAll('button').forEach((button, i) => {
      button.classList.toggle('active', i === current);
      button.setAttribute('aria-current', String(i === current));
    });
    carousel.setAttribute('aria-label', `KBS products and services, slide ${current + 1} of ${slides.length}`);
    window.setTimeout(() => stage.classList.remove('is-changing'), 80);
  };

  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-dot';
    button.setAttribute('aria-label', `Show slide ${index + 1}: ${slide.kicker}`);
    button.addEventListener('click', () => { render(index); restart(); });
    dots.append(button);
  });

  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => {
    stop();
    if (!paused && !slides[current].video && !reduceMotion.matches && !document.hidden) timer = setInterval(() => render(current + 1), 7000);
  };
  const restart = () => start();
  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => { render(current - 1); restart(); });
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => { render(current + 1); restart(); });
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.textContent = paused ? 'Play slides' : 'Pause slides';
    pause.setAttribute('aria-label', paused ? 'Play carousel slides' : 'Pause carousel slides');
    paused ? stop() : start();
  });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) start(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  reduceMotion.addEventListener?.('change', event => { if (event.matches) { paused = true; stop(); pause.textContent = 'Play slides'; } });
  render(0);
  pause.textContent = paused ? 'Play slides' : 'Pause slides';
  pause.setAttribute('aria-label', paused ? 'Play carousel slides' : 'Pause carousel slides');
  start();
})();
