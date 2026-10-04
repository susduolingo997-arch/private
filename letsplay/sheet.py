import sys,glob
from PIL import Image
fs=sorted(glob.glob('build/stills/*.jpg'))[int(sys.argv[1]):int(sys.argv[2])]
ims=[Image.open(f).resize((640,360)) for f in fs]
W=Image.new('RGB',(1280,360*((len(ims)+1)//2)))
for i,im in enumerate(ims): W.paste(im,((i%2)*640,(i//2)*360))
W.save(sys.argv[3])
