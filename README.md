Om
==
Dette er en alternativ leser for ebøkene på den digitale bokhylla til Nasjonalbiblioteket. Fra bokhylla kan du lese over 170 tusen norske bøker, helt gratis! Du kan bruke leseren her: https://arve0.github.io/NBLeser/

Her er en demovideo av leseren: https://youtu.be/waUmeowGwjM

Hvorfor
=======
Jeg har irritert meg over Nasjonalbibliotekets leser, og håper de vil forbedre den. Her er noen av de tingene jeg mener ikke er optimale:

* Kræsjer ofte på iPad
    - minnelekasje i iOS ved CSS `overflow-y` og `-webkit-overflow-scrolling: touch`
* Zoom er tungvindt
* Vanskelig å kontrollere bildekvalitet
* Ikke tilpasset fullscreen på nettbrett
* Vanskelig å gå til bestemt side (liten scroller)
* Popup med vilkår - unødvendig påtrengende

Poengene er demonstrert her: https://youtu.be/zvQaJ54-P4s

# Nåværende mangler i NBLeser
* Tekstsøk og merking i bok

[Les TODO](TODO.md)

# Nettressurser
OpenSearch:
https://www.nb.no/services/search/v2/

Tilemap service:
https://www.nb.no/services/tilesv2/tilemap?viewer=html&pagetype=&format=json&URN=

Henter bilder(url fra tilemap):
https://www.nb.no/services/image/

Metadata til bøker:
http://xisbn.worldcat.org/webservices/xid/isbn/8200427005?method=getMetadata&format=json&fl=*

Noen av ressursene hentes via https://crossorigin.me ettersom de ikke tillater CORS/`access-control-allow-origin`.

## Ressurser som ikke er tatt i bruk
Søkeforslag - https://www.nb.no/nbsok/suggestion/search?searchString=jo&maxResults=5&mediaType=&highlight=true

# Installer og kjør
```
git clone https://github.com/arve0/NBLeser.git
cd NBLeser
npm install
bower install
npm run build
http-server  # må være installert globalt: npm i -g http-server
```
Åpne nettleser og gå til http://localhost:8080/

# Lisens
MIT - [les lisens](LICENSE.md).
