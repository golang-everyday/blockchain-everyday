var Koa = require('koa')
    , logger = require('koa-logger')
    , json = require('koa-json')
    , views = require('koa-views')
    , cors = require('koa2-cors')
    , bodyParser = require('koa-bodyparser')
    , router = require('koa-router')()
    , onerror = require('koa-onerror');

/* 子模块*/
var seller = require('./routes/seller/seller');
var cust = require('./routes/cust/cust');

var app = new Koa();
// error handler
onerror(app);

router.get('/', (ctx) => {

    ctx.body = '这是一个首页';
});


/*
  /admin   配置子路由  层级路由

 /admin/user
 */

router.use('/seller', seller);
router.use('/cust', cust);


// global middlewares 设置跨域请求
app.use(cors({
    origin: (ctx) => {
        return "*";
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// KOA 配置
app.use(bodyParser());

// KOA 配置路由
app.use(router.routes());   /*启动路由*/

//配置中间件
app.use(router.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});


//导出
module.exports = app;
