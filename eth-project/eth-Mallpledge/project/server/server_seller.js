var server_web3 = require('./server_web3');
var params = require('../config/web3/params');
//

//获取WEB3实例
var web3 = server_web3.init();

//获取合约示例
var newcontract = server_web3.newcontract();
var server = {
    set: {
        
        set: async (data) => {
            //
            console.log("set server 34")
            let result; //结果集
            //参数结构
            let Parames_address = {}
            //
            var a = 'dddddd';
            //create data
            let encodeData_param_4 = web3.eth.abi.encodeParameter(
                'uint', '23'
            );
            let encodeData_function_4 = web3.eth.abi.encodeFunctionSignature('set(uint)');
            let encodeData_4 = encodeData_function_4 + encodeData_param_4.slice(2);


            let encodeData_param_5 = web3.eth.abi.encodeParameters(
                ['uint256', 'uint256'], ['12', '12']
            );
            let encodeData_function_5 = web3.eth.abi.encodeFunctionSignature('add(uint256,uint256)');
            let encodeData_5 = encodeData_function_5 + encodeData_param_5.slice(2);
            //
            //par
            let GasPrice;
            let TransCount;
// web3.eth.get
            await web3.eth.getGasPrice()
                .then(res => {
                    //
                    console.log("res=>", res * 2);
                    GasPrice = res * 10;
                })
                .catch(err => {
                    //
                    console.log("err=>", err);

                });
            //
            await web3.eth.getTransactionCount(params.address.from)
                .then(res => {
                    //
                    TransCount = res;
                    console.log("web3.eth.getTransactionCount =>", res)
                })
                .catch(err => {
                    //
                    console.log("err=>", err);
                })
            //  打包数据
            // web3.utils.toHex()
            let row = {
                Tx_nonce: web3.utils.toHex(TransCount),
                Tx_gasPrice: web3.utils.toHex(GasPrice), // TODO:
                Tx_gasLimit: web3.utils.toHex(8000000), // TODO:
                Tx_from: web3.utils.toHex(params.address.from), // TODO:
                Tx_to: web3.utils.toHex(params.address.constarnt1),
                Tx_value: "0x0", // TODO:
                // TODO:
                Tx_data: encodeData_4
            }


            //
            //  05  对接数据
            let rawTx = {
                nonce: row.Tx_nonce,
                gasPrice: row.Tx_gasPrice, // TODO:
                gasLimit: row.Tx_gasLimit,
                from: row.Tx_from,
                to: row.Tx_to,
                value: row.Tx_value, // TODO:
                data: row.Tx_data
            }
            //06.获取处理后的数据
            let SignData = server_web3.signdata({
                rawTx: rawTx,
                key: params.key

            });

            //    // let serializeTx = '0x' + tx.serialize().toString('hex');
            // //07.  发送
            web3.eth.sendSignedTransaction('0x' + SignData.toString('hex'))
                .on('confirmation', (confirmationNumber, receipt) => {
                    //
                    console.log("confirmation", confirmationNumber)
                })
                .on('transactionHash', (hash) => {
                    console.log('current TX hash: ', hash);
                    // hash.
                })
                .on('receipt', (receipt) => {
                    console.log("receipt=>", receipt.blockHash);
                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...', err);

                })
                .catch(err => {
                    console.log("err", err);
                });
            // 发送交易，使用事件获取返回结果
            // await newcontract.methods.add('12', '12').send({from: row.Tx_from})
            //     .on('transactionHash', function (hash) {
            //         console.log("transactionHash", hash);
            //     })
            //     .on('receipt', function (receipt) {
            //         console.log("receipt", receipt);
            //     })
            //     .on('confirmation', function (confirmationNumber, receipt) {
            //         console.log("confirmation", confirmationNumber);
            //     })
            //     .on('error', console.error);
            // console.log("sendSignedTransaction is ok ");
            //08.back
            console.log("select is ok");
            return "111"
        },

        demo: async (data) => {
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
        },

        setaffirm: async (data) => {
            console.log("调用合约方法开始 ||seller set setaffirm");
            console.log("data =>", data);
            //
            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/


            /*这边才是核心的交互智能合约和参数*/
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
            return "1";
        },

        setReceiptConf: async (data) => {
            console.log("调用合约方法开始 ||seller set setReceiptConf");
            console.log("data =>", data);
            //
            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/


            /*这边才是核心的交互智能合约和参数*/
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
            return "1";//todo
        },

        setmyrefuse: async (data) => {
            console.log("调用合约方法开始 ||商家拒绝方法");
            console.log("data =>", data);
            //
            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/


            /*这边才是核心的交互智能合约和参数*/
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
                    console.log("resceipt =>", rescipt);

                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...=>', err);
                    console.error("err=>，", receipt);
                })
                .catch(err => {
                    console.log("err=>", err);
                });
            //
            console.log("query  is ok ");
            return "1";//todo
        },

        setoppos: async (data) => {
            console.log("调用合约方法开始 ||商家拒绝方法");
            console.log("data =>", data);
            //
            /*  获取ROWS 数据*/
            var rows = await server_web3.web3_getrowdata({
                from: params.address.from,
                to: params.address.constarnt1
            });
            console.log("rows=>", rows);
            /*获取方法和方法参数编译后的ABI*/


            /*这边才是核心的交互智能合约和参数*/
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
                    console.log("resceipt =>", rescipt);

                })
                .on('error', (err, receipt) => {
                    console.error('catch an error after retry sendTransaction...=>', err);
                    console.error("err=>，", receipt);
                })
                .catch(err => {
                    console.log("err=>", err);
                });
            //
            console.log("query  is ok ");
            return "1";//todo
        },
    },
    get: {
        getdata: async (data) => {
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
        },
        getdata1: async (data) => {
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
        },
        demo: async (data) => {
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
        },
    }

}


//
module.exports = server;