import json
h=open('film.html').read().replace('__MANIFEST__', open('manifest.json').read())
open('film_built.html','w').write(h)
