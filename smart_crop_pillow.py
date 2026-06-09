from PIL import Image

def crop_icon(img_path, out_path):
    img = Image.open(img_path).convert('RGB')
    width, height = img.size
    
    # We want to crop out the light background board.
    # Let's find the bounding box of pixels that are dark enough (R, G, B < 200)
    left, top, right, bottom = width, height, 0, 0
    pixels = img.load()
    
    # Since it's 1000x1000, we can scan by skipping every 5 pixels for speed
    for y in range(0, height, 5):
        for x in range(0, width, 5):
            r, g, b = pixels[x, y]
            if max(r, g, b) < 180:
                if x < left: left = x
                if y < top: top = y
                if x > right: right = x
                if y > bottom: bottom = y

    if left >= right or top >= bottom:
        print("Could not find dark lines, cropping fallback.")
        left, top, right, bottom = 200, 200, 800, 800
    else:
        # Add padding
        pad = 20
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(width, right + pad)
        bottom = min(height, bottom + pad)
        
    print(f"Cropping to: {left},{top},{right},{bottom}")
    cropped = img.crop((left, top, right, bottom))
    
    # Make the background transparent
    cropped = cropped.convert("RGBA")
    new_data = []
    for item in cropped.getdata():
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    cropped.putdata(new_data)
    cropped.save(out_path, "PNG")
    print(f"Saved {out_path}")

crop_icon("/Users/m1chip/.gemini/antigravity/brain/7ff33e9e-b9b2-423e-b935-52cb07f34d9d/media__1778977658339.jpg", "assets/access-control.png")
