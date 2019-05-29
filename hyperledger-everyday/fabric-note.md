[TOC]

## fabric 账本搭建坑：

- TLS 问题： 如果发现节点连接不上，或者连接超时， 同时又开启了tls的情况下：
  - 检查配置文件内的tls证书是否正确
  - 检查配置文件内的 协议： http -> https , grpc -> grpcs
  - 检查网络情况： 各主机之间是否能够ping通
  - 如果是云上部署，注意查看端口是否已经开放





## 使用脚本 拉取 fabric docker环境

脚本位于： http://github.com/hyperledger/fabric/scripts/bootstrap.sh

使用`wget http://github.com/hyperledger/fabric/scripts/bootstrap.sh` 可以下载下来

`./bootstrap.sh 1.4.1` 就可以拉取 1.4.1 版本的 fabric 环境

> 但是！ 这里有一个操作是相当慢的， 就是从 https://nexus.hyperledger.org/content/repositories/releases 这个网址开头的地方去下载两个文件

加速下载方法： 科学上网(windows + mac 只需在运行脚本的时候设置全局代理即可)



## bootstrap.sh 脚本加速方法

### **Ubuntu下加速方法：**

* ***全局代理无效***
* 编辑脚本 bootstrap.sh
* 全局替换
  * `curl` ->  `curl --proxy socks5://127.0.0.1:1081`   <<<<=====建议用法
  * `curl --proxy` 后面的代理地址 是根据你当前挂的代理地址来的， 如果你走了一遍 privoxy, 那也可以这样写： `curl --proxy http://127.0.0.1:8118`
