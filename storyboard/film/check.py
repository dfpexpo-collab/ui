import json, sys
from PIL import Image
m=json.load(open('manifest.json'))
for sid in sys.argv[1:]:
    sc=m[sid]; base=Image.open(sc['plate']).convert('RGBA'); plate=base.copy()
    for L in sc['layers']:
        if L.get('kind')=='text' and L.get('words'):
            for w in L['words']: base.alpha_composite(Image.open(w['src']).convert('RGBA'),(round(w['x']),round(w['y'])))
        else: base.alpha_composite(Image.open(L['src']).convert('RGBA'),(round(L['x']),round(L['y'])))
    s=Image.new('RGB',(1090,960),'white'); s.paste(plate.convert('RGB').resize((540,960)),(0,0)); s.paste(base.convert('RGB').resize((540,960)),(550,0)); s.save(f'chk_{sid}.jpg',quality=88)
