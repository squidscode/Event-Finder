const Http = new XMLHttpRequest();
// const url='http://50.116.37.108:3000';
const url='http://squidscode.com:3000';

function encodeBasicUserPassword(username, password){
    let str = username + ":" + password;
    return "Basic " + btoa(str);
}

// reqType is the type of request,
// urlEndpoint starts with a '/' and the endpoint of the backend
// api we wish to communicate with.
// headers is an array of arrays with two elements, each of which will be
// loaded into the http request
function send(reqType, urlEndpoint, headers, reqBody, callback){
    Http.open(reqType, url + urlEndpoint);

    Http.setRequestHeader('Content-Type', 'application/json');
    for(let ind in headers){
        Http.setRequestHeader(headers[ind][0], headers[ind][1]);
    }

    if(reqBody !== null && reqBody !== ""){
        Http.send(JSON.stringify(reqBody));
    }else{
        Http.send();
    }
    

    let response;
    Http.onreadystatechange = (e) => {
        try{
            response = JSON.parse(Http.response);
        }catch(error){
            return;
        }
        
        // console.log(response);
        callback(Http.status, response);
    }
}

export {send, encodeBasicUserPassword};