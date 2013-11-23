"use strict";

var EEC = require( 'eventemittercollector' );


// Make sure uncaught errors are displayed
process.on('uncaughtException', function(err) {
  console.error(err.stack);
});



var compareResults = function( test, a, b ){

  debugger;

  try {
    var a1 = [], a2, a3;
    a.forEach( function( item ){
      a1.push( JSON.stringify( item ) );
    });
    // a2 = a1.sort();
    a2 = a1;
    a3 = JSON.stringify( a2 );

    var b1 = [], b2, b3;
    b.forEach( function( item ){
      b1.push( JSON.stringify( item ) );
    });
    //b2 = b1.sort();
    b2 = b1;
    b3 = JSON.stringify( b2 );
  } catch ( e ){
    test.fail( a, b, "Comparison failed", "results comparison" );
  }

  var res = ( a3 == b3 );

  if( ! res ){
    test.fail( a, b, "Record sets do not match", "results comparison" );
  }

}



// Yeah I could write a function that generates functions, but then I would need
// tests on the test functions. I am going to keep all test functions as eaaaasssyyy as possible.
function listenerA1( done ){
  //console.log("ListenerA1 run");
  done( null, 'listenerA1' );
}
function listenerA2( done ){
  //console.log("ListenerA2 run");
  done( null, 'listenerA2' );
}
function listenerA3( done ){
  //console.log("ListenerA3 run");
  done( null, 'listenerA3' );
}
function listenerA4( done ){
  //console.log("ListenerA4 run");
  done( null, 'listenerA4' );
}
function listenerP1( p1, p2, done ){
  //console.log("ListenerP1 run");
  console.log("p1: " + p1 + "; p2: " + p2 );
  done( null, 'listenerP1' );
}
function listenerP2( p1, p2, done ){
  //console.log("ListenerP2 run");
  console.log("p1: " + p1 + "; p2: " + p2 );
  done( null, 'listenerP2' );
}


var tests = {

  "straight events": function( test ){

    var eec = new( EEC );

    eec.on( 'event1', listenerA1 );
    eec.on( 'event1', listenerA2 );
    eec.on( 'event1', listenerA3 );

    eec.emit( 'event1', function( err, results ){
      test.ifError( err );
      compareResults( test, results, [ 
        { module: 'global', result: 'listenerA1' },
        { module: 'global', result: 'listenerA2' },
        { module: 'global', result: 'listenerA3' },
      ]);

      test.done();
    });

  },

  "2": function( test ){

    test.done();
  },

  "3": function( test ){

    test.done();
  },

  "4": function( test ){

    test.done();
  },







}
  
// Copy tests over to exports
for( var i in tests ){
  exports[ i ] = tests[ i ];
}


function l( d, p ){
  console.log('Getting ' + p );
  console.log( require('util').inspect( d.get( p ), { depth: 20 }  )  );
  console.log( '' );
}


