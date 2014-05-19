NBLeser
=======
Et alternativ til nasjonalbibliotekets egen nettleser (som ikke fungerer bra på iPad).

Utviklet med mean.js.


Ressurser som er brukt
======================

Tilemap service:
http://www.nb.no/services/tilesv2/tilemap?viewer=html&URN=URN:NBN:no-nb_digibok_2008103000046&pagetype=&format=json

Hente tiles:
http://www.nb.no/services/image/resolver?url_ver=geneza&urn=URN:NBN:no-nb_digibok_2008103000046_0004&maxLevel=6&level=3&col=0&row=0&resX=2242&resY=3169&tileWidth=1024&tileHeight=1024



Installer og kjør
=================
```
git clone https://github.com/arve0/NBLeser.git
cd NBLeser
npm install
grunt
```
Åpne nettleser og gå til http://localhost:3000/



Andre mulige ressurser
======================
OpenSearch API:
http://www.nb.no/services/search/v2/
http://www.nb.no/services/search/v2/search?q=arve&itemsPerPage=2

Søk etter forslag:
http://www.nb.no/nbsok/suggestion/search?searchString=jo&maxResults=5&mediaType=&highlight=true

