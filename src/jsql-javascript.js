/*
 * Copyright (c) 2017-2019 JSQL Sp. z.o.o. (Ltd, LLC) www.jsql.it
 * See LICENSE or https://jsql.it/public-packages-license
 */

'use strict';

/**
 * Override @request function
 * @param requestUrl
 * @param requestData
 * @param requestHeaders
 * @returns promise
 */
JSQL.prototype.request = function (requestUrl, requestData, requestHeaders) {

    var _JSQL = this;

    var promise = {
        xhr: null,
        successResult: null,
        status: null,
        errorResult: null,
        queue: [],
        init: function(){

            var self = this;

            this.xhr = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
            this.xhr.open('POST', requestUrl, 1);
            this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            _JSQL.each(requestHeaders, function(headerName, headerValue){
                self.xhr.setRequestHeader(headerName, headerValue);
            });

            this.xhr.onreadystatechange = function () {

                    if (self.xhr.readyState === 4 && self.xhr.status === 200) {

                        try {
                            self.successResult = JSON.parse(self.xhr.responseText);
                        }catch (e){
                            self.successResult = '';
                        }

                        self.cleanQueue();

                    }else if(self.xhr.readyState === 4 && self.xhr.status !== 200) {

                        try {
                            self.errorResult = JSON.parse(self.xhr.responseText);
                        }catch (error){
                            self.errorResult = self.xhr.responseText;
                        }

                        self.cleanQueue();

                    }

            };

            this.xhr.send(JSON.stringify(requestData));

            return promise;
        },

        exec: function(element, verify){

            var notPassed = true;

            switch (element.type){
                case 'success' :
                    if(this.successResult !== null) {
                        element.callBack(this.successResult, this.xhr);
                        notPassed = false;
                    }
                    break;
                case 'error' :
                    if(this.errorResult !== null) {
                        element.callBack(this.errorResult, this.xhr);
                        notPassed = false;
                    }
                    break;
                case 'always' :
                    if(this.errorResult !== null || this.successResult !== null) {
                        element.callBack(this.errorResult || this.successResult, self.xhr.responseText, this.xhr);
                        notPassed = false;
                    }
                    break;
            }

            if(notPassed && verify === true){
                this.queue.push(element);
            }

        },

        cleanQueue: function(){

            for(var i = 0; i < this.queue.length; i++){
                this.exec(this.queue[i], false);
            }

            this.queue = [];

        },

        success: function(callBack){

            this.exec({
                type: 'success',
                callBack: callBack
            }, true);

            return promise;
        },
        error: function(callBack){

            this.exec({
                type: 'error',
                callBack: callBack
            }, true);

            return promise;
        },
        always: function(callBack){

            this.exec({
                type: 'always',
                callBack: callBack
            }, true);

            return promise;
        }

    };

    return promise.init();

};

/**
 * Overridie @wrap function
 * @param token
 * @param queryType
 * @returns promise
 */
JSQL.prototype.wrap = function (token, queryType) {
    return this.construct(token, queryType);
};
