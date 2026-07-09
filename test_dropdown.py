from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
        viewport={'width': 390, 'height': 844},
        device_scale_factor=3,
        is_mobile=True,
        has_touch=True
    )
    page.goto('http://localhost:8080', timeout=60000)
    
    # Open mobile menu
    page.click('#mobile-menu-btn')
    page.wait_for_selector('.nav-links.active')
    
    # Click Industries
    industries_link = page.locator('span.nav-link:has-text("Industries")')
    industries_link.click()
    
    # Check classes
    nav_item = industries_link.locator('..')
    classes = nav_item.get_attribute('class')
    print("Nav Item Classes after click:", classes)
    
    # Check dropdown menu height and visibility
    dropdown = nav_item.locator('.dropdown-menu')
    box = dropdown.bounding_box()
    print("Dropdown bounding box:", box)
    
    style = dropdown.evaluate('el => window.getComputedStyle(el).maxHeight')
    print("Dropdown computed max-height:", style)
    
    display = dropdown.evaluate('el => window.getComputedStyle(el).display')
    print("Dropdown computed display:", display)
    
    browser.close()
