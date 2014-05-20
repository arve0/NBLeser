Om
==
Dette er en alternativ leser for den digitale bokhylla til Nasjonalbiblioteket. Du kan bruke leseren her: http://nbleser.heroku.com

Hvorfor
=======
Jeg har irritert meg over Nasjonalbibliotekets leser, og håper de vil forbedre den. Her er noen av de tingene jeg mener ikke er optimale:

* Kræsjer ofte - ubrukelig på iPad
* Dårlige muligheter for zoom
* Dårlig kontroll over kvalitet
* Ikke tilpasset fullscreen for iPad
* Vanskelig å gå til bestemt side (liten scroller)
* Popup med vilkår - unødvendig påtrengende

Poengene er demonstrert her: http://youtu.be/zvQaJ54-P4s

# Nåværende mangler i NBleser
Søk etter bok:
* Hopper kun til første treff
* Mangler avansert søk (forfatter, år, osv)

Tekstsøk i bok

# Nettressurser
Ressursene hentes av node.js ettersom nb.no ikke har satt access-control-allow-origin på nettressursene.

OpenSearch:
http://www.nb.no/services/search/v2/

Tilemap service:
http://www.nb.no/services/tilesv2/tilemap?viewer=html&pagetype=&format=json&URN=

Hente tiles(fra tilemap):
http://www.nb.no/services/image/

## Ressurser som ikke er tatt i bruk
Søkeforslag - http://www.nb.no/nbsok/suggestion/search?searchString=jo&maxResults=5&mediaType=&highlight=true

# Installer og kjør
```
git clone https://github.com/arve0/NBLeser.git
cd NBLeser
npm install
grunt
```
Åpne nettleser og gå til http://localhost:3000/

# Lisens
MIT - [les lisens](LICENSE.md)
