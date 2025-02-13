/**
 Determines the type of a given variable. 
 
 If the variable is a Java instance, it returns the Java class name.
 If the variable is a JS object, it returns the JS constructor name (if available) 
 or extracts the type from the default toString representation (as a fallback).
 Otherwise, it returns the JS primitive type.
 
 If its a java object it'll look like java.*.*
 If its a javascript primitive, itll look like String (uppercase S)
 If its a javascript non-primative, itll look like string (lowercase s)
 
 Read more about primitives v non primitives here:
 https://levelup.gitconnected.com/primitive-vs-non-primitive-value-in-javascript-82030928fd9
 
 In most cases you will want to lowercase the output of varType() and compare it:
 if (varType("test").toLowerCase()=="string") {
     // Do something
 }
 
 
 @param {any} variable The variable whose type needs to be determined.
 @return {string} The type of the variable.
 
 
 Examples:
        var d = dateFromHL7("20220322074705")
        echo(varType(d));                                   // java.util.Date
        echo(varType(new Date(2023, null)));                // Date
        echo(varType("test"));                              // string
        echo(varType(new String("test")));                  // String
        var i = new java.lang.Integer(5);                   
        echo(varType(i));                                   // java.lang.Integer
        echo(varType(123));                                 // number
        echo(varType([1,2,3]));                             // Array
        echo(varType({key:"value"}));                       // Object
        echo(varType(true));                                // boolean
        echo(varType(null));                                // Null
        echo(varType(undefined));                           // undefined
        echo(varType(function test () {return true;}));     // function
        const sym2 = Symbol("foo");                         
        echo(varType(sym2));                                // symbol
 
  Change Log:
  2023-08-07 TMH
   -I worked with Michael Hobbs, and agermano on slack to write a method to
       determine the data type we are working with. Hobbs had ChatGPT write
       this.
       
       The prompt he used was:
           Clean up and rename this function for Mirth Connect which uses RhinoJS:

            function varType(myVar) {
             const isJavaInstance = myVar instanceof java.lang.Object
             if (isJavaInstance) {
                return myVar.class.name
             }
             const isJSObj = typeof myVar === 'Object'
             if (isJSObj) {
                return myVar.constructor.name
             }
             return typeof myVar
            }
            
    
 */
function varType(variable) {
    // Check for Java instances
    if (variable instanceof java.lang.Object) {
        return variable.class.name;
    }

    // Check for JS objects
    if (typeof variable === 'object') {
        // If variable is not null and constructor.name is available, use it.
        //  Otherwise, use the toString fallback and extract the type
        if (variable && variable.constructor && variable.constructor.name) {
            return variable.constructor.name;
        } else {
            var toStringType = Object.prototype.toString.call(variable);
            return toStringType.slice(8, -1);  // Extracts "Type" from "[object Type]"
        }
    }

    // Return JS primitive type
    return typeof variable;
}