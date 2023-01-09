/**
 * Splits auth string provided by the basic authorization
 * 
 * @param {string} auth_str the auth string
 * @returns null if the auth string is incorrectly formatted, 
 * an object with "username" and "password" fields otherwise.
 */
function parse_basic_authorization(auth_str){
    if(auth_str == null) return null;
    if(auth_str.split(" ").length != 2) return null;
    str = atob(auth_str.split(" ")[1]);
    str_arr = str.split(":");
    if(str_arr.length != 2){
        return null;
    }else{
        return {"username":str_arr[0], "password":str_arr[1]};
    }
}

function is_admin(username, password){
    return (username == "admin" && password == "admin"); // Changed in deployment, nice try...
}

module.exports = {"parse_basic_authorization":parse_basic_authorization, "is_admin": is_admin};
