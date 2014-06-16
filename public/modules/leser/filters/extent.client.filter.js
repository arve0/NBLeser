'use strict';

angular.module('leser').filter('extent',
function() {
    return function(input) {
    // Extent directive logic
    // transform abbreviations
        // sides
        var out = input.replace(/ s\./gi,' sider');
        // illustrated
        out = out.replace(/ ill\./gi, ' illustrert');
        // commas
        out = out.replace(/([a-z]) /gi, '$1, ');

        return out;
    };
});
