# 基于Fabric1.4.1-rc1搭建Raft

> **下载Fabric1.4.1-rc1镜像**

```shell
$ curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s 1.4.1-rc1 1.4.1-rc1 0.4.15
```

> **进入下载完成的fabric-samples 项目 并启动 Raft**

```shell
$ cd ./fabric-samples/first-network/
# 启动Raft -o 指定共识算法 默认 solo
$ ./eyfn.sh up -o etchraft
```

![image-20190410113354145](https://ws3.sinaimg.cn/large/006tNc79ly1g1xdspnw67j311y0esn1x.jpg)



## 1. RAFT排序服务介绍

​	在fabric1.4.1的版本中，提供了基于raft共识的raft排序服务。raft的模型可以容忍奔溃，如果有节点故障掉线可以正常运行。前提是要有大多数存活，也就是要保证1/2以上的节点个数正常运行。raft共识是“主从模型”，主节点通过动态选举决定，从节点是主节点的复制。raft排序服务比kafka排序服务易于设置和管理。并且raft的设计允许不同的组织贡献节点来共同组成排序服务。

## 2. RAFT排序和kafka排序的对比

​	从提供服务的视角来看，基于raft和kafka的排序服务是类似的，他们都是基于CFT（crash fault tolerant）模型的排序服务，并且都使用了主从节点的设置。如果你是应用开发者或者智能合约开发者，你不会注意到他们之间的却别。但是，有一些主要的区别值得探讨，尤其是你需要管理排序服务。

1. kafka和zookeeper的设计不适用于大型网络。它们的设计是CFT模型，但局限于运行的比较紧密的主机上。也就是说，需要有一个组织专门运行kafka集群。鉴于此，当有多个组织使用基于kafka排序服务的时候，其实没有实现区中心化，因为所有的节点连接的都是由一个组织单独控制的kafka集群。如果使用raft，每个组织可以贡献排序节点，共同组成排序服务，可以更好的区中心化。
2. raft是原生支持的，而kafka需要经过复杂的步骤部署，并且需要单独学习成本。而且kafka和zookeeper的支持相关的issue要通过apache来处理，而不是hyperledger fabric。raft的实现是包含在fabric社区的，开发支持更加便利。

## 3. RAFT排序服务的目的

​	raft排序是fabric实现拜占庭容错排序服务的第一步，如我们所见，开发raft排序服务的决定也是基于此的。

## 4. 配置RAFT共识

​	raft节点之间通过使用TLS认证身份，如果一个攻击者想要伪造raft节点，就必须要获得一个有效的证书和对应的私钥。所以，没有一个有效的TLS证书，是不可能运行raft节点的。
要使用raft共识，需要修改两个地方

1. 本地配置：用来控制节点的特性，例如TLS配置，备份个数和文件存储。
2. 通道配置：用来定义raft集群的成员关系，以及raft协议相关的参数，例如心跳间隔、leader节点超时时间等。
3. 需要注意的是，每个channel有属于它自己的raft集群。因此，在chennel中要指定raft节点，指定的方式是把raft节点的tls证书配置到channel的配置文件中。在系统通道和应用通道中的配置中，每个排序以consenter的形式列出来。下面是**configtx.yaml**中关于raft节点配置的章节。

![image-20190410113931347](https://ws4.sinaimg.cn/large/006tNc79ly1g1xdylcz6bj31c00u04as.jpg)