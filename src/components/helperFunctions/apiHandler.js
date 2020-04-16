let server = `https://${process.env.REACT_APP_FUNCTION_DOMAIN}`;

async function apiHandler(method, address, body) {
    let reqAddress = server;
    if (address) {
        reqAddress += address;
    }
    let reqObject = {
        method: method,
        body: body,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    let resultPromise = new Promise((resolve, reject) => {
        fetch(reqAddress, reqObject)
            .then(async function(response) {
                let responseObject = await response.json();
                let { error } = await responseObject;
                if (response.ok && !error) {
                    resolve(responseObject);
                } else {
                    let result = { error: true, response: responseObject };
                    if (responseObject.message) {
                        result.message = responseObject.message;
                    }
                    reject(result);
                }
            })
            .catch(error => {
                let result = { error: true, networkError: true, response: error };
                reject(result);
            });
    });
    return resultPromise;
}

export default apiHandler;
