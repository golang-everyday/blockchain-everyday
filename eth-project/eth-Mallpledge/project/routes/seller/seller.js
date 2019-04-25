var router = require('koa-router')();


//子模块
var server = require('../../server/server');
var configfunc = require('../../config/func/func');
var server_web3 = require('../../server/server_web3');
var server_error = require('../../server/server_error');
var common = require('../../server/common');

//商家方法 SELLER

/*加入 控制中心
 *@押金 本金 加入  控制中心
 *@for
 *@param
 *@return {1:hash} 返回值说明
 */
router.post('/setdata', async (ctx, next) => {
    /**
     *
     *  {
     *    //shangjian
     *   name:"zhangshan",
     *   address:"xjuasudijor",
     *   wplist"[],
     *   yajing:"3000",
     *   jiage:'30',
     *   time:'',
     *   mark:'',
     *   tokenTpye:"",
     *
     *   //maijian
     *
     *   //
     *   name:"",
     *   address:"",
     *   jiage:'',
     *   remark:'',
     *   tokenType:'',
     *  }
     *
     */
        // 接收前台的数据
    let data = ctx.request.body;
    console.log("data=>", data);
    /*参数校验
    *   1. 首先校验2个地址是否合法 是否是在白名单中
    *   2. 然后校验物品信息 单价 数量 总价 是否正确
    *   3. 验证币种
    *   4. 验证自动结算时间
    *   5. 双方
    *
    * */

    // 1.验证 商家地址和和客户地址是否合法
    let sellerstate = server_web3.web3_AddressIsLegal();
    let custstate = server_web3.web3_AddressIsLegal();
    //如果不合法 退出
    if (sellerstate || custstate) {
        return server_error.sellerAddressFailed;
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
    // 商家：价格，押金， STATE，STATE    HASH
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
    //调用函数处理
    await server(configfunc.seller, configfunc.seller.set, configfunc.seller.set.setdata, data);
    //返回上中心结果
    ctx.body = "zhiyachenggong";
    //

});

/*发货确认
 *@
 *@for
 *@param
 *@return {1:hash} 返回值说明
 */
router.post('/setaffirm', async (ctx, next) => {

    /* id+ 数据 单号 +钱包地址
    *
    * */
    /*参数校验
        *   1. 首先校验2个地址是否合法 是否是在白名单中
        *   2. 然后校验物品信息 单价 数量 总价 是否正确
        *   3. 验证币种
        *   4. 验证自动结算时间
        *   5. 双方
        *
        * */
    let data = ctx.request.body;
    //数据检验完毕后，确认数据正确真实性，然后上处理中心
    // 接收前台的数据
    console.log("data=>acide-setaffirm", data);
    // 中心数据 ：『
    // 商家：价格，押金， STATE，STATE    HASH
    // 客户：价格，押金， STATE，STATE    HASH
    // 』
    let verification = common.routerVerification(data);

    if (!verification) {

    }
    //
    /*await server(
        configfunc.seller,                      //请求种类
        configfunc.seller.set,                  //函数属性
        configfunc.seller.set.setdata,          //函数名称
        data                                    //请求数据
        );*/

    let result = await server(
        configfunc.seller,
        configfunc.seller.set,
        configfunc.seller.set.setaffirm,
        data);
    ctx.body = result;
    //

});

/*收货确认
 *@
 *@for
 *@param
 *@return {1:hash} 返回值说明
 */
router.post('/setReceiptConf', async (ctx, next) => {
//上联数据格式是： HASH + 商家地址+押金+本金+时间
    //去调用 方法
    let data = ctx.request.body;

    let verification = common.routerVerification(data);

    if (!verification) {

    }

    //

    let result = await server(
        configfunc.seller,
        configfunc.seller.set,
        configfunc.seller.set.setReceiptConf,
        data);
    //back
    ctx.body = result;

});
//

/*商家拒绝
 *@押金 本金 加入  控制中心
 *@for
 *@param
 *@return {1:hash} 返回值说明
 */
//127.0.0.1:3000/seller/setmyrefuse
router.post('/setmyrefuse', async (ctx, next) => {


    //只有在开始双方抵押上合约的时候会用的所有的参数 其他 同意或者拒绝都只需要
    //ADDRESS + HASH  +1，2 表示是商户还是客户

    let data = ctx.request.body;

    let verification = common.routerVerification(data);

    if (!verification) {

    }

    //调用 服务
    let result = server(
        configfunc.seller,
        configfunc.seller.set,
        configfunc.seller.set.setmyrefuse,
        data
    );

    //BACK
    ctx.body = result;
    //

});

//商家回应拒绝
//127.0.0.1:3000/seller/setmyrefuse
router.post('/setoppositerefuse', async (ctx, next) => {


    //只有在开始双方抵押上合约的时候会用的所有的参数 其他 同意或者拒绝都只需要
    //ADDRESS + HASH  +1，2 表示是商户还是客户

    let data = ctx.request.body;

    let verification = common.routerVerification(data);

    if (!verification) {

    }

    //调用 服务
    let result = server(
        configfunc.seller,
        configfunc.seller.set,
        configfunc.seller.set.setoppos,
        data
    );

    //BACK
    ctx.body = result;
    //

});


//单例模型
router.post('/demo', async (ctx, next) => {

    /* id+ 数据 单号 +钱包地址
    *
    * */
    /**
     *
     *  {
     *    //shangjian
     *   name:"zhangshan",
     *   address:"xjuasudijor",
     *   wplist"[],
     *   yajing:"3000",
     *   jiage:'30',
     *   time:'',
     *   mark:'',
     *   tokenTpye:"",
     *
     *   //maijian
     *
     *   //
     *   name:"",
     *   address:"",
     *   jiage:'',
     *   remark:'',
     *   tokenType:'',
     *  }
     *
     */
        // 接收前台的数据
    let data = ctx.request.body;
    console.log("data=>", data);
    /*参数校验
    *   1. 首先校验2个地址是否合法 是否是在白名单中
    *   2. 然后校验物品信息 单价 数量 总价 是否正确
    *   3. 验证币种
    *   4. 验证自动结算时间
    *   5. 双方
    *
    * */

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
    //调用函数处理
    await server(configfunc.seller, configfunc.seller.set, configfunc.seller.set.setdata, data);
    //返回上中心结果
    ctx.body = "zhiyachenggong";

});



//导出
module.exports = router.routes();
