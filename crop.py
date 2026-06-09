from PIL import Image, ImageChops

def crop_image(img_path):
    img = Image.open(img_path)
    
    # We will crop out the outer 10% on left/right/top, and 15% on bottom to remove the watermark and border.
    width, height = img.size
    left = int(width * 0.15)
    top = int(height * 0.15)
    right = int(width * 0.85)
    bottom = int(height * 0.8) # Crop more from bottom to remove text
    
    img_cropped = img.crop((left, top, right, bottom))
    img_cropped.save(img_path)
    print(f"Cropped {img_path} to {left},{top},{right},{bottom}")

crop_image("assets/access-control.png")
