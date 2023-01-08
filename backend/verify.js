function obj_contains(obj, arr){
    for(var i = 0; i < arr.length; ++i){
        if(!obj[arr[i]]) return false;
    }
    return true;
}

module.exports = {"obj_contains" : obj_contains};