# 基于Raft共识搭建多机Fabric1.4环境

> ​        由于近期fabric官方继fabric1.4LTS版本之后，又推出了fabric1.4.1的正式补丁版本，虽然fabric1.4.1是fabric1.4后续的补丁版本，但是这一小版本更新了fabric1.4.0版本没有完成的工作，，比如就本文当药介绍的Raft共识，从fabric0.6版本开始，共识推出过BFT算法，用于实现拜占庭容错，但由于性能原因在后续版本更新中下架了；在fabric1.0版本中提供了kafka以及solo两种共识组件，solo不用多说，kafka是现在大部分企业中所用到的共识组件，当然，fabric中的共识中的模块属于可插拔，一些公司可能会根据本身的业务需求，去自行添加想要的共识算法，kafka实现的是CFT(崩溃容错)，kafka的搭建相比其他共识算法来说要更加麻烦，因为kafka集群的运行需要依靠zookeeper集群去维护它队列中数据的状态，一旦出了问题，对于运维来说是不小的挑战，而Raft算法不需要依赖其他的集群就可以实现CFT，当出现问题时，我们只需要去查看orderer节点的日志就可以发现问题；BFT算法是现在fabric社区正在努力的目标，应该会在fabric2.0中推出，当BFT算法推出之后，我们就可以根据orderer节点的数量来选择不同的容错类型，当然，这是以后的事情，眼下，搭建基于Raft共识的fabric环境是适应之后社区更新的过渡手段。

### 1.搭建基于Raft共识的环境搭建的准备工作介绍

