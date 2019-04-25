var server_web3 = require('./server_web3');
var params = require('../config/web3/params');
//
var web3 = server_web3.init();
var newcontract = server_web3.newcontract();

//
var server = {
    set: {

        setdata: async (data) => {
            console.log("调用合约方法开始 setdata");
            //
            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,//TODO
                to: params.address.constarnt1 //TODO
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/
            let encodedata = server_web3.web3_encodeParaandFunc({
                func: "set(uint256)",
                params: {
                    type: 'uint',
                    para: '23'
                }
            });
            console.log("encodedata=>", encodedata);
            /*拼接ROWS 数据*/
            var row = {
                Tx_nonce: web3.utils.toHex(rows.nonce),
                Tx_gasPrice: web3.utils.toHex(rows.gasPrice),
                Tx_gasLimit: rows.gasLimit,
                Tx_from: rows.from,
                Tx_to: rows.to,
                Tx_data: encodedata
            }

            /*对接ROW 数据*/
            let rawTx = {
                nonce: row.Tx_nonce,
                gasPrice: row.Tx_gasPrice, // TODO:
                gasLimit: row.Tx_gasLimit,
                from: row.Tx_from,
                to: row.Tx_to,
                data: row.Tx_data
            }
            /*获取私密钥 签名的ROW数据*/
            let SignData = server_web3.signdata({
                rawTx: rawTx,
                key: params.key

            });

            /*WEB3 发起请求 然后 查看状态，此时 一个业务就走完整*/

            await web3.eth.sendSignedTransaction('0x' + SignData.toString('hex'))
                .on('transactionHash', (hash) => {
                    //
                    console.log("hash = >", hash)

                })
                .on('receipt', (rescipt) => {
                    //
                    console.log("receipt =>", rescipt);
                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...', err);
                    console.error("err", receipt);
                })
                .catch(err => {
                    console.log("err", err);
                });
            //
            console.log("query  is ok router cust set setdata ");
            return
            "1";
        },

        setaffirm: async (data) => {
            console.log("调用合约方法开始 确认客户接受到物品，确认收到");

            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/
            let encodedata = server_web3.web3_encodeParaandFunc({
                func: "set(uint256)",
                params: {
                    type: 'uint',
                    para: '23'
                }
            });
            console.log("encodedata=>", encodedata);
            /*拼接ROWS 数据*/
            var row = {
                Tx_nonce: web3.utils.toHex(rows.nonce),
                Tx_gasPrice: web3.utils.toHex(rows.gasPrice),
                Tx_gasLimit: rows.gasLimit,
                Tx_from: rows.from,
                Tx_to: rows.to,
                Tx_data: encodedata
            }

            /*对接ROW 数据*/
            let rawTx = {
                nonce: row.Tx_nonce,
                gasPrice: row.Tx_gasPrice, // TODO:
                gasLimit: row.Tx_gasLimit,
                from: row.Tx_from,
                to: row.Tx_to,
                data: row.Tx_data
            }
            /*获取私密钥 签名的ROW数据*/
            let SignData = server_web3.signdata({
                rawTx: rawTx,
                key: params.key

            });

            /*WEB3 发起请求 然后 查看状态，此时 一个业务就走完整*/

            await web3.eth.sendSignedTransaction('0x' + SignData.toString('hex'))
                .on('transactionHash', (hash) => {
                    //
                    console.log("hash = >", hash)
                })
                .on('receipt', (rescipt) => {
                    //
                    console.log("receipt =>", rescipt);
                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...', err);
                    console.error("error receipt=>", receipt);
                })
                .catch(err => {
                    console.log("err", err);
                });
            //
            console.log("query is ok ");
            return "1";
        },

        //客户本人拒绝方法
        setmyrefuse: async (data) => {
            console.log("调用合约方法开始 客户本人拒绝方法");

            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/
            let encodedata = server_web3.web3_encodeParaandFunc({
                func: "set(uint256)",
                params: {
                    type: 'uint',
                    para: '23'
                }
            });
            console.log("encodedata=>", encodedata);
            /*拼接ROWS 数据*/
            var row = {
                Tx_nonce: web3.utils.toHex(rows.nonce),
                Tx_gasPrice: web3.utils.toHex(rows.gasPrice),
                Tx_gasLimit: rows.gasLimit,
                Tx_from: rows.from,
                Tx_to: rows.to,
                Tx_data: encodedata
            }

            /*对接ROW 数据*/
            let rawTx = {
                nonce: row.Tx_nonce,
                gasPrice: row.Tx_gasPrice, // TODO:
                gasLimit: row.Tx_gasLimit,
                from: row.Tx_from,
                to: row.Tx_to,
                data: row.Tx_data
            }
            /*获取私密钥 签名的ROW数据*/
            let SignData = server_web3.signdata({
                rawTx: rawTx,
                key: params.key

            });

            /*WEB3 发起请求 然后 查看状态，此时 一个业务就走完整*/

            await web3.eth.sendSignedTransaction('0x' + SignData.toString('hex'))
                .on('transactionHash', (hash) => {
                    //
                    console.log("hash = >", hash)
                })
                .on('receipt', (rescipt) => {
                    //
                    console.log("receipt =>", rescipt);
                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...=>', err);
                    if (err) {
                        if (receipt && receipt.status) {
                            //
                            console.log('the retry tx has already got the receipt=>', receipt);
                        }
                    }
                })
                .catch(err => {
                    console.log("err", err);
                });
            //
            console.log("query is ok ");
            return "1";
        },

        //回应商家决绝
        setoppos: async (data) => {
            console.log("调用合约方法开始 回应商家决绝");

            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/
            let encodedata = server_web3.web3_encodeParaandFunc({
                func: "set(uint256)",
                params: {
                    type: 'uint',
                    para: '23'
                }
            });
            console.log("encodedata=>", encodedata);
            /*拼接ROWS 数据*/
            var row = {
                Tx_nonce: web3.utils.toHex(rows.nonce),
                Tx_gasPrice: web3.utils.toHex(rows.gasPrice),
                Tx_gasLimit: rows.gasLimit,
                Tx_from: rows.from,
                Tx_to: rows.to,
                Tx_data: encodedata
            }

            /*对接ROW 数据*/
            let rawTx = {
                nonce: row.Tx_nonce,
                gasPrice: row.Tx_gasPrice, // TODO:
                gasLimit: row.Tx_gasLimit,
                from: row.Tx_from,
                to: row.Tx_to,
                data: row.Tx_data
            }
            /*获取私密钥 签名的ROW数据*/
            let SignData = server_web3.signdata({
                rawTx: rawTx,
                key: params.key

            });

            /*WEB3 发起请求 然后 查看状态，此时 一个业务就走完整*/

            await web3.eth.sendSignedTransaction('0x' + SignData.toString('hex'))
                .on('transactionHash', (hash) => {
                    //
                    console.log("hash = >", hash)
                })
                .on('receipt', (rescipt) => {
                    //
                    console.log("receipt =>", rescipt);
                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...=>', err);
                    if (err) {
                        if (receipt && receipt.status) {
                            //
                            console.log('the retry tx has already got the receipt=>', receipt);
                        }
                    }
                })
                .catch(err => {
                    console.log("err", err);
                });
            //
            console.log("query is ok ");
            return "1";
        },
        //
    },
    get: {
        getdata: async (data) => {
            //

            console.log("调用合约方法开始");
            //
            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/
            let encodedata = server_web3.web3_encodeParaandFunc({
                func: "set(uint256)",
                params: {
                    type: 'uint',
                    para: '23'
                }
            });
            console.log("encodedata=>", encodedata);
            /*拼接ROWS 数据*/
            var row = {
                Tx_nonce: web3.utils.toHex(rows.nonce),
                Tx_gasPrice: web3.utils.toHex(rows.gasPrice),
                Tx_gasLimit: rows.gasLimit,
                Tx_from: rows.from,
                Tx_to: rows.to,
                Tx_data: encodedata
            }

            /*对接ROW 数据*/
            let rawTx = {
                nonce: row.Tx_nonce,
                gasPrice: row.Tx_gasPrice, // TODO:
                gasLimit: row.Tx_gasLimit,
                from: row.Tx_from,
                to: row.Tx_to,
                data: row.Tx_data
            }
            /*获取私密钥 签名的ROW数据*/
            let SignData = server_web3.signdata({
                rawTx: rawTx,
                key: params.key

            });

            /*WEB3 发起请求 然后 查看状态，此时 一个业务就走完整*/

            web3.eth.sendSignedTransaction('0x' + SignData.toString('hex'))
                .on('transactionHash', (hash) => {
                    //
                    console.log("hash = >", hash)

                })
                .on('receipt', (rescipt) => {
                    //
                    console.log("resceipt =>", rescipt);
                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...', err);
                    console.error("err", receipt);
                })
                .catch(err => {
                    console.log("err", err);
                });
            //
            console.log("query  is ok ");
            return
            "1";
        }
    }

}


//
module.exports = server;