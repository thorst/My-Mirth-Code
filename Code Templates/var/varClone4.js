/**
    Modify the description here. Modify the function name and parameters as needed. One function per
    template is recommended; create a new code template for each new function.

    source
    https://stackoverflow.com/a/11462081

    @param {String} arg1 - arg1 description
    @return {String} return description
*/
function varClone4(obj) {
    var clonedObjectsArray = [];
    var originalObjectsArray = []; //used to remove the unique ids when finished
    var next_objid = 0;

    function objectId(obj) {
        if (obj == null) return null;
        if (obj.__obj_id == undefined) {
            obj.__obj_id = next_objid++;
            originalObjectsArray[obj.__obj_id] = obj;
        }
        return obj.__obj_id;
    }

    function cloneRecursive(obj) {
        if (null == obj || typeof obj == "string" || typeof obj == "number" || typeof obj == "boolean") return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0; i < obj.length; ++i) {
                copy[i] = cloneRecursive(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            if (clonedObjectsArray[objectId(obj)] != undefined)
                return clonedObjectsArray[objectId(obj)];

            var copy;
            if (obj instanceof Function)//Handle Function
                copy = function () { return obj.apply(this, arguments); };
            else
                copy = {};

            clonedObjectsArray[objectId(obj)] = copy;

            for (var attr in obj)
                if (attr != "__obj_id" && obj.hasOwnProperty(attr))
                    copy[attr] = cloneRecursive(obj[attr]);

            return copy;
        }


        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
    var cloneObj = cloneRecursive(obj);



    //remove the unique ids
    for (var i = 0; i < originalObjectsArray.length; i++) {
        delete originalObjectsArray[i].__obj_id;
    };

    return cloneObj;
}