* 下面图片指出了 socks5 的由来(使用Ubuntu下的 Shadowsocks-Qt5)
  * ![2019-05-29_11-30.png](https://i.loli.net/2019/05/29/5cedfcf1a6eed85143.png)
  
* 注意： 设置全局变量 `http_proxy` 对 脚本内的 curl 也是没有效果的

* 如果是 虚拟机Ubuntu，那么只需要设置 网络模式 为 桥接，并确保 windows 宿主机开启了 全局代理 即可。原因： PAC 模式下，https://nexus.hyperledger.org/ 是直接访问的，并没有走代理。



### Ubuntu下 git 加速方法：

* 同上，为 git 设置代理即可
  * `git config --global http.proxy http://proxyUsername:proxyPassword@proxy.server.com:port`



### Ubuntu 下 命令行 代理：

* 安装 privoxy `sudo apt install privoxy`

* 设置 privoxy 配置文件

  * `sudo vim /etc/privoxy/config`
  * `forward-socks5   /               127.0.0.1:1081   .`  Line 1388， 代理地址和端口按照你的代理软件来设置，保存退出
  * > 设置局域网代理, 即局域网内所有机器可以通过这台机器走proxy
  `listen-address  0.0.0.0:8118 ` Line 781, 将监听地址从 127.0.0.1 改为 0.0.0.0 即可
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
  

  

  
  
  
  
  
  
  
  
  
  
  
  
  
  

## fabric make 注意事项

### 1. go-tools

a> 手动安装 gotools

```bash
# fq 为 alias 别名, 代表 `http_proxy=http://127.0.0.1:8118`, 参照上一节 命令行 代理
fq go get -u -v github.com/maxbrunsfeld/counterfeiter
go install github.com/maxbrunsfeld/counterfeiter

fq go get -u -v github.com/axw/gocov/gocov
go install github.com/axw/gocov/gocov

fq go get -u -v github.com/AlekSi/gocov-xml
go install github.com/AlekSi/gocov-xml

fq go get -u -v golang.org/x/tools/cmd/goimports
go install  golang.org/x/tools/cmd/goimports

fq go get -u -v golang.org/x/lint/golint
go install golang.org/x/lint/golint

fq go get -u -v github.com/estesp/manifest-tool
go install github.com/estesp/manifest-tool

fq go get -u -v github.com/client9/misspell/cmd/misspell
go install github.com/client9/misspell/cmd/misspell

fq go get -u -v github.com/vektra/mockery/cmd/mockery
go install github.com/vektra/mockery/cmd/mockery
```

b> make 之前, 添加 gotools

```bash
cd ~/go/src/github.com/hyperledger/fabric
make clean
mkdir -p .build/docker/gotools/bin
cp -f $GOPATH/bin/* .build/docker/gotools/bin
make docker
```



### 2. Makefile 修改

a> 修改 `Makefile` 里的 `curl`, 为 `curl` 加上 `-x 代理协议://代理地址:端口` (即 --proxy)

> b> 未验证: 修改 gotools.mk , 将 `go get` 前面加上代理:
>
> `http_proxy=http://127.0.0.1:8118 go get`
>
> *这一步骤如果完成了上面的手动添加 gotools, 则不需要再操作*



### 3. 几个常用 make 命令

```bash
make all # make 全部 , 包括 docker , 二进制文件,一些依赖检查等
make docker # 编译 docker, 将会下载一些文件, 最好使用代理
make release # 根据当前系统编译适合的 二进制可执行文件, 编译完成后位于 `./release/linux-amd64/bin`
```



### 4. 改造 fabric 后, 简要操作提示

* 替换可执行文件

```bash
cd fabric
make release
cd release/linux-amd64/bin
sudo cp ./configtxlator `which configtxlator`
sudo cp ./configtxgen `which configtxgen`
sudo cp ./cryptogen `which cryptogen`
sudo cp ./discover `which discover`
sudo cp ./idemixgen `which idemixgen`
sudo cp ./orderer `which orderer`
sudo cp ./peer `which peer`
```

* 运行make release，然后下载原版的docker镜像，用release/linux64/bin里的可执行程序替换掉docker镜像/usr/local/bin里的可执行程序
  * 进入修改目录 `make release`
  * 进入原版fabric目录 /scripts/ 下，运行 `./bootstrap.sh 1.4.1` 下载官方原版镜像

```bash
// 运行 docker，更改程序文件
// -v 挂载

docker run -it -v ~/go/src/github.com/hyperledger/fabric/release/linux-amd64/bin:/tmp --name "orderer" ec4ca236d3d4 /bin/bash  

# 替换 /usr/local/bin 下的 orderer 可执行文件

// 更新镜像image
docker commit -m="orderer-gm" -a="forchain" c2b6676c1d37 forchain/orderer:gm1.4


参数解释：

-m:提交的描述信息

-a:指定镜像作者

c2b6676c1d37：容器ID

wangsir/centos-test:7.4.1708:指定要创建的目标镜像名


# 输出
sha256:0d099348426f3c0f0c26ccfd381cb4bc54e70a6f19cd48b085aa2fc0497f16d9

# docker images 结果
forchain/orderer               gm1.4               0d099348426f        4 seconds ago       206MB

# ===== 依葫芦画瓢，照着操作peer ========
docker run -it -v ~/go/src/github.com/hyperledger/gwanted/fabric-gm/release/linux-amd64/bin:/tmp --name "peer" a1e3874f338b /bin/bash  

# docker 内
cp /tmp/peer `which peer`

################
root@d2774f2c7e6a:/# peer version   
peer:
 Version: 1.4.1
 Commit SHA: 87074a7
 Go version: go1.11.5
 OS/Arch: linux/amd64

root@d2774f2c7e6a:/# cp /tmp/peer `which peer`
root@d2774f2c7e6a:/# peer version
peer:
 Version: 1.4.2
 Commit SHA: 8f16585
 Go version: go1.11.10

################

# 退出 docker ， 保存镜像
docker commit -m="peer-gm" -a="forchain" 19a673938eb3 forchain/peer:gm1.4


# ===== 依葫芦画瓢，照着操作tools ========
docker run -it -v ~/go/src/github.com/hyperledger/gwanted/fabric-gm/release/linux-amd64/bin:/tmp --name "tools" 432c24764fbb /bin/bash  
cd /usr/local/bin
cp /tmp/* ./

docker commit -m="tools-gm" -a="forchain" 96395f648681 forchain/tools:gm1.4
```

