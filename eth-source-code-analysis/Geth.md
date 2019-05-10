# Geth 交互源码分析



## 先介绍几个库和概念：

### Liner

介绍：通过 Liner 解析用户输入的命令，该库提供了很多命令行功能，包括自动补全，历史记录等

1, console.go 顾名思义就是命令行

![](https://i.loli.net/2019/05/10/5cd50318a0b82.png)

2，console 的 New 方法![](https://i.loli.net/2019/05/10/5cd50368c7d53.png)

3，转到 promter（提前词的意思） 中，就找到了 liner初始化的地方，自此 liner 构建完成

![](https://i.loli.net/2019/05/10/5cd503b2d4888.png)

![](https://i.loli.net/2019/05/10/5cd503d1105eb.png)



在以太坊内部启动了 js 的运行时环境，简称 JSRE

Otto 是一个 go 和 js 互相调用的库

### 通过 geth 和以太坊交互主要经过一下流程：