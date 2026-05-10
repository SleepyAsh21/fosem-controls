document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     Navbar Scroll Effect
     ========================================================================== */
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  /* ==========================================================================
     Intersection Observer for Scroll Animations
     ========================================================================== */
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15 // trigger when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // If element is in viewport
      if (entry.isIntersecting) {
        // Add the 'is-visible' class to trigger CSS transition
        entry.target.classList.add("is-visible");
        
        // Optional: stop observing the element so the animation only happens once
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Targets to animate
  const targets = document.querySelectorAll('.anim-fade-up, .anim-zoom-in, .anim-slide-in-right');
  
  targets.forEach(target => {
    observer.observe(target);
  });
});
