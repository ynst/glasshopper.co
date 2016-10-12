/* Given an array of strings and a string to match, return the array with all matching strings
*/

'use strict'

var Narrower = (function ( window, document, undefined ) {

    function Narrower( arr ) {
        this.arr  = arr || []
    }

    Narrower.prototype.update = function ( str ) {
        var rgxp, results

        // optimization
        if ( '' === str ) {
            return this.arr
        }
        else {
            // create regular expression
            rgxp = new RegExp( str, 'i' ) // todo: make Unicode-safe once ES6 is widely adopted

            results = this.arr.filter(function ( val ) {
                return null !== val.match( rgxp )
            })

            return results.sort()
        }
    }

    return Narrower

}).call( this, this, this.document )