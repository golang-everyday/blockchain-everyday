var server_web3 = require('./server_web3');



var common = {

    routerVerification: (data) => {
        //
        /*参数校验
   *   1. 首先校验2个地址是否合法 是否是在白名单中
   *   2. 然后校验物品信息 单价 数量 总价 是否正确
   *   3. 验证币种
   *   4. 验证自动结算时间
   *   5. 双方
   *
   * */
        var state = {}

        // 1.验证 商家地址和和客户地址是否合法
        let sellerstate = server_web3.web3_AddressIsLegal();
        let custstate = server_web3.web3_AddressIsLegal();
        //如果不合法 退出
        if (sellerstate || custstate) {
            return "wrong"
        }

        //验证 商家地址和客户地址是否在黑名单中
        let resa = server_web3.web3_inBlackList(data.from);
        let resb = server_web3.web3_inBlackList(data.to);

        //如果在黑名单退出
        if (resa || resb) {
            //
            return "in block"
        }

        //验证 物品列表信息是否正确 单价 数量 总价 名称  规格
        let wp = server_web3.web3_wpList(data.data);

        //如果信息有错误
        if (wp) {
            return "wp is wrong"
        }
        //验证 是否是可支持的TOKEN
        let result_token = server_web3.web3_token(data.token);
        //如果不是支持的TOKEN  退出
        if (result_token) {
            return
        }

        //验证 自动结算时间  并将此交易存入轮询器中
        let result_time = server_web3.web3_isTime(data.time);

        //如果 自动结算时间有误 退出
        if (result_time) {
            return
        }

//数据检验完毕后，确认数据正确真实性，然后上处理中心

        // 中心数据 ：『
        // 商DepositandPrincipal家：价格，押金， STATE，STATE    HASH
        // 客户：价格，押金， STATE，STATE    HASH
        // 』

        // 验证 押金 是本金 的2倍数
        let result_dep = server_web3.web3_DepositandPrincipal(data);

        //  如果错误 退出
        if (result_dep) {
            //
            return
        }

        /* 如果走到这里，说明数据校验结束且数据符合规则， 然后调用服务，
        * 上联数据格式是： HASH + 商家地址+押金+本金+时间
        * 上联数据格式是： HASH + 客户地址+押金+本金+时间
        * */
        return "routerVerification is ok "
    }
}


//导出
module.exports = common;