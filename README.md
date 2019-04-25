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

### 常见 bug 

- `known transaction :xxxx`

  场景：外部钱包在调用 rpc 提交交易，如果重复提交相同交易(即交易字段全部一样)，就会出现这个问题。

  原因：TxPool 在把 tx add 到 pool 时，会去检验 pool 是否已包含该 tx，如果包含就会丢弃，同时报错。

  解决：Transaction 中有一个 Nonce 字段，如果交易内容相同时，Nonce 不同就可以。

- `replacement transaction underpriced`

  场景：外部钱包在调用 rpc 提交交易，如果交易内容除了 gas 或 gasPrice 不一样其他都一样时，就会出现这个问题。

  原因：TxPool 在把 tx add 到 pool 时，会去检验 pool 是否已包含该 tx，如果包含就会丢弃，同时报错。

  解决：不要通过修改 gas 或 gasPrice 去发送一个重复的交易，非要发送重复的交易修改 Nonce 。

### 源码分析

* [钱包架构源码分析](<https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/%E9%92%B1%E5%8C%85%E8%B4%A6%E6%88%B7.md>)
* [通过如何生成一个账户分析源码](https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/HowToCreateAccount.md)
* [Geth 交互源码分析](https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/Geth.md)

## 超级账本

以下是一些关于使用`hyperledger`下项目的经验

[URL](<https://github.com/golang-everyday/blockchain-everyday/tree/master/hyperledger-everyday>)

+ [fabric-raft 1.4.1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/fabric-raft.md)
+ [fabric-go-sdk连接Raft加入通道报错](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/fabric-sdk-go-连接Raft加入通道时报错.md)

## EOS

## 比特币

## 钱包

## 浏览器

## 交易所

**[⬆ 返回顶部](#目录)**



## 💐 贡献者

|         [TryAndDare](https://github.com/TryAndDare)          |                [Wim](https://github.com/Wim)                 |          [lk2684753](https://github.com/lk2684753)           |            [zcqzcg](<https://github.com/zcqzcg>)             |      [GreatMartial](<https://github.com/GreatMartial>)       |      [evolution-ant](https://github.com/evolution-ant)       |           [mxdwater](https://github.com/mxdwater)            |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| <a href="https://github.com/TryAndDare"><img src="https://avatars1.githubusercontent.com/u/43058160?s=460&v=4" width="50px"></a> | <a href="https://github.com/TryAndDare"><img src="https://avatars1.githubusercontent.com/u/16588758?s=400&v=4" width="50px"></a> | <a href="https://github.com/TryAndDare"><img src="https://avatars0.githubusercontent.com/u/42611777?s=460&v=4" width="50px"></a> | <a href="https://github.com/TryAndDare"><img src="https://avatars1.githubusercontent.com/u/38346025?s=460&v=4" width="50px"></a> | <a href="https://github.com/TryAndDare"><img src="https://avatars0.githubusercontent.com/u/18361275?s=460&v=4" width="50px"></a> | <img src="https://avatars1.githubusercontent.com/u/24502661?s=460&v=4" width="50px"> | <a href="https://github.com/mxdwater"><img src="https://avatars0.githubusercontent.com/u/40318632?s=400&v=4" width="50px"></a> |

