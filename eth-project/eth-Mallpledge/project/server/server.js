//
var configfunc = require('../config/func/func');
var server_seller = require('./server_seller');
var server_cust = require('./server_cust');


//server
var server = async (fType, fFunc, fFuncName, fData) => {
    //
    var result = "";

    switch (fType) {

        case configfunc.seller:
            result = await servertype.seller(fFunc, fFuncName, fData);
            break;

        case configfunc.cust:
            result = await servertype.cust(fFunc, fFuncName, fData);
            break;

        default:
            console.log("2");
    }
    return result;
}

var servertype = {
    seller: async (fFunc, fFuncName, fData) => {
        //
        switch (fFunc) {

            case configfunc.seller.set:
                result = await serverfunc.seller.set(fFuncName, fData);
                break;

            case configfunc.seller.get:
                result = await serverfunc.seller.get(fFuncName, fData);
                break;

            case 1:
                console.log("1");
            default:
                console.log("2");
        }
    },
    cust: async (fFunc, fFuncName, fData) => {

        switch (fFunc) {

            case configfunc.cust.set:
                result = await serverfunc.cust.set(fFuncName, fData);
                break;

            case configfunc.cust.get:
                result = await serverfunc.cust.get(fFuncName, fData);
                break;

            default:
                console.log("2");
        }
    }


}

var serverfunc = {
    //
    seller: {
        set: async (fFuncName, fData) => {
            //
            var result = '';
            switch (fFuncName) {

                case configfunc.seller.set.setdata:
                    result = await server_seller.set.demo(fData);
                    break;

                case configfunc.seller.set.setaffirm:
                    result = await server_seller.set.setaffirm(fData);
                    break;

                case configfunc.seller.set.setReceiptConf:
                    result = await server_seller.set.setReceiptConf(fData);
                    break;

                case configfunc.seller.set.setmyrefuse:
                    result = await server_seller.set.setmyrefuse(fData);
                    break;

                case configfunc.seller.set.setoppos:
                    result = await server_seller.set.setoppos(fData);
                    break;

                default:
                    console.log("2");
            }
            return result;

        },
        get: async (fFuncName, fData) => {
            //
            var result = '';
            switch (fFuncName) {

                case configfunc.seller.set.setdata:
                    result = await server_seller.demo(fData);
                    break;

                case 1:
                    console.log("1");

                default:
                    console.log("2");

            }
            return result;

        }

    },
    cust: {
        set: async (fFuncName, fData) => {
            //
            var result = '';
            switch (fFuncName) {

                case configfunc.cust.set.setdata:
                    result = await server_cust.set.setdata(fData);
                    break;

                case configfunc.cust.set.setaffirm:
                    result = await server_cust.set.setaffirm(fData);
                    break;

                case configfunc.cust.set.setmyrefuse:
                    result = await server_cust.set.setmyrefuse(fData);
                    break;

                case configfunc.cust.set.setrefuse:
                    console.log("1");
                    break;

                case configfunc.cust.set.setoppos:
                    result = await server_cust.set.setoppos(fData);
                    break;

                default:
                    console.log("2");
            }
            return result;
        },
        get: async (fFuncName, fData) => {
            //
            var result = '';
            switch (fFuncName) {

                case configfunc.seller.set.setdata:
                    result = await server_seller.demo(fData);
                    break;

                case 1:
                    console.log("1");

                default:
                    console.log("2");

            }
            return result;
        }

    },


}


var serverfunc1 = async (fFuncName, fData) => {
    //
    var result = '';
    switch (fFuncName) {
        case configfunc.seller.set.setdata:
            //
            result = await server_seller.demo(fData);
            break;

        case 1:
            console.log("1");


        default:
            console.log("2");
    }
    return result;


}


//
module.exports = server;