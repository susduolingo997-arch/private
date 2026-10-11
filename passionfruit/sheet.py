"""Contact sheet of build/stills: python3 ../sheet.py out.jpg [start] [end] (3 columns, 426x240 tiles)"""
import sys, glob
from PIL import Image
fs = sorted(glob.glob('build/stills/*.jpg'))[int(sys.argv[2]) if len(sys.argv) > 2 else 0:int(sys.argv[3]) if len(sys.argv) > 3 else None]
W = Image.new('RGB', (1278, 240 * ((len(fs) + 2) // 3)))
for i, f in enumerate(fs): W.paste(Image.open(f).resize((426, 240)), ((i % 3) * 426, (i // 3) * 240))
W.save(sys.argv[1], quality=85)
