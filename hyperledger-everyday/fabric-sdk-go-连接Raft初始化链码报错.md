# Go-SDK 连接Raft初始化链码报错

连接不到peer0无法背书....

![image-20190418160959927](https://ws1.sinaimg.cn/large/006tNc79ly1g26uqespeqj31fh02adgb.jpg)

## 解决方案

需要在Fabric-SDK-GO的 config.yaml中设置Host

![image-20190419110642457](https://ws1.sinaimg.cn/large/006tNc79ly1g27rmpztq9j30re0eptb4.jpg)