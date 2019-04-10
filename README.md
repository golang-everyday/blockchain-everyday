# blockchain-everyday

[![jaywcjlove/sb](https://jaywcjlove.github.io/sb/ico/awesome.svg)](https://github.com/sindresorhus/awesome) [![jaywcjlove/sb](https://jaywcjlove.github.io/sb/lang/chinese.svg)](README-zh.md) [![License](https://img.shields.io/github/license/blockchain-everyday/blockchain-everyday.svg)](https://jitpack.io/#blockchain-everyday/blockchain-everyday)  [![Stars](https://img.shields.io/github/stars/golang-everyday/golang-everyday.svg)](https://jitpack.io/#blockchain-everyday/blockchain-everyday)  [![Forks](https://img.shields.io/github/forks/golang-everyday/golang-everyday.svg)](https://jitpack.io/#blockchain-everyday/blockchain-everyday) [![Issues](https://img.shields.io/github/issues/golang-everyday/golang-everyday.svg)](https://jitpack.io/#blockchain-everyday/blockchain-everyday)
[![Author](https://img.shields.io/badge/Author-GolangEverydayGroup-black.svg?)](https://github.com/blockchain-everyday)
[![Author](https://img.shields.io/badge/QQ-812397431-yellow.svg?)](http://wpa.qq.com/msgrd?v=3&uin=812397431&site=qq&menu=yes)



## 目录

- [以太坊](#以太坊)

- [超级账本](#超级账本)
- [EOS](#EOS)
- [比特币](#比特币)
- [钱包](#钱包)
- [浏览器](#浏览器)
- [交易所](#交易所)



## 以太坊 

### 源码分析

* [钱包账户源码分析](<https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/%E9%92%B1%E5%8C%85%E8%B4%A6%E6%88%B7.md>)

### RLP

- 以太坊RLP编码的坑
  - rlp编码对空指针的解码会报错，所以要编码的对象最好不要有指针类型。
  - rlp对`[]byte`的支持也是，如果某字段是`[]byte`类型，而且值是`nil`，那么编码后再解码就会变成非空的：`[]byte{}`
  - rlp不支持`time.Duration`、`int`类型, 支持`uint`



## 超级账本

- fabric 账本搭建坑：

  - TLS 问题： 如果发现节点连接不上，或者连接超时， 同时又开启了tls的情况下：
    - 检查配置文件内的tls证书是否正确
    - 检查配置文件内的 协议： http -> https , grpc -> grpcs
    - 检查网络情况： 各主机之间是否能够ping通
    - 如果是云上部署，注意查看端口是否已经开放

- fabric-node-sdk

  - 如果你连不上fabric：

    - 绝壁是你的配置文件问题

  - Gateway使用注意：

    - `gateway.getClient()` 返回的client的MSPID一定是与钱包内的账户相对应的，假如做切换用户操作，一定要注意避开

  - 切换账户：

    - 切换账户的时候一定要保证 client === null， 或者新建client， 再使用`setStateStore`方法

      ```js
      // 创建Client -> 从配置文件读取私钥  -> 存储在 ./tmp 目录下
      const client = new Client();
      client.setStateStore(await Client.newDefaultKeyValueStore({
          path: getStateStore(orgName) //这个方法仅仅是指定一个本地路径
      }));
      ```

  - 动态更新：
    - **动态添加orderer不行**
    - 动态更新org，修改org或者添加节点等，**本质都是 更新channel**
    - 参考：
      - [命令行修改版](https://gerrit.hyperledger.org/r/#/c/13687/)
      - [nodeSDK修改版](https://github.com/hyperledger/fabric-sdk-node/blob/release-1.4/test/integration/configtxlator.js)

- explorer

  - 如果你连不上explorer
    - 绝壁是你的配置文件问题
    - explorer的配置文件与nodeSDK类似， 但是在配置文件上方加了一个 `client`项，注意仔细比对

- fabric-ca

​      fabric-ca server端默认端口7054，支持REST、命令行两种方式进行交互，在fabric-ca中的三种证书类型

​     1.登记证书（ECert）:对实体身份进行检验

​    2.通信证书（TLSCert）:保证通信链路安全，对远端身份校验

​    3.交易证书（TCert）:颁发给用户，控制每个交易的权限

启动时需要先init 再start进行启动server端服务

通过命令

````
fabric-ca-server start -b admin:pass -p 7064 -u http://admin:pass@localhost:7054
````

可进行多级ca配置进行颁发证书给用户，当设置多级ca成功后会生成ca-chain.pem文件

fabric-ca-client命令可以与服务端进行交互, 包括五个子命令:

- enroll: 登录获取ECert
- getcacert: 获取CA服务的证书链
- reenroll: 再次登录
- register: 注册用户实体
- revoke: 吊销签发的实体证书

关于数字证书:

X509官方包目前只支持p256、224、384、521四种p系列椭圆算法，对于国密和s256比特币等椭圆算法不支持

x509.CreateCertificate是本地进行创建证书，并不与ca进行交互

x509.CreateCertificateRequest是创建证书请求文件CSR给ca,让ca进行证书的颁发，两者都需要生成私钥

证书吊销列表CRL并不是一成不变的，会自动更新的

#### Hyperledger-Composer

* 简介：
  * hyperledger-composer是一个基于fabric的应用层开发工具，可快速、简单的开发区块链应用。其属于hyperleder家族成员之一。
* 架构组成：
  * Business NetWork Archive(***.bna***)
    * 该.bna文件，是由composer将业务层模型定义、打包所得到的，最终用来部署在fabric生产网络中，快速实现业务功能。
    * 其由四个类型文件生成：
      * Model File（***.cto***）：该文件用来定义数据模型。例如资产（Assets）、参与者（Particioants）、交易（Transactions）等。使用语法xxx
      *  Script File（***.js***）: 该文件最终对应生成fabric层的chaincode。在应用层，实现具体的Transaction Functions。使用javaScript来实现。
      * Access Control（***.acl***）: 该文件用来定义访问控制规则。对比fabric层的acl，该文件为应用层规则，层级高，语法简单，实现快速。
      * Query Definitions (***.qry***) ：该文件实现了查询功能。
    * 未完待续。。。





## EOS

## 比特币

## 钱包

## 浏览器

## 交易所

**[⬆ 返回顶部](#目录)**

