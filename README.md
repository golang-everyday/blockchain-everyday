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

* [钱包架构源码分析](<https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/%E9%92%B1%E5%8C%85%E8%B4%A6%E6%88%B7.md>)
* [通过如何生成一个账户分析源码](https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/HowToCreateAccount.md)
* [Geth 交互源码分析](https://github.com/golang-everyday/blockchain-everyday/blob/master/eth-source-code-analysis/Geth.md)

### RLP

- 以太坊RLP编码的坑
  - rlp编码对空指针的解码会报错，所以要编码的对象最好不要有指针类型。
  - rlp对`[]byte`的支持也是，如果某字段是`[]byte`类型，而且值是`nil`，那么编码后再解码就会变成非空的：`[]byte{}`
  - rlp不支持`time.Duration`、`int`类型, 支持`uint`



## 超级账本

以下是一些关于使用`hyperledger`下项目的经验

[URL](<https://github.com/golang-everyday/blockchain-everyday/tree/master/hyperledger-everyday>)

+ [fabric-raft 1.4.1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/fabric-raft.md)

## EOS

## 比特币

## 钱包

## 浏览器

## 交易所

**[⬆ 返回顶部](#目录)**

