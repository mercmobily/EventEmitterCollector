/*
 * Module dependencies.
 */

var dummy
, async = require('async')
, declare = require("simpledeclare")
;


// Create the enhanced EventEmitter
exports = module.exports = declare( null, {

  _enrichArray: function( a ){

    a.onlyResults = function(){
      var ret = [];
      this.forEach( function( i ){
        ret.push( i.result );
      });  
      return ret;      
    };

    a.groupByModule = function(){
      var ret = {};
      this.forEach( function( i ){
        if( !Array.isArray( ret[ i.module ] ) ) ret[ i.module ] = [];
        ret[ i.module ].push( i.result );
      });  
      return ret;
      
    };

    a.indexBy = function( attr ){
      var ret = {};
      var newItem;
      this.forEach( function( i ){
        if( typeof( i.result ) === 'object' && i.result !== null ){
          ret[ i.result[ attr ] ] = newItem = i.result;
          newItem.module = i.module;
        }
      });  
      return ret;
    };

    return a;

  },

  constructor: function(){
    this.listenersByModuleEvent = {}
    this.listenersByEvent = {}
  },

  addListener: function(){
    this.on.apply( this, arguments );
  },

  // add a callback for a specific event/module pair. If module is missing,
  // it will default to "global"
  on: function( event, module, listener ){

    // console.log("ADDING:");
    // console.log( event );
    // console.log( module );
    // console.log( listener );

    // The `module` parameter is optional
    if( typeof( module ) === 'function' ){
      listener = module;
      module = 'global';
    }
  
    // Normalise this.listenersByModuleEvent
    if( typeof( this.listenersByModuleEvent[ module ] ) === 'undefined' ){
      this.listenersByModuleEvent[ module ] = {};
    }
    if( !Array.isArray( this.listenersByModuleEvent[ module ][ event ] ) ){
      this.listenersByModuleEvent[ module ][ event ] = [];
    }

    // Normalise this.listenersByEvent
    if( !Array.isArray( this.listenersByEvent[ event ] ) ){
      this.listenersByEvent[ event ] = [];
    }

    this.listenersByModuleEvent[ module ][ event ].push( listener );
    this.listenersByEvent[ event ].push( { module: module, listener: listener } );

    //console.log("\nAFTER ADD SUMMARY:");
    //console.log("--------------------------");
    //u = require('util');
    //console.log( 'this.listenersByModuleEvent:');
    //console.log( u.inspect( this.listenersByModuleEvent, { depth: 4 } ) );

    //console.log( 'this.listenersByEvent:');
    //console.log( u.inspect( this.listenersByEvent, { depth: 4 } ) );

    //console.log("--------------------------");
  },

  emitModule: function(){

    var event, module,
    functionList = [],
    args,
    callback,
    listeners,
    eventArguments;

    var self = this;

    // Turn `arguments` into a proper array
    args = Array.prototype.splice.call(arguments, 0);
     
    // get the `hook` and `hookArgument` variables 
    event = args.splice( 0, 1 )[ 0 ]; // The first parameter, always the hook's name
    module = args.splice( 0, 1 )[ 0 ]; // The second parameter, always the module's name
    eventArguments = args;           // The leftovers, the hook's parameters
    
    // If the last parameter is a function, it's assumed
    // to be the callback
    //if( typeof( eventArguments[ eventArguments.length - 1 ] ) === 'function' ){
      callback = eventArguments.pop();   // The last parameter, always the callback
    //}
    
    if(
      typeof( this.listenersByModuleEvent[ module ] ) === 'undefined' || 
      typeof( this.listenersByModuleEvent[ module ][ event ] ) === 'undefined'
    ){
      callback( null, self._enrichArray( [] ) );
    } else {

      listeners = this.listenersByModuleEvent[ module ][ event ];
   
      listeners.forEach( function( listener ) {

        // Pushes the async function to functionList. Note that the arguments passed to invokeAll are
        // bound to the function's scope
        functionList.push( function( done ){
 
          listener.apply( this, Array.prototype.concat( eventArguments, function( err, res ){
            if( err ) {
              done( err );
            } else {
              done( null, { module: module, result:  res } );
            }

          }));
        });
      });

      //callback ? async.series( functionList, callback ) : async.series( functionList );
      async.series( functionList, function( err, res ){
        if( err ){
          callback( err );
        } else {
          callback( null,  self._enrichArray( res ) );
        }
      });
    }
  },


  emit: function(){

    var event,
    functionList = [],
    args,
    callback,
    listenerItems,
    eventArguments;

    var self = this;

    // Turn `arguments` into a proper array
    args = Array.prototype.splice.call(arguments, 0);
     
    // get the `hook` and `hookArgument` variables 
    event = args.splice( 0, 1 )[ 0 ]; // The first parameter, always the hook's name
    eventArguments = args;           // The leftovers, the hook's parameters
    
    // If the last parameter is a function, it's assumed
    // to be the callback
    //if( typeof( eventArguments[ eventArguments.length - 1 ] ) === 'function' ){
      callback = eventArguments.pop();   // The last parameter, always the callback
    //}
    
    if( typeof( this.listenersByEvent[ event ] ) === 'undefined' ){
      callback( null, self._enrichArray( [] ) );
    } else {

      listenerItems = this.listenersByEvent[ event ];
   
      listenerItems.forEach( function( listenerItem ) {

        // Pushes the async function to functionList. Note that the arguments passed to invokeAll are
        // bound to the function's scope
        functionList.push( function( done ){

          listenerItem.listener.apply( this, Array.prototype.concat( eventArguments, function( err, res ){
            if( err ) {
              done( err );
            } else {
              done( null, { module: listenerItem.module, result: res } );
            }

          }));
        });
      });

      //callback ? async.series( functionList, callback ) : async.series( functionList );
      async.series( functionList, function( err, res ){
        if( err ){
          callback( err );
        } else {
        
          callback( null,  self._enrichArray( res ) );
        }
      }); 
    }
  }

})


/*
as.onAsync( 'event1', 'module1', function( done ){
  console.log("Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'event1 module1 ONE' );
});

as.onAsync( 'event1', 'module1', function( done ){
  console.log("AGAIN Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'event1 module1 TWO' );
});

as.onAsync( 'event2', 'module1', function( param1, param2, done ){
  console.log("Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'event1 module1, PARAMS:' + param1 + ',' + param2 );
});

as.onAsync( 'event2', 'module1', function( param1, param2, done ){
  console.log("AGAIN Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'AGAIN event1 module1, PARAMS:' + param1 + ',' + param2 );
});

as.onAsync( 'event1', 'module2', function( done ){
  console.log("Called event 'event1' for module 'module2' (TWO!), arguments:");
  console.log( arguments );
  done( null, 'event1 module2' );
});

as.emitAsync( 'event1', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event1:");
  console.log( results );
  console.log("------------------");
})

as.emitAsync( 'event1', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event1, narrowed to module1:");
  console.log("**************************************************************");
  console.log( results  );
  console.log( results.groupByModule()  );
  console.log( results.onlyResults()  );
  console.log("------------------");
})


as.emitAsync( 'event2', 'ONE', 'TWO', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event2:");
  console.log( results );
  console.log("------------------");
})

as.emitModuleAsync( 'event1', 'module1', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event1 for module1:");
  console.log( results );
  console.log("------------------");
})

*/



