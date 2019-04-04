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

- 以太坊RLP编码的坑

​      rlp编码对空指针的解码会报错，所以要编码的对象最好不要有指针类型。

​      rlp对[]byte的支持也是，如果某字段是[]byte类型，而且值是nil，那么编码后再解码就会变成非空的：[]byte{}

​      rlp不支持time.Duration、int类型支持uint

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



## EOS

## 比特币

## 钱包

## 浏览器

## 交易所

**[⬆ 返回顶部](#目录)**

