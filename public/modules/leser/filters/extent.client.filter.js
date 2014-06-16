'use strict';

angular.module('leser').filter('extent',
function() {
    return function(input) {
    // Extent directive logic
    // transform abbreviations
        // s. -> sider
        var out = input.replace(/ s\./gi,' sider');
        // bl. -> blad
        out = out.replace(/ bl\./gi,' blad');
        // ill. -> illustrert
        out = out.replace(/ ill\./gi, ' illustrert');
        // fold. -> foldet
        out = out.replace(/ fold\./gi, ' foldet');
        // kart. -> kart
        out = out.replace(/ kart\./gi, ' kartblad');
        // commas
        out = out.replace(/([a-z]) /gi, '$1, ');
        // remove special case commas
        out = out.replace(/ foldet, kartblad/gi, ' foldet kartblad');

        return out;
    };
});
