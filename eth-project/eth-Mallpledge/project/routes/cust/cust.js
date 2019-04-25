var router = require('koa-router')();


// 子模块
var server = require('../../server/server');
var configfunc = require('../../config/func/func');
var common = require('../../server/common');

// 客户方法集合 cust

/*押金 付款 加入  控制中心   客户
*   客户下单确认 把 客户信息 商家信息 物品信息   本金 押金
*   1. 数据 校验 是否合法
*   2. 数据 调用服务 调曲智能合约进行数据 写入
*   3. 返回结果 处理 若错误 处理， 若正常 下一步
*   4. 返回前台状态
* */
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
    console.log("data=>", data);
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
    let result = server(
        configfunc.cust,
        configfunc.cust.set,
        configfunc.cust.set.setdata,
        data
    );

    //返回上中心结果
    ctx.body = result;
    //

});

//客户确认  127.0.0.1:3000/cust/setaffirm
router.post('/setaffirm', async (ctx, next) => {
    //确认的是一个HASH
    let data = ctx.request.body;
    //
    let verification = common.routerVerification(data);
    //
    if (!verification) {

    }
    //调用 服务
    let result = server(
        configfunc.cust,
        configfunc.cust.set,
        configfunc.cust.set.setaffirm,
        data
    );

    //返回上中心结果
    ctx.body = result;
});

//客户拒绝  127.0.0.1:3000/cust/setmyrefuse
router.post('/setmyrefuse', async (ctx, next) => {

    //只有在开始双方抵押上合约的时候会用的所有的参数 其他 同意或者拒绝都只需要
        //ADDRESS + HASH  +1，2 表示是商户还是客户

    let data = ctx.request.body;

    let verification = common.routerVerification(data);

    if (!verification) {

    }

    //调用 服务
    let result = server(
        configfunc.cust,
        configfunc.cust.set,
        configfunc.cust.set.setmyrefuse,
        data
    );

    //BACK
    ctx.body = result;

});

// 回应商家拒绝 127.0.0.1:3000/cust/setoppositerefuse
router.post('/setoppositerefuse', async (ctx, next) => {

    //只有在开始双方抵押上合约的时候会用的所有的参数 其他 同意或者拒绝都只需要
    //ADDRESS + HASH  +1，2 表示是商户还是客户

    let data = ctx.request.body;

    let verification = common.routerVerification(data);

    if (!verification) {

    }

    //调用 服务
    let result = server(
        configfunc.cust,
        configfunc.cust.set,
        configfunc.cust.set.setoppos,
        data
    );

    //BACK
    ctx.body = result;

});






// 导出
module.exports = router.routes();
