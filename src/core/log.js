/* globals */

const logs = [];

function getCaller(){
  var err = new Error;
  // var caller_line = err.stack.split("\n")[5];
  // var index = caller_line.indexOf("at ");
  // var clean = caller_line.slice(index + 2, caller_line.length);
  return err.stack;
}

function objectStringfy(item) {
    var props = [];
    props.push("{");
    
    if(typeof item === "object" && item.prototype && item.prototype.name){
      props.push(`[object ${item.prototype.name}`);
    } else if(typeof item === "object"){
      props.push(item.toString());
    } else {
      props.push(`[ ${typeof item} ]`);
    }
    
    if(typeof item === "string") {
      props.push(" -> "+item);
    } else {
      for (var property in item) {
        if (item.hasOwnProperty(property) && typeof item[property] !== "function") {
          props.push(" -> "+property+" : "+item[property]);
        }
      }
    }
    
    props.push("}");
    return props.join('\n');
}

function parseArgs(args) {
  args = args.slice();
  var props = args.map(objectStringfy);
  
  return props.join('\r');
}

function result(args){
  // var caller = getCaller();
  var res = parseArgs(args);
  return ">>  "+res;
}

function flatten() {
  var output = "";
  
  logs.map(function(log){
    output += log.join("\n\r");
  });

  return output;
}

function flush(){
  print(flatten());
}

function print(output){
  if (console.log) {
    console.log(output);
  } else {
    alert(output);
  }
}

function add(logArr){
   logs.push(logArr);
}

module.exports = {
  log: function() {
    var args = Array.prototype.slice.apply(arguments);
    // add(args);
    print(args);
  }
  , error: function() {
    var args = ["[ Error ]"];
    args = args.concat(Array.prototype.slice.apply(arguments));
    print(args.map(function(log) {
      if(log instanceof Error){
        return log.message + "\n\n*" + log.sourceURL + "\n*" + log.line + "\n*" + log.stack;
      }
      return log;
    }).join(""));
  }
  , dir: function(){
    var args = Array.prototype.slice.apply(arguments);
    print(result(args));
  }
  , add: function(){
    var args = Array.prototype.slice.apply(arguments);
    add(args);
  }
  , flush: function(){
    flush();
  }
  , logs: function(){
    return logs.slice();
  }
};