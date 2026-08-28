/** Lightweight page behavior for static solution pages. */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const logo = document.getElementById('logo-container');
  let scrollFrame = 0;

  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      header?.classList.toggle('scrolled', window.scrollY > 20);
      scrollFrame = 0;
    });
  }, { passive: true });

  if (logo) {
    logo.removeAttribute('onclick');
    logo.removeAttribute('style');
    logo.setAttribute('role', 'link');
    logo.setAttribute('tabindex', '0');
    logo.setAttribute('aria-label', 'Fosem Controls home');
    const goHome = event => {
      event.preventDefault();
      window.location.href = 'index.html';
    };
    logo.addEventListener('click', goHome);
    logo.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') goHome(event);
    });
  }

  const revealElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('animate-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('animate-in'));
  }

  const form = document.getElementById('footer-enquiry-form');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.getElementById('footer-enquiry-status');
    const submitButton = form.querySelector('[type="submit"]');

    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) status.textContent = 'Please complete all required fields correctly.';
      return;
    }

    if (status) status.textContent = 'Sending your enquiry…';
    submitButton?.setAttribute('aria-busy', 'true');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!response.ok) throw new Error(`Form submission failed with ${response.status}`);
      form.reset();
      if (status) status.textContent = 'Thank you. Your enquiry has been sent successfully.';
    } catch {
      if (status) status.textContent = 'We could not send your enquiry. Please email sales@fosemcontrols.com instead.';
    } finally {
      if (submitButton) submitButton.disabled = false;
      submitButton?.removeAttribute('aria-busy');
    }
  });
});
