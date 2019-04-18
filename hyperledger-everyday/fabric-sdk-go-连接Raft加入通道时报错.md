

# **GO-SDK 连接 Raft  join channel 报错**

![image-20190417202256971](https://ws2.sinaimg.cn/large/006tNc79ly1g25wfcswaxj311y05tgnc.jpg)



![image-20190417202313580](/Users/wangming/Library/Application%20Support/typora-user-images/image-20190417202313580.png)



### 解决方案:

##### 进入到peer的yaml中 注释掉 CORE_PEER_LISTENADDRESS 变量

![image-20190418083728637](https://ws4.sinaimg.cn/large/006tNc79gy1g26hni33wmj30sh0drq5b.jpg)

