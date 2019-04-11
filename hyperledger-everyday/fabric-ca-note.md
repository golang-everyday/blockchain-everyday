# fabric-ca

## 1.简要说明

* fabric-ca server端默认端口7054，支持REST、命令行两种方式进行交互，在fabric-ca中的三种证书类型
  * 登记证书（ECert）:对实体身份进行检验
  * 通信证书（TLSCert）:保证通信链路安全，对远端身份校验
  * 交易证书（TCert）:颁发给用户，控制每个交易的权限

* 启动时需要先 init 再 start 进行启动server端服务
  * init 操作 包括：//TODO

通过命令

```shell
fabric-ca-server start -b admin:password -p 7064 -u http://admin:pass@localhost:7054
```

可进行多级ca配置进行颁发证书给用户，当设置多级ca成功后会生成ca-chain.pem文件

## 2. fabric-ca-client 命令交互

fabric-ca-client命令可以与服务端进行交互, 包括五个子命令:

- enroll: 登录获取ECert
- getcacert: 获取CA服务的证书链
- reenroll: 再次登录
- register: 注册用户实体
- revoke: 吊销签发的实体证书

## 3. 数字证书

关于数字证书:

* X509官方包目前只支持p256、224、384、521四种p系列椭圆算法，对于国密和s256比特币等椭圆算法不支持

* x509.CreateCertificate是本地进行创建证书，并不与ca进行交互

* x509.CreateCertificateRequest是创建证书请求文件CSR给ca,让ca进行证书的颁发，两者都需要生成私钥

证书吊销列表CRL并不是一成不变的，会自动更新的

> CRL并不会主动、被动更新到fabric 组织里面去， 需要对 channel 进行手动 update
>
> 更新通道后，CRL 才会在 fabric 中生效