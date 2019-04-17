# fabric-ca

## 简要说明

* fabric-ca server端默认端口7054，支持REST、命令行两种方式进行交互，在fabric-ca中的三种证书类型
  * 登记证书（ECert）:对实体身份进行检验
  * 通信证书（TLSCert）:保证通信链路安全，对远端身份校验
  * 交易证书（TCert）:颁发给用户，控制每个交易的权限

* 启动时需要先 init 再 start 进行启动server端服务
  * init 操作 ：fabric-ca-server init -b admin:password  （-b 参数是不适用LDAP）
  * init 操作 ：fabric-ca-server start -b admin:password



##  fabric-ca-client 命令交互

fabric-ca-client命令可以与服务端进行交互, 包括五个子命令:

- enroll: 登录获取ECert
- getcacert: 获取CA服务的证书链
- reenroll: 再次登录
- register: 注册用户实体
- revoke: 吊销签发的实体证书

##  数字证书

关于数字证书:

* X509官方包目前只支持p256、224、384、521四种p系列椭圆算法，对于国密和s256比特币等椭圆算法不支持

* x509.CreateCertificate是本地进行创建证书，并不与ca进行交互

* x509.CreateCertificateRequest是创建证书请求文件CSR给ca,让ca进行证书的颁发，两者都需要生成私钥

证书吊销列表CRL并不是一成不变的，会自动更新的

> CRL并不会主动、被动更新到fabric 组织里面去， 需要对 channel 进行手动 update
>
> 更新通道后，CRL 才会在 fabric 中生效



### 注册中间CA.

为了为中间CA创建CA签名证书，中间CA必须以与Fabric-ca-client注册CA相同的方式向父CA注册。这是通过使用-u选项指定父CA的URL以及注册ID和密码来完成的。与此注册ID关联的标识必须具有名称为“hf.IntermediateCA”且值为“true”的属性。已颁发证书的CN（或通用名称）将设置为注册ID。如果中间CA尝试显式指定CN值，则会发生错误。

通过命令

```shell
fabric-ca-server start -b admin:password -p 7064 -u http://admin:pass@localhost:7054
```

可进行多级ca配置进行颁发证书给用户，当设置多级ca成功后会生成ca-chain.pem文件

关于ca-chain.pem 会把根CA和中间CA证书写入进去，根证书在最下面。

使用工具openssl  verify -CAfile 命令可验证 两个证书的证书链关系



### 配置LDAP

Fabric CA服务器可以配置为从LDAP服务器读取。

特别是，Fabric CA服务器可以连接到LDAP服务器以执行以下操作：

- 在注册之前验证身份
- 检索用于授权的标识属性值。

修改Fabric CA服务器配置文件的LDAP部分，以将服务器配置为连接到LDAP服务器。

````yaml
ldap:
   # Enables or disables the LDAP client (default: false)
   enabled: false
   # The URL of the LDAP server
   url: <scheme>://<adminDN>:<adminPassword>@<host>:<port>/<base>
   userfilter: <filter>
   attribute:
      # 'names' is an array of strings that identify the specific attributes
      # which are requested from the LDAP server.
      names: <LDAPAttrs>
      # The 'converters' section is used to convert LDAP attribute values
      # to fabric CA attribute values.
      #
      # For example, the following converts an LDAP 'uid' attribute
      # whose value begins with 'revoker' to a fabric CA attribute
      # named "hf.Revoker" with a value of "true" (because the expression
      # evaluates to true).
      #    converters:
      #       - name: hf.Revoker
      #         value: attr("uid") =~ "revoker*"
      #
      # As another example, assume a user has an LDAP attribute named
      # 'member' which has multiple values of "dn1", "dn2", and "dn3".
      # Further assume the following configuration.
      #    converters:
      #       - name: myAttr
      #         value: map(attr("member"),"groups")
      #    maps:
      #       groups:
      #          - name: dn1
      #            value: orderer
      #          - name: dn2
      #            value: peer
      # The value of the user's 'myAttr' attribute is then computed to be
      # "orderer,peer,dn3".  This is because the value of 'attr("member")' is
      # "dn1,dn2,dn3", and the call to 'map' with a 2nd argument of
      # "group" replaces "dn1" with "orderer" and "dn2" with "peer".
      converters:
        - name: <fcaAttrName>
          value: <fcaExpr>
      maps:
        <mapName>:
            - name: <from>
              value: <to>
````

- `scheme`是*ldap*或*ldaps之一* ;
- `adminDN` 是admin用户的区别名称;
- `pass` 是admin用户的密码;
- `host` 是LDAP服务器的主机名或IP地址;
- `port`是可选的端口号，其中，默认389为*LDAP* 和636为*LDAPS* ;
- `base` 是用于搜索的LDAP树的可选根;
- `filter`是搜索将登录用户名转换为可分辨名称时使用的过滤器。例如， `(uid=%s)`搜索LDAP条目的值，`uid` 其值为属性，其值为登录用户名。同样， `(email=%s)`可用于使用电子邮件地址登录。
- `LDAPAttrs` 是一个LDAP属性名称数组，代表用户从LDAP服务器请求;

### 设置多个CA.

fabric-ca服务器默认包含一个默认CA. 但是，可以使用cafiles或cacount配置选项将其他CA添加到单个服务器。每个额外的CA都有自己的主目录。

#### cacount：

该cacount提供了一种快速启动的默认额外的CA X号。主目录将相对于服务器目录。使用此选项，目录结构如下：

```
-  < 服务器 主页> 
  |  - ca 
    |  - ca1 
    |  - ca2
```

每个额外的CA都将获得在其主目录中生成的默认配置文件，在配置文件中它将包含唯一的CA名称。

例如，以下命令将启动2个默认CA实例：

```shell
fabric - ca - 服务器 启动 - b  admin ：adminpw  - cacount  2
```

