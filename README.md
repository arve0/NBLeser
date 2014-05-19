NBLeser
=======
Et alternativ til nasjonalbibliotekets egen nettleser (som ikke fungerer bra på iPad).

Utviklet med mean.js.

Prøv appen her: http://nbleser.heroku.com


Ressurser som er brukt
======================
Tilemap service:
http://www.nb.no/services/tilesv2/tilemap?viewer=html&pagetype=&format=json&URN=

Hente tiles(fra tilemap):
http://www.nb.no/services/image/



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

