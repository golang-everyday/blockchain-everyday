## fabric 账本搭建坑：

- TLS 问题： 如果发现节点连接不上，或者连接超时， 同时又开启了tls的情况下：
  - 检查配置文件内的tls证书是否正确
  - 检查配置文件内的 协议： http -> https , grpc -> grpcs
  - 检查网络情况： 各主机之间是否能够ping通
  - 如果是云上部署，注意查看端口是否已经开放





## 使用脚本 拉取 fabric 环境

脚本位于： http://github.com/hyperledger/fabric/scripts/bootstrap.sh

使用`wget http://github.com/hyperledger/fabric/scripts/bootstrap.sh` 可以下载下来

`./bootstrap.sh 1.4.1` 就可以拉取 1.4.1 版本的 fabric 环境

> 但是！ 这里有一个操作是相当慢的， 就是从 https://nexus.hyperledger.org/content/repositories/releases 这个网址开头的地方去下载两个文件

加速下载方法： 科学上网(windows + mac 只需在运行脚本的时候设置全局代理即可)



## 脚本加速方法

**Ubuntu下加速方法：**

* ***全局代理无效***
* 编辑脚本 bootstrap.sh
* 全局替换
  * curl ->  curl --proxy socks5://127.0.0.1:1081
  * curl --proxy 后面的代理地址 是根据你当前挂的代理地址来的， 如果你走了一遍 privoxy, 那也可以这样写： curl --proxy http://127.0.0.1:8118

* 注意： 设置全局变量 `http_proxy` 对 curl 也是没有效果的

* 如果是 虚拟机Ubuntu，那么只需要设置 网络模式 为 桥接，并确保 windows 宿主机开启了 全局代理 即可。原因： PAC 模式下，https://nexus.hyperledger.org/ 是直接访问的，并没有走代理。



Ubuntu下 git 加速方法：

* 同上，为 git 设置代理即可
  * `git config --global http.proxy http://proxyUsername:proxyPassword@proxy.server.com:port`



Ubuntu 下 命令行 代理：

* 安装 privoxy `sudo apt install privoxy`

* 设置 privoxy 配置文件

  * `sudo vim /etc/privoxy/config`
  * `forward-socks5   /               127.0.0.1:1081   .`  Line 1388， 代理地址和端口按照你的代理软件来设置，保存退出
  * `systemctl restart privoxy`  重启服务

* 设置 alias 

  * vim ~/.bashrc
  * 最后插入一行 `alias fq='http_proxy=http://127.0.0.1:8118'`

* `source ~/.bashrc`

* 使用命令：

  * `fq curl ip.gs`
  * 输出：

  ```shell
  $ fq curl ip.gs
  Current IP / 当前 IP: *.179.*.154
  ISP / 运营商:  it7.net
  City / 城市: Los Angeles California
  Country / 国家: United States
  IP.GS is now IP.SB, please visit https://ip.sb/ for more information. / IP.GS 已更改为 IP.SB ，请访问 https://ip.sb/ 获取更详细 IP 信息！
  Please join Telegram group https://t.me/sbfans if you have any issues. / 如有问题，请加入 Telegram 群 https://t.me/sbfans 
    /\_/\
  =( °w° )=
    )   (  //
   (__ __)//
  
  ```

* 如果是普通命令：

  * `curl ip.gs`
  * 输出：

  ```shell
  $ curl ip.gs
  Current IP / 当前 IP: 119.*.*.170
  ISP / 运营商:  ChinaTelecom
  City / 城市: Guangzhou Guangdong
  Country / 国家: China
  IP.GS is now IP.SB, please visit https://ip.sb/ for more information. / IP.GS 已更改为 IP.SB ，请访问 https://ip.sb/ 获取更详细 IP 信息！
  Please join Telegram group https://t.me/sbfans if you have any issues. / 如有问题，请加入 Telegram 群 https://t.me/sbfans 
  
    /\_/\
  =( °w° )=
    )   (  //
   (__ __)//
  
  ```

  

  
