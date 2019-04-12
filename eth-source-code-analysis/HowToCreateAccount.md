## 1. MakeAccountManager

![image-20190412113750183](https://ws3.sinaimg.cn/large/006tNc79ly1g1zp5d6ktpj30mk014gmo.jpg)

1.从配置中加载，加密方式

![image-20190412113800144](https://ws1.sinaimg.cn/large/006tNc79ly1g1zp5j1ouzj30lq03q767.jpg)

2.创建keystore 

![image-20190412113951269](https://ws1.sinaimg.cn/large/006tNc79ly1g1zp7gmp41j30rk0iqwo4.jpg)

3.如果是没有禁用usb，就创建硬件钱包

## 2.NewManager

![image-20190412114741583](https://ws3.sinaimg.cn/large/006tNc79ly1g1zpfmhe3rj30m205gq4w.jpg)

1 合并所有的wallet

![image-20190412114825383](https://ws2.sinaimg.cn/large/006tNc79ly1g1zpgdotlpj31660eck09.jpg)

根据url来排序

![image-20190412114855162](https://ws2.sinaimg.cn/large/006tNc79ly1g1zpgwj5j3j30o80a2tdj.jpg)

2 注册订阅

![image-20190412114934367](https://ws3.sinaimg.cn/large/006tNc79ly1g1zphkauw9j30ks0amq6p.jpg)

![image-20190412115042275](https://ws3.sinaimg.cn/large/006tNc79ly1g1zpiqt25bj30oy0500vh.jpg)

3，组装manager

![image-20190412115114881](https://ws2.sinaimg.cn/large/006tNc79ly1g1zpjb1wx8j307401sq34.jpg)

![image-20190412115136566](https://ws4.sinaimg.cn/large/006tNc79ly1g1zpjpw69xj30pa0o27c4.jpg)

![image-20190412115155666](https://ws3.sinaimg.cn/large/006tNc79ly1g1zpk1hoxpj30os0msag9.jpg)

4，开启线程监听事件

![image-20190412115412205](https://ws3.sinaimg.cn/large/006tNc79ly1g1zpme51fhj30zw0gy463.jpg)

事件类型

## 3, createAccount

![image-20190412120925165](https://ws4.sinaimg.cn/large/006tNc79ly1g1zq28u5b2j30vk01i75j.jpg)

通过manager的newAccount方法和password创建

![image-20190412121215968](https://ws3.sinaimg.cn/large/006tNc79ly1g1zq5741czj30ws0f0tfu.jpg)

![image-20190412121255025](https://ws4.sinaimg.cn/large/006tNc79ly1g1zq5xauv8j315y0keqc1.jpg)

1，newKey

![image-20190412121332108](https://ws3.sinaimg.cn/large/006tNc79ly1g1zq6isjutj30tg0aajvo.jpg)

GenerateKey 通过ecdsa生成私钥

![image-20190412122035073](https://ws3.sinaimg.cn/large/006tNc79ly1g1zqdv5ac5j30x40b6dmi.jpg)

![image-20190412121513665](/Users/zhengjunling/Library/Application Support/typora-user-images/image-20190412121513665.png)

newKeyFromECDSA  通过公钥生成地址

2，组装account

![image-20190412121922854](https://ws1.sinaimg.cn/large/006tNc79ly1g1zqclm5aoj310q08u0yo.jpg)

通过地址生成文件

![image-20190412122203362](https://ws3.sinaimg.cn/large/006tNc79ly1g1zqfeo2z2j30sg08mq6q.jpg)

keydir和filename拼接

3，storekey

![image-20190412122651345](https://ws2.sinaimg.cn/large/006tNc79ly1g1zqkdhkyyj30zp0u0h54.jpg)

encryptkey 就是生成文件中的json数据

writeTemporaryKeyFile 创建一个临时的文件

通过GetKey去校验是否正确

如果正确rename，返回,否则报错