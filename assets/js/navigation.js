/**
 * FOSEM CONTROLS — Shared navigation controller
 * Keeps desktop, keyboard and mobile navigation in one deterministic state.
 */
document.addEventListener('DOMContentLoaded', () => {
  const navigation = document.getElementById('main-nav');
  const mobileButton = document.getElementById('mobile-menu-btn');
  document.querySelectorAll('.nav-item > .nav-link').forEach(trigger => {
    if (trigger.tagName === 'BUTTON') return;
    const control = document.createElement('button');
    control.type = 'button';
    control.className = trigger.className;
    control.innerHTML = trigger.innerHTML;
    trigger.replaceWith(control);
  });

  const items = Array.from(document.querySelectorAll('.nav-item'));
  const desktopQuery = window.matchMedia('(min-width: 769px)');
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let lastPointerType = '';

  if (!navigation || !mobileButton || !items.length) return;

  items.forEach((item, index) => {
    const trigger = item.querySelector(':scope > .nav-link');
    const menu = item.querySelector(':scope > .dropdown-menu');
    if (!trigger || !menu) return;

    const menuId = menu.id || `nav-menu-${index + 1}`;
    menu.id = menuId;
    menu.hidden = true;
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-controls', menuId);
    trigger.setAttribute('aria-expanded', 'false');
  });

  const setItemOpen = (item, open) => {
    const trigger = item.querySelector(':scope > .nav-link');
    const menu = item.querySelector(':scope > .dropdown-menu');
    item.classList.toggle('active', open);
    item.classList.toggle('is-open', open);
    trigger?.setAttribute('aria-expanded', String(open));
    menu?.classList.toggle('is-open', open);
    if (menu) menu.hidden = !open;
  };

  const closeDropdowns = ({ focusTrigger = false } = {}) => {
    const openItem = items.find(item => item.classList.contains('is-open') || item.classList.contains('active'));
    items.forEach(item => setItemOpen(item, false));
    if (focusTrigger) openItem?.querySelector(':scope > .nav-link')?.focus();
  };

  const openDropdown = item => {
    items.forEach(candidate => setItemOpen(candidate, candidate === item));
  };

  const setMobileOpen = (open, { returnFocus = false } = {}) => {
    navigation.classList.toggle('active', open);
    navigation.classList.toggle('open', open);
    mobileButton.classList.toggle('active', open);
    mobileButton.setAttribute('aria-expanded', String(open));
    mobileButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('nav-open', open && !desktopQuery.matches);
    if (!open) closeDropdowns();
    if (returnFocus) mobileButton.focus();
  };

  const closeAll = ({ returnFocus = false } = {}) => {
    closeDropdowns();
    setMobileOpen(false, { returnFocus });
  };

  mobileButton.setAttribute('aria-controls', navigation.id);
  mobileButton.setAttribute('aria-expanded', 'false');
  mobileButton.setAttribute('aria-label', 'Open navigation menu');
  mobileButton.addEventListener('click', () => {
    setMobileOpen(mobileButton.getAttribute('aria-expanded') !== 'true');
  });

  items.forEach(item => {
    const trigger = item.querySelector(':scope > .nav-link');
    const menu = item.querySelector(':scope > .dropdown-menu');
    const links = Array.from(menu?.querySelectorAll('a') || []);
    if (!trigger || !menu) return;

    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (desktopQuery.matches && hoverQuery.matches && lastPointerType !== 'touch') {
        openDropdown(item);
        return;
      }
      const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';
      if (shouldOpen) openDropdown(item);
      else closeDropdowns();
    });

    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openDropdown(item);
        const target = event.key === 'ArrowDown' ? links[0] : links.at(-1);
        target?.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeDropdowns({ focusTrigger: true });
      }
    });

    menu.addEventListener('keydown', event => {
      const currentIndex = links.indexOf(document.activeElement);
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDropdowns({ focusTrigger: true });
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + links.length) % links.length;
        links[nextIndex]?.focus();
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        (event.key === 'Home' ? links[0] : links.at(-1))?.focus();
      }
    });

    item.addEventListener('pointerenter', event => {
      if (desktopQuery.matches && hoverQuery.matches && event.pointerType !== 'touch') openDropdown(item);
    });

    item.addEventListener('pointerleave', event => {
      if (desktopQuery.matches && hoverQuery.matches && event.pointerType !== 'touch') closeDropdowns();
    });

    item.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (!item.contains(document.activeElement)) setItemOpen(item, false);
      }, 0);
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        // Close synchronously so a same-page route never leaves the menu covering content.
        closeAll();
        link.blur();
      });
    });
  });

  document.addEventListener('pointerdown', event => {
    lastPointerType = event.pointerType;
    if (!navigation.contains(event.target) && !mobileButton.contains(event.target)) closeDropdowns();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (mobileButton.getAttribute('aria-expanded') === 'true') closeAll({ returnFocus: true });
    else closeDropdowns({ focusTrigger: true });
  });

  desktopQuery.addEventListener('change', event => {
    closeDropdowns();
    if (event.matches) setMobileOpen(false);
  });

  window.fosemNavigation = Object.freeze({
    closeAll,
    closeDropdowns,
    openDropdown,
    setMobileOpen
  });
});