​        在本次搭建的fabric1.4环境中，准备搭建五个orderer节点、两个组织四个peer,这里要说明一下，raft共识中同步的节点必须为奇数，因为在整个共识环境中每个节点都是follower，当他们感受到网络中没有leader节点向他们发送heartbeat的时候，他们就会变成candidater，这时候需要他们之间相互投票才能将自己的由candidater变成leader，达成一致的过程需要整个网络中有n/2+1个节点达成一致，整个网络才会达成一致，所以需要奇数个同步节点，在leader选举出来之后通过leader与客户端交互，将本地的log同步到各个follower，如果想了解更多的raft算法，[点击这里](http://thesecretlivesofdata.com/raft/)。

​        本次一共用到四台阿里云主机，每台主机均是ubuntu系统，各个主机的ip以及节点分配情况见表1.1：

​                                           Table1.1各个主机ip以及节点分配情况

|                    各个主机的节点分配情况                    |   ip地址    |
| :----------------------------------------------------------: | :---------: |
| orderer0.example.com,peer0.org1.example.com,couchdb0,cli,ca_peerOrg1 | 192.168.8.6 |
|       orderer1.example.com,peer1.org1.example.com,cli        | 192.168.8.4 |
|       orderer2.example.com,peer2.org1.example.com,cli        | 192.168.8.7 |
| orderer3.example.com,orderer4.example.com,peer3.org1.example.com,cli | 192.168.8.5 |

​          首先是阿里云上关于fabric环境的配置，主要包括go语言、docker、docker-compose等，具体的安装步骤如下，这里以主机ip为192.168.8.6为例：

- 执行命令wget <https://dl.google.com/go/go1.11.linux-amd64.tar.gz> 来下载go语言二进制的源码包。
- 执行命令tar -zxvf go1.11.linux-amd64.tar.gz -C /usr/local/解压。
- 执行命令mkdir $HOME/code/go -p创建go的工程目录。
- 在家目录下执行命令vim .bashrc,并在文件的最后面填写go语言的环境变量，即将下面代码块中的配置写入文件中。

```
export GOROOT="/usr/local/go"
export GOPATH="$HOME/code/go"
export GOBIN="$HOME/code/go/bin"
export PATH="$PATH:$GOROOT/bin:$GOPATH/bin"
```

- 执行命令source .bashrc，让刚配置好的环境变量生效。
- 执行命令go version 查看当前的go语言的版本。
- 执行命令go env查看当前go语言的配置环境。
- 查看当前主机家目录下是否有.pip目录，如果没有，执行命令mkdir .pip,并执行命令vi pip.conf,将下面代码块中的内容写入pip.conf的文件中。

```
[global]
index-url=http://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host=mirrors.aliyun.com
```

- 执行命令pip install docker-compose,安装docker-compose(docker编排工具)。
- 执行命令docker-compose version来查看当前安装的docker-compose工具的版本。
- 执行命令apt-get install docker.io来安装docker,如果报错说定位不到docker.io，那就先执行命令apt-get update，再安装docker.
- 执行命令cd $GOPATH/src/github.com/hyperledger进入到指定的目录下，这个目录路径和后面拉去二进制源码工具有关，路径不对会导致二进制工具拉取失败，执行命令git clone https://github.com/hyperledger/fabric.git,将fabric源码拉取下来，如果主机中没有git命令，通过执行apt-get install git来自行下载。
- 执行命令git clone https://github.com/hyperledger/fabric-samples.git将fabric-samples拉取下来，这里会有官方的一些示例以及各种模式下的fabric环境配置。
- 执行命令cd fabric-samples/scripts，进入到scripts目录下，修改bootstrap.sh中的镜像版本，1.4.0->1.4.1，0.4.14->0.4.15，搭建raft下的fabric网络需要最新的docker镜像的版本，如果版本不够新，会导致容器的一场退出，比如orderer容器会出现识别不了etcdraft共识的错误。
- 执行bootstrap.sh脚本主要是拉去二进制工具包以及拉取到最新的docker镜像，执行脚本完成后，二进制工具会在fabric-samples/bin目录中，只需要再执行cp cryptogen configtxlator configtxgen /usr/local/bin命令，就可以将工具放在全局进行使用了。
- 如果无法成功执行bootstrap.sh脚本，需要分两步去将二进制源码工具和docker镜像拉取到，首先关于二进制工具，可以先进入到/fabric目录下，执行git checkout -b v1.4.1，来到当前fabric源码分支v1.4.1,执行make release拉去二进制源码工具，执行完成后，在fabric/release/linux-amd64/bin的目录下就会有下载好的二进制源码工具了，再执行cp cryptogen configtxgen configlator /usr/local/bin命令，将工具设置为全局使用。
- 另外docker的最新镜像可以shell脚本来拉去，执行命令vi docker_images.sh,将下面代码块中的内容填写进文件中，然后执行chmod +x docker_images.sh为脚本文件添加执行权限，最后执行./docker_images.sh将最新版本的docker镜像拉取下来。

```
#!/bin/bash

docker pull hyperledger/fabric-ca:1.4.1
docker tag hyperledger/fabric-ca:1.4.1 hyperledger/fabric-ca:latest

docker pull hyperledger/fabric-tools:1.4.1
docker tag hyperledger/fabric-tools:1.4.1 hyperledger/fabric-tools:latest

docker pull hyperledger/fabric-ccenv:1.4.1
docker tag hyperledger/fabric-ccenv:1.4.1 hyperledger/fabric-ccenv:latest

docker pull hyperledger/fabric-orderer:1.4.1 
docker tag hyperledger/fabric-orderer:1.4.1 hyperledger/fabric-orderer:latest

docker pull hyperledger/fabric-peer:1.4.1 
docker tag hyperledger/fabric-peer:1.4.1 hyperledger/fabric-peer:latest

docker pull hyperledger/fabric-javaenv:1.4.1
docker tag hyperledger/fabric-javaenv:1.4.1 hyperledger/fabric-javaenv:latest

docker pull hyperledger/fabric-zookeeper:0.4.15
docker tag hyperledger/fabric-zookeeper:0.4.15 hyperledger/fabric-zookeeper:latest

docker pull hyperledger/fabric-kafka:0.4.15 
docker tag hyperledger/fabric-kafka:0.4.15 hyperledger/fabric-kafka:latest

docker pull hyperledger/fabric-couchdb:0.4.15
docker tag hyperledger/fabric-couchdb:0.4.15 hyperledger/fabric-couchdb:latest

docker pull hyperledger/fabric-baseos:0.4.15 
docker tag hyperledger/fabric-baseos:0.4.15 hyperledger/fabric-baseos:latest

```

- 执行到这一步已经完成了搭建fabric网络的环境的搭建，下面就进入到搭建fabric网络的部分。

### 2.基于Raft共识的多机的fabric网络搭建

​         这一节是对每台阿里云主机的各个节点的网络配置，其中主要涉及的是配置文件，每一步的后面会标注目标主机。

- 在家目录下执行命令mkdir raft-example来创建项目目录，并进入到项目目录中(192.168.8.6)。
- 在项目目录中执行命令vi crypto-config.yaml,并将下列代码块中的内容填写到文件中(8.6)。

```
OrdererOrgs:
  - Name: Orderer
    Domain: example.com
    Specs:
      - Hostname: orderer0
      - Hostname: orderer1
      - Hostname: orderer2
      - Hostname: orderer3
      - Hostname: orderer4
PeerOrgs:
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: true
    Template:
      Count: 4
    Users:
      Count: 4
```

- 执行命令cryptogen generate --config ./crypto-config.yaml生成各个节点的证书(8.6)。
- 执行命令vi configtx.yaml，并将下列代码块中的内容填写进文件中(8.6)。

```
---
Organizations:
    - &OrdererOrg
        Name: OrdererOrg
        ID: OrdererMSP
        MSPDir: crypto-config/ordererOrganizations/example.com/msp
        Policies:
          Readers:
              Type: Signature
              Rule: "OR('OrdererMSP.member')"
          Writers:
              Type: Signature
              Rule: "OR('OrdererMSP.member')"
          Admins:
              Type: Signature
              Rule: "OR('OrdererMSP.admin')"
    - &Org1
        Name: Org1MSP
        ID: Org1MSP
        MSPDir: crypto-config/peerOrganizations/org1.example.com/msp
        AnchorPeers:
            - Host: peer0.org1.example.com
              Port: 7051
        Policies:
          Readers:
              Type: Signature
              Rule: "OR('Org1MSP.admin','Org1MSP.peer','Org1MSP.client')"
          Writers:
              Type: Signature
              Rule: "OR('Org1MSP.admin','Org1MSP.client')"
          Admins:
              Type: Signature
              Rule: "OR('Org1MSP.admin')"
Capabilities:
    Channel: &ChannelCapabilities
        V1_3: true
    Orderer: &OrdererCapabilities
        V1_1: true
    Application: &ApplicationCapabilities
        V1_3: true
        V1_2: false
        V1_1: false
Application: &ApplicationDefaults
    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
    Capabilities:
        <<: *ApplicationCapabilities
Orderer: &OrdererDefaults
    OrdererType: solo
    Addresses:
        - orderer0.example.com:7050
    BatchTimeout: 2s
    BatchSize:
        MaxMessageCount: 200
        AbsoluteMaxBytes: 2 MB
        PreferredMaxBytes: 512 KB
    Kafka:
        Brokers:
        - 127.0.0.1:9092
    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        BlockValidation:
            Type: ImplicitMeta
            Rule: "ANY Writers"
Channel: &ChannelDefaults
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
    Capabilities:
        <<: *ChannelCapabilities
Profiles:
    TwoOrgsOrdererGenesis:
        <<: *ChannelDefaults
        Capabilities:
            <<: *ChannelCapabilities
        Orderer:
            <<: *OrdererDefaults
            OrdererType: etcdraft
            EtcdRaft:
                Consenters:
                - Host: orderer0.example.com
                  Port: 7050
                  ClientTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/server.crt
                  ServerTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/server.crt
                - Host: orderer1.example.com
                  Port: 7050
                  ClientTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/tls/server.crt
                  ServerTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/tls/server.crt
                - Host: orderer2.example.com
                  Port: 7050
                  ClientTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt
                  ServerTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/server.crt
                - Host: orderer3.example.com
                  Port: 7050
                  ClientTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.crt
                  ServerTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/server.crt
                - Host: orderer4.example.com
                  Port: 8050
                  ClientTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.crt
                  ServerTLSCert: crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/server.crt
            Addresses:
                - orderer0.example.com:7050
                - orderer1.example.com:7050
                - orderer2.example.com:7050
                - orderer3.example.com:7050
                - orderer4.example.com:8050
            Organizations:
            - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Application:
            <<: *ApplicationDefaults
            Organizations:
            - <<: *OrdererOrg
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *Org1
    TwoOrgsChannel:
        Consortium: SampleConsortium
        <<: *ChannelDefaults
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Org1
            Capabilities:
                <<: *ApplicationCapabilities
```

- 执行命令mkdir channel-artifacts创建文件夹用来保存通过文件以及系统通道的创世块文件(8.6)。
- 执行命令configtxgen -profile TwoOrgsOrdererGenesis -channelID systemchannel -outputBlock ./channel-artifacts/genesis.block生成系统文件的创世块(8.6)。
- 执行命令configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID testchannel生成用于创建应用通道的通道文件8.6()。
- 接着将整个项目目录raft-example拷贝到其他的三台主机上，在家目录下执行命令scp -r raft-example root@192.168.8.4:~/，scp -r raft-example root@192.168.8.7:~/，scp -r raft-example root@192.168.8.5:~/(8.6)。
- 执行命令vi docker-compose-orderer.yaml,并将下面代码块中的内容填写到文件中(8.6)。

```
version: '2'
volumes:
  orderer0.example.com:
services:
  orderer0.example.com:
    container_name: orderer0.example.com
    image: hyperledger/fabric-orderer:latest
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
      - ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1
      - ORDERER_KAFKA_VERBOSE=true
      - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/msp:/var/hyperledger/orderer/msp
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer0.example.com/tls/:/var/hyperledger/orderer/tls
      - orderer0.example.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
```

- 执行命令vi docker-compose-peer.yaml，并将下面代码块中的内容填写到文件中(8.6)。

```
version: '2'
volumes:
  peer0.org1.example.com:
services:
  peer0.org1.example.com:
    container_name: peer0.org1.example.com
    hostname: peer0.org1.example.com
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
      - CORE_PEER_ID=peer0.org1.example.com
      - GODEBUG=netdns=go
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_CHAINCODELISTENADDRESS=peer0.org1.example.com:7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_PROFILE_ENABLED=true
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/fabric/msp
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls:/etc/hyperledger/fabric/tls
      - peer0.org1.example.com:/var/hyperledger/production
    ports:
      - 7051:7051
      - 7052:7052
      - 7053:7053
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "couchdb0:192.168.8.6"
```

- 执行命令vi docker-compose-cli.yaml,并将下面代码块中的内容填写到文件中(8.6)。

```
version: '2'
services:
  cli:
    container_name: cli
    image: hyperledger/fabric-tools:latest
    tty: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    volumes:
      - /var/run/:/host/var/run/
      - ./chaincode:/opt/gopath/src/github.com/chaincode
      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "peer0.org1.example.com:192.168.8.6"
      - "peer1.org1.example.com:192.168.8.4"
      - "peer2.org1.example.com:192.168.8.7"
      - "peer3.org1.example.com:192.168.8.5"
```

- 执行命令vi docker-compose-couchdb0.yaml,并将虾米那代码块中的内容填写到文件中(8.4)。

```
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#
version: '2'

services:
  couchdb0:
    container_name: couchdb0
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
```

- 执行命令vi docker-compose-ca.yaml,并将下面代码块中的内容填写到文件中(8.4)。

```
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

services:
  ca0:
    image: hyperledger/fabric-ca:latest
    environment:
      - FABRIC_CA_HOME=/var/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca-org1
      - FABRIC_CA_SERVER_CA_CERTFILE=/var/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem
      - FABRIC_CA_SERVER_CA_KEYFILE=/var/hyperledger/fabric-ca-server-config/c7f7a9b0ed2262a8d06a6c39f697e1772aab5e5aca012f2000f00677708e75b2_sk
      - FABRIC_CA_SERVER_TLS_ENABLED=true
      - FABRIC_CA_SERVER_TLS_CERTFILE=/var/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem
      - FABRIC_CA_SERVER_TLS_KEYFILE=/var/hyperledger/fabric-ca-server-config/c7f7a9b0ed2262a8d06a6c39f697e1772aab5e5aca012f2000f00677708e75b2_sk
      - FABRIC_CA_SERVER_PORT=7054
    ports:
      - "7054:7054"
    command: sh -c 'fabric-ca-server start -b admin:adminpw -d'
    volumes:
      - ./crypto-config/peerOrganizations/org1.example.com/ca/:/var/hyperledger/fabric-ca-server-config
    container_name: ca_peerOrg1
```

- 在项目目录下执行mkdir scripts,创建脚本目录，在这里主要是写两个脚本用来启动容器和关闭容器的(8.6)。
- 在scripts目录下执行vi up.sh，并将下面代码块中的内容填写到文件中，填写完成后执行chmod +x up.sh为文件添加执行权限(8.6)。

```
#!/bin/bash
docker-compose -f ../docker-compose-orderer.yaml up -d
sleep 10
docker-compose -f ../docker-compose-peer.yaml up -d
docker-compose -f ../docker-compose-couchdb0.yaml up -d
docker-compose -f ../docker-compose-cli.yaml up -d
docker-compose -f ../docker-compose-ca.yaml up -d
```

- 在scripts目录下执行vi down.sh,并将下面代码块中内容填写到文件中，填写完成后执行chmod +x down.sh为文件添加执行权限(8.6)。
- 第一台阿里云的配置已经完毕了，这里解释一下两点，第一，由于一些公司的链码采用了富查询的功能，所以这里添加了couchdb,并且如果你不需要去连接sdk的话，只想用cli工具去测试一下网络，ca也可以不用起，还有就是为什么orderer容器启动后需要等10几秒才起别的容器，是因为这些时间是留给各个orderer容器，让他们达成一致的，他们需要这时间去选举leader，这一点官方的脚本也是留了15秒的时间。

- 进入到raft-example的项目目录下，执行命令vi docker-compose-orderer.yaml,并将下面代码块中的内容填写到文件中(8.4)。

```
version: '2'
volumes:
  orderer1.example.com:
services:
  orderer1.example.com:
    container_name: orderer1.example.com
    image: hyperledger/fabric-orderer:latest
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
      - ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1
      - ORDERER_KAFKA_VERBOSE=true
      - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/msp:/var/hyperledger/orderer/msp
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/tls/:/var/hyperledger/orderer/tls
      - orderer1.example.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
```

- 执行命令vi docker-compose-peer.yaml,并将下面代码块中的内容填写到文件中(8.4)。

```
version: '2'
volumes:
  peer1.org1.example.com:
services:
  peer1.org1.example.com:
    container_name: peer1.org1.example.com
    hostname: peer1.org1.example.com
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
      - CORE_PEER_ID=peer1.org1.example.com
      - GODEBUG=netdns=go
      - CORE_PEER_ADDRESS=peer1.org1.example.com:7051
      - CORE_PEER_CHAINCODELISTENADDRESS=peer1.org1.example.com:7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_PROFILE_ENABLED=true
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/msp:/etc/hyperledger/fabric/msp
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls:/etc/hyperledger/fabric/tls
      - peer1.org1.example.com:/var/hyperledger/production
    ports:
      - 7051:7051
      - 7052:7052
      - 7053:7053
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "couchdb0:192.168.8.6"
```

- 执行命令docker-compose-cli.yaml,并将下面代码块中的内容填写到文件中(8.4)。

```
version: '2'
services:
  cli:
    container_name: cli
    image: hyperledger/fabric-tools:latest
    tty: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer1.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    volumes:
      - /var/run/:/host/var/run/
      - ./chaincode:/opt/gopath/src/github.com/chaincode
      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "peer0.org1.example.com:192.168.8.6"
      - "peer1.org1.example.com:192.168.8.4"
      - "peer2.org1.example.com:192.168.8.7"
      - "peer3.org1.example.com:192.168.8.5"
```

- 在工程目录下，执行mkdir scripts创建目录用来保存脚本用来启动容器和关闭容器(8.4)。
- 进入到scripts目录，执行vi up.sh，并将下面代码块中的内容填写到文件中，填写完成后执行chmod +x up.sh给脚本添加执行权限(8.4)。

```
#!/bin/bash
docker-compose -f ../docker-compose-orderer.yaml up -d
sleep 10
docker-compose -f ../docker-compose-peer.yaml up -d
docker-compose -f ../docker-compose-cli.yaml up -d
```

- 执行vi down.sh,并将下面代码块中的内容填写到文件中，填写完成后执行chmod +x down.sh给脚本添加执行权限(8.4)。

```
#!/bin/bash
docker-compose -f ../docker-compose-orderer.yaml down --volume --remove-orphans
docker-compose -f ../docker-compose-peer.yaml down --volume --remove-orphans
docker-compose -f ../docker-compose-cli.yaml down --volume --remove-orphans
docker rm -f $(docker ps -aq)
docker volume prune
docker network prune
```

- 执行到这步，第二台主机也配置完毕。
- 下面对第三台主机进行配置，进入到项目目录raft-example(8.7)。
- 执行命令vi docker-compose-orderer.yaml,并将下面代码块中的内容填写到文件中(8.7)。

```
version: '2'
volumes:
  orderer2.example.com:
services:
  orderer2.example.com:
    container_name: orderer2.example.com
    image: hyperledger/fabric-orderer:latest
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
      - ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1
      - ORDERER_KAFKA_VERBOSE=true
      - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp:/var/hyperledger/orderer/msp
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/:/var/hyperledger/orderer/tls
      - orderer2.example.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
```

- 执行vi docker-compose-peer.yaml，并将下面代码块中的内容填写到文件中(8.7)。

```
version: '2'
volumes:
  peer2.org1.example.com:
services:
  peer2.org1.example.com:
    container_name: peer2.org1.example.com
    hostname: peer2.org1.example.com
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
      - CORE_PEER_ID=peer2.org1.example.com
      - GODEBUG=netdns=go
      - CORE_PEER_ADDRESS=peer2.org1.example.com:7051
      - CORE_PEER_CHAINCODELISTENADDRESS=peer2.org1.example.com:7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer2.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_PROFILE_ENABLED=true
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/msp:/etc/hyperledger/fabric/msp
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/tls:/etc/hyperledger/fabric/tls
      - peer2.org1.example.com:/var/hyperledger/production
    ports:
      - 7051:7051
      - 7052:7052
      - 7053:7053
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "couchdb0:192.168.8.6"
```

- 执行vi docker-compose-cli.yaml，并将下面代码块中的内容填写到文件中(8.7)。

```
version: '2'
services:
  cli:
    container_name: cli
    image: hyperledger/fabric-tools:latest
    tty: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer2.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    volumes:
      - /var/run/:/host/var/run/
      - ./chaincode:/opt/gopath/src/github.com/chaincode
      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "peer0.org1.example.com:192.168.8.6"
      - "peer1.org1.example.com:192.168.8.4"
      - "peer2.org1.example.com:192.168.8.7"
      - "peer3.org1.example.com:192.168.8.5"
```

- 执行mkdir scripts创建脚本目录用来保存启动容器和关闭容器的脚本(8.7)。
- 在scripts目录下执行vi up.sh,并将下面代码块中的内容填写进文件中，填写完成后执行命令chmod +x up.sh为脚本添加执行权限(8.7)。

```
#!/bin/bash
docker-compose -f ../docker-compose-orderer.yaml up -d
sleep 10
docker-compose -f ../docker-compose-peer.yaml up -d 
docker-compose -f ../docker-compose-cli.yaml up -d
```

- 执行命令vi down.sh，并将下面代码块中的内容填写进文件中，填写完成后执行命令chmod +x down.sh为脚本添加执行权限(8.7)。
- 执行到这步，第三台主机也已经配置好了。
- 下面来进行第四台主机的配置，首先进入到项目目录中(8.5)。
- 执行命令vi docker-compose-orderer.yaml,并将下面的内容填写进文件中(8.5)。

```
version: '2'
volumes:
  orderer3.example.com:
services:
  orderer3.example.com:
    container_name: orderer3.example.com
    image: hyperledger/fabric-orderer:latest
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
      - ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1
      - ORDERER_KAFKA_VERBOSE=true
      - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp:/var/hyperledger/orderer/msp
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/:/var/hyperledger/orderer/tls
      - orderer3.example.com:/var/hyperledger/production/orderer
    ports:
      - 7050:7050
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
```

- 执行命令vi docker-compose-orderer1.yaml，并将下面代码块中的内容填写到文件中(8.5)。

```
version: '2'
volumes:
  orderer4.example.com:
services:
  orderer4.example.com:
    container_name: orderer4.example.com
    image: hyperledger/fabric-orderer:latest
    environment:
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
      - ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1
      - ORDERER_KAFKA_VERBOSE=true
      - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/msp:/var/hyperledger/orderer/msp
      - ./crypto-config/ordererOrganizations/example.com/orderers/orderer4.example.com/tls/:/var/hyperledger/orderer/tls
      - orderer4.example.com:/var/hyperledger/production/orderer
    ports:
      - 8050:7050
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
```

- 执行命令vi docker-compose-peer.yaml,并将下面代码块的内容填写进文件中(8.5)。

```
version: '2'
volumes:
  peer3.org1.example.com:
services:
  peer3.org1.example.com:
    container_name: peer3.org1.example.com
    hostname: peer3.org1.example.com
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
      - CORE_PEER_ID=peer3.org1.example.com
      - GODEBUG=netdns=go
      - CORE_PEER_ADDRESS=peer3.org1.example.com:7051
      - CORE_PEER_CHAINCODELISTENADDRESS=peer3.org1.example.com:7052
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer3.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_PROFILE_ENABLED=true
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/msp:/etc/hyperledger/fabric/msp
      - ./crypto-config/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/tls:/etc/hyperledger/fabric/tls
      - peer3.org1.example.com:/var/hyperledger/production
    ports:
      - 7051:7051
      - 7052:7052
      - 7053:7053
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "couchdb0:192.168.8.6"
```

- 执行命令vi docker-compose-cli.yaml，并将下面代码块中的内容填写到文件中(8.5)。

```
version: '2'
services:
  cli:
    container_name: cli
    image: hyperledger/fabric-tools:latest
    tty: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=INFO
      - GODEBUG=netdns=go
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer3.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    volumes:
      - /var/run/:/host/var/run/
      - ./chaincode:/opt/gopath/src/github.com/chaincode
      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    extra_hosts:
      - "orderer0.example.com:192.168.8.6"
      - "orderer1.example.com:192.168.8.4"
      - "orderer2.example.com:192.168.8.7"
      - "orderer3.example.com:192.168.8.5"
      - "orderer4.example.com:192.168.8.5"
      - "peer0.org1.example.com:192.168.8.6"
      - "peer1.org1.example.com:192.168.8.4"
      - "peer2.org1.example.com:192.168.8.7"
      - "peer3.org1.example.com:192.168.8.5"
```

- 在项目目录下执行mkdir scripts创建脚本目录，用来保存启动容器和关闭容器的脚本文件(8.5)。
- 在scripts目录下执行vi up.sh，并将下面代码块中的内容填写进文件中，填写完成之后执行chmod +x up.sh为脚本文件添加执行权限(8.5)。

```
#!/bin/bash
docker-compose -f ../docker-compose-orderer.yaml up -d
docker-compose -f ../docker-compose-orderer1.yaml up -d
sleep 10
docker-compose -f ../docker-compose-peer.yaml up -d
docker-compose -f ../docker-compose-cli.yaml up -d
```

- 执行vi down.sh ，并将下面代码块中的内容填写进文件中，填写完成后执行chmod +x down.sh为脚本文件添加执行权限(8.5)。

```
#!/bin/bash
docker-compose -f ../docker-compose-orderer.yaml down --volume --remove-orphans
docker-compose -f ../docker-compose-peer.yaml down --volume --remove-orphans
docker-compose -f ../docker-compose-orderer1.yaml down --volume --remove-orphans
docker-compose -f ../docker-compose-cli.yaml down --volume --remove-orphans
docker rm -f $(docker ps -aq)
docker volume prune
docker netowrk prune
```

- 执行到这步第四台主机已经执行完毕了。
- 现在整个网络还缺少一个链码，我们在第一台主机的项目目录下执行mkdir chaincode创建链码目录，执行命令cp $HOME/go/src/github.com/hyperledger/fabricsamples/chaincode/chain code_example02/go/chaincode_example02.go ./chaincode将示例的链码拷贝到链码目录中(8.6)。
- 将chaincode目录远程拷贝到其他的三台主机上，执行命令scp -r chaincode root@192.168.8.4 :~/raft-example, scp -r chaincode root@192.168.8.7:~/raft-example,scp -r chaincode root@ 192.168.8.5:~/raft-example。
- 各个主机进行交互时，主机名的解析会影响交互速度，所以我们在/etc/hosts中将ip与主机名绑定起来，执行vi /etc/hosts，并将下面代码块中的内容填写到文件中(8.6)(8.4)(8.7)(8.5)。

```
192.168.8.6 peer0.org1.example.com couchdb0 ca_peerOrg1
192.168.8.4 peer1.org1.example.com
192.168.8.7 peer2.org1.example.com
192.168.8.5 peer3.org1.example.com
192.168.8.6 orderer0.example.com
192.168.8.4 orderer1.example.com
192.168.8.7 orderer2.example.com
192.168.8.5 orderer3.example.com orderer4.example.com
```

- 首先进入到第一台主机中的~/raft-example/scripts,执行./up.sh，然后进入到第二台主机中的~/raft-example/scripts目录下，执行./up.sh，接着进入到第三台主机中的~/raft-example/scrip ts目录下执行./up.sh，最后进入到第四台主机中的~/raft-example/scripts目录下执行./up.sh。
- 执行到这一步fabric的网络就已经启动完毕了，下面用cli工具代替客户端去和fabric网络进行交互。

### 3.利用cli命令行工具和fabric底层网络进行交互

- 执行docker exec -it cli bash命令进入到cli容器中，执行peer channel create -o orderer0.exam ple.com:7050 -c testchannel -f ./channel-artifacts/channel.tx --tls true --cafile /opt/gopath/s rc/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem创建应用通道(8.6)。
- 执行peer channel join -b testchannel.block将当前peer加入到通道中(8.6)。
- 执行peer chaincode install -n mycc -v 1.0 -l golang -p github.com/chaincode在当前peer上安装链码(8.6)。
- 执行peer chaincode package -p github.com/chaincode -n mycc -v 1.0 mycc.1.0.out将链码打包(8.6)。
- 执行exit，退出当前cli容器(8.6)。
- 执行docker cp cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/testchannel.block ./channel-artifacts将生成的创世块文件从docker容器中拷贝出来(8.6)。
- 执行docker cp cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/mycc.1.0.out ./chan nel-artifacts将链码文件从docker容器中拷贝出来(8.6)。
- 将整个channel-artifacts直接拷贝到远程主机，执行命令scp -r channel-artifacts root@192.168 .8.4:~/raft-example,scp -r channel-artifacts root@192.168.8.7:~/raft-example,scp -r channel -artifacts root@192.168.8.5：~/raft-example(8.6)。
- 在第二台主机上，执行docker exec -it cli bash 进入到cli容器中，并将channel-artifacts中的创世块文件以及链码文件拷贝到docker容器内，执行mv ./channel-artifacts/testchannel.block /o pt/gopath/src/github.com/hyperledger/fabric/peer,mv ./channel-artifacts/mycc.1.0.out /op t/gopath/src/github.com/hyperledger/fabric/peer(8.6)。
- 执行peer channel join -b testchannel.block将当前peer加入到通道中(8.6)。
- 执行peer chaincode install mycc.1.0.out在当前peer上安装链码(8.6)。
- 在第三台主机上执行docker exec -it cli bash进入到cli客户端容器，将创世块以及链码文件拷贝到容器里，执行mv ./channel-artifacts/testchannel.block /opt/gopath/src/github.com/hyp erledger/fabric/peer，执行 mv ./channel-artifacts/mycc.1.0.out /opt/gopath/src/github.co m/hyperledger/fabric/peer(8.7)。
- 执行peer channel join -b testchannel.block将当前peer加入到通道中(8.7)。
- 执行peer chaincode install mycc.1.0.out在当前peer上安装链码(8.7)。
- 在第四台主机上执行docker exec -it cli bash进入到客户端容器中，将创世块以及链码文件拷贝到容器里，执行mv ./channel-artifacts/testchannel.block /opt/gopath/src/github.com/hyp erledger/fabric/peer，执行 mv ./channel-artifacts/mycc.1.0.out /opt/gopath/src/github.co m/hyperledger/fabric/peer(8.5)。
- 执行peer channel join -b testchannel.block将当前peer加入到通道中(8.5)。
- 执行peer chaincode install mycc.1.0.out在当前peer上安装链码(8.5)。
- 在第一台主机上执行docker exec -it cli bash进入到客户端容器中，执行peer chaincode instant iate -o orderer0.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledg er/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com /msp/tlscacerts/tlsca.example.com-cert.pem -C testchannel -n mycc -l golang -v 1.0 -c '{"Arg s":["init","a","100","b","200"]}' -P 'AND("Org1MSP.peer")'实例化链码，这时会有一个docker容器去运行指定的链码(8.6)。
- 执行peer chaincode query -C testchannel -n mycc -c '{"Args":["query","a"]}'查询a的数据，看是否初始化成功(8.6)。
- 执行peer chaincode invoke -o orderer0.example.com:7050 --tls true --cafile /opt/gopath/src /github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer0.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C testchannel -n myc c --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github. com/hyperledger/fabric/peer/crypto/peerOrganization/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -c '{"Args":["invoke","a","b","10"]}' 将a的10块钱转账给b(8.6)。
-  在第二台主机中执行docker exec -it cli bash 进入到客户端容器，执行peer chaincode query -C testchannel -n mycc -c '{"Args":["query","a"]}'查询交互后的a的值(8.7)。
- 在第三台主机上执行docker exec -it cli bash 进入到客户端容器，执行peer chaincode query -C -n mycc -c '{"Args":["query","b"]}'查询交互后的b的值(8.5)。
- 到这里基于Raft共识的多机fabric就已经搭建完毕了,希望大家能多提意见。