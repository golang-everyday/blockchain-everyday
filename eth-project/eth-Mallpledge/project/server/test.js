//导入包
const Web3 = require("web3");

var web3 = new Web3();
//init contractname
var Contract_Token;
var Contract_Drop;
var Contract_TokenMgr;
/*方法说明
 *@method 方法名
 *@for 所属类名
 *@param{参数类型}参数名 参数说明
 *@return {返回值类型} 返回值说明
 */
/**Read me
 * 1.简称(Token=>T,Drop=>D,TokenMgr=>M)
 * 2.Actions_data=>参数初始化(各种初始化参数)
 * 3.Actions_Koa=>Koa框架以及Koa插件初始化和启动配置(Koa相关)
 * 4.Actions_Router=>router路由的get方法，post方法配置
 * 5.Actions_initWeb3Provider=>web3js相关初始化参数(web3,合约实例等)
 * 6.Actions_Web3jsCommonMethod=>webjs常用的方法(获取各种参数)
 * 7.Actions_Web3jsUtils=>web3js相关的工具方法(转换,校验等)
 * 8.Actions_Contrant_Token=>skt测试代币的相关方法的实现(Token)
 * 9.Actions_Contrant_Drop=> 空投合约的相关方法的实现(Drop)
 *10.Actions_Contrant_TokenMgr=>项目之前空投合约的相关方法的实现(TokenMgr)
 *11.Actions_Configure=>项目相关配置信息()
 *12.Json_list=>常量信息的相关管理(abi,合约地址,gas参数,等)
 *13.Json_Bz=>其它备注信息(追加,扩展)
 */

//5.Actions_initWeb3Provider=>web3js相关初始化参数(web3,合约实例等)
var Actions_initWeb3Provider = {

    /**
     * @initWeb{初始化web对象}
     */
    initWeb3: () => {
        //创建一个web3实例，设置一个provider,成功引入后，就可以用web3的api
        if (typeof web3 == 'undefined') {
            web3 = new Web3(web3.currentProvider); //新建web3对象
            console.log("web3js is undefined");
        } else {
            // TODO:
            web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/ee23e77aa14846d88eb5cad3d59e37f2"));
            //

        } //设置一个provider
        // TODO: web3.utils.isAddress(address)
        console.log("web3=>实例化完成.....");
        console.log("web3.currentProvider=>", web3.currentProvider);
        console.log("web3是否连接成功=>", web3.isConnected());
        console.log("默认账户=>", web3.eth.defaultAccount);
        console.log("默认区块=>", web3.eth.defaultBlock);
        // TODO: 设置默认账户
        web3.eth.defaultAccount = '0x38a8DC14edE1DEf9C437bB3647445eEec06fF105';
        console.log("默认账户=>", web3.eth.defaultAccount);
    },

    /**
     * @initContract_Token{初始化Token代币合约实例}
     */
    initContract_Token: () => {
        // TODO:
        let Abi_Token = UR_DrcToken;
        let Address_Token = UR_Contract_addresss.token.address;
        //Token  实例化
        Contract_Token = web3.eth.contract(Abi_Token).at(Address_Token);
        // TODO:
        console.log("Token合约实例完成=>");
    },

    /**
     * @initContract_Drop{初始化Drop空投合约初始化实例}
     */
    initContract_Drop: () => {
        // TODO:
        let Abi_Drop = UR_DrcAirDrop;
        let Address_Drop = UR_Contract_addresss.airDrop.address;
        //Token  实例化
        Contract_Drop = web3.eth.contract(Abi_Drop).at(Address_Drop);
        // TODO:
        console.log("Contract_Drop合约实例完成=>");
    },

    /**
     * @initContract_TokenMgr{初始化Drop空投合约初始化实例}
     */
    initContract_TokenMgr: () => {
        // // TODO:
        // let Abi_TokenMgr = "";
        // let Address_TokenMgr = "";
        // //TokenMgr  实例化
        // var Contract_drop = web3.eth.constant(Abi_TokenMgr).at(Address_TokenMgr);
    }

}
Actions_initWeb3Provider.initWeb3();

