from PIL import Image
import numpy as np

def crop_icon(img_path, out_path):
    img = Image.open(img_path).convert('RGB')
    data = np.array(img)
    
    # We want to crop out the light background board.
    # The icon has dark lines. Let's find all pixels that are dark (e.g., max(R,G,B) < 200)
    # The image is 1024x983.
    # The background board is light gray/white. The border of the board is also light.
    # We will find the bounding box of pixels that are sufficiently dark.
    
    # Calculate grayscale or max intensity
    max_intensity = np.max(data, axis=2)
    
    # Threshold for "dark" pixels belonging to the line art (e.g., < 180)
    # The card is light gray, but the outlines are dark gray/black.
    dark_pixels = max_intensity < 180
    
    # Find bounding box of dark pixels
    rows = np.any(dark_pixels, axis=1)
    cols = np.any(dark_pixels, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Could not find dark lines, cropping fallback.")
        left, top, right, bottom = 200, 200, 800, 800
    else:
        top_idx = np.argmax(rows)
        bottom_idx = len(rows) - 1 - np.argmax(rows[::-1])
        left_idx = np.argmax(cols)
        right_idx = len(cols) - 1 - np.argmax(cols[::-1])
        
        # Add a little padding (20px)
        pad = 20
        top = max(0, top_idx - pad)
        bottom = min(data.shape[0], bottom_idx + pad)
        left = max(0, left_idx - pad)
        right = min(data.shape[1], right_idx + pad)
        
    print(f"Cropping to: {left},{top},{right},{bottom}")
    cropped = img.crop((left, top, right, bottom))
    
    # Optional: make the background transparent!
    # Convert back to RGBA
    cropped = cropped.convert("RGBA")
    data_crop = np.array(cropped)
    
    # Any pixel that is very light (close to the background color) becomes transparent.
    # Let's say R>230, G>230, B>230
    light_pixels = (data_crop[:,:,0] > 230) & (data_crop[:,:,1] > 230) & (data_crop[:,:,2] > 230)
    data_crop[light_pixels, 3] = 0
    
    Image.fromarray(data_crop).save(out_path)
    print(f"Saved {out_path}")

crop_icon("/Users/m1chip/.gemini/antigravity/brain/7ff33e9e-b9b2-423e-b935-52cb07f34d9d/media__1778977658339.jpg", "assets/access-control-v2.png")
