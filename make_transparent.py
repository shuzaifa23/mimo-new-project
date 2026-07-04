from PIL import Image
import sys

def make_transparent(img_path, output_path, is_dark_mode):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    
    # We will compute distance from the target background color.
    # For dark mode: background is black. So if rgb is close to black, make it transparent.
    # But wait, the logo has a glowing blue X. We don't want to make the dark blue transparent.
    # It's better to just do a simple threshold for exact black or exact white, 
    # but exact might leave artifacts.
    # Let's use a small threshold.
    
    for item in datas:
        r, g, b, a = item
        if is_dark_mode:
            # target is black
            if r < 15 and g < 15 and b < 15:
                newData.append((0, 0, 0, 0)) # transparent
            else:
                newData.append(item)
        else:
            # target is white
            if r > 240 and g > 240 and b > 240:
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)
                
    img.putdata(newData)
    img.save(output_path, "PNG")

make_transparent("public/mimo-x-dark.png", "public/mimo-x-dark.png", True)
make_transparent("public/mimo-x-light.png", "public/mimo-x-light.png", False)
print("Done")
