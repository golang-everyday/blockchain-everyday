var Web3 = require('web3');
var parmasWeb3 = require('../config/web3/params');
const Tx = require('ethereumjs-tx');


var web3;
var web3server = {
    //

    init: () => {
        //
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            web3 = new Web3(new Web3.providers.HttpProvider(parmasWeb3.HttpProvider));
            // console.log("web init is ok");
        }
        //
        web3.eth.defaultAccount = '0x38a8DC14edE1DEf9C437bB3647445eEec06fF105';
        return web3;
    },

    newcontract: () => {
        //
        let abi = parmasWeb3.abi;
        let address = parmasWeb3.address;

        //init contract
        // var Contract_shop = web3.eth.Contract(parmasWeb3.abi, parmasWeb3.address);
        var Contract_shop = web3.eth.Contract(parmasWeb3.abi, parmasWeb3.address.constant, {});
        //
        // console.log("a", Contract_shop);
        return Contract_shop;
    },

    signdata: (data) => {
        //
        //  01.封装对象
        console.log("封装对象", data)
        let tx = new Tx(data.rawTx);
        //  02.序列化私钥
        let privateKey = web3server.web3_bufferPrivateKey(data.key);
        //  03. 用私钥给数据签名
        tx.sign(privateKey);
        //  04. 对数据编码
        // let serializeTx = '0x' + tx.serialize().toString('hex');
        let serializeTx = tx.serialize();
        //  05 返回
        return serializeTx;
    },

    web3_bufferPrivateKey: (value) => {
        // TODO:from

        const privateKey = new Buffer.from(value, 'hex');
        return privateKey;
    },
    /*获取未转马的*/
    web3_getrowdata: async (data) => {
        /*
        * data {
        *  from:
        *  to:
        *
        * }
        * */
        var arr = [];
        let noncenum;
        let gasprice;
        let gaslimit;
        let addressfrom;
        let addressto;
        /*获取指定地址的区块高度*/
        arr.push(web3.eth.getTransactionCount(data.from)
            .then(res => {
                //
                noncenum = res;
            }));
        /*获取当前的交易价格 测试中 可以加倍来提高交易速度*/
        arr.push(web3.eth.getGasPrice()
            .then(res => {
                gasprice = res * 8;
            }));
        /*汽油最多可以给到多少（这笔交易你愿意付出多少汽油）*/
        gaslimit = web3.utils.toHex(8000000);

        /*这个合约方法调用者 谁发起*/
        addressfrom = web3.utils.toHex(data.from);

        /*这个合约指向谁 调向谁 */
        addressto = web3.utils.toHex(data.to);

        await Promise.all(arr);

        /*最后拼接一个 RAWDATA*/
        var rawTx = {
            nonce: noncenum,
            gasPrice: gasprice,
            gasLimit: gaslimit,
            from: addressfrom,
            to: addressto
        }
        return rawTx;
    },
    /**/
    web3_encodeParaandFunc: (data) => {
        /*
        * data {
        *  func:xx,
        *  params:{
        *  type:xxx,
        *  para:xxx
        *  }
        *
        * }
        * */
        //方法名
        let encodeData_function = web3.eth.abi.encodeFunctionSignature(data.func);
        //参数
        let encodeData_param = web3.eth.abi.encodeParameter(
            data.params.type, data.params.para
        );


        let encodeData_4 = encodeData_function + encodeData_param.slice(2);
        return encodeData_4;
    },

    /*验证地址是否是合法地址*/
    web3_AddressIsLegal: (adddress) => {
        //
        //     web3.utils.isAddress('0xc1912fee45d61c87cc5ea59dae31190fffff232d');
        // > true
        //     web3.utils.isAddress('c1912fee45d61c87cc5ea59dae31190fffff232d');
        // > true
        return web3.utils.isAddress(adddress);
    },


    /*验证地址是否在黑名单中*/
    web3_inBlackList: (address) => {
        //
        return address;

    },

    /*验证物品信息价格 总价 以及*/
    web3_wpList: (data) => {
        //


    },

    /*验证TOKEN 是否合法*/
    web3_token: (data) => {
        //


    },

    /*验证自动结算时间*/
    web3_isTime: (data) => {
        //

    },

    /*验证价格和押金的关系*/
    web3_DepositandPrincipal: (data) => {
        //

    }
}
module.exports = web3server;