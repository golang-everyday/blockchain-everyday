### Hyperledger-Composer

#### introduction

- 简介：

  - hyperledger-composer是一个基于fabric的应用层开发工具，可快速、简单的开发区块链应用。其属于hyperleder家族成员之一。
- 架构组成：
  - Business NetWork Archive(**.bna**)
    - 该.bna文件，是由composer将业务层模型定义、打包所得到的，最终用来部署在fabric生产网络中，快速实现业务功能。
    - 其由四个类型文件生成：
      - Model File（**.cto**）：该文件用来定义数据模型。例如资产（Assets）、参与者（Particioants）、交易（Transactions）等。使用其特有的语法（[Modeling Language][id]）

        [id]:https://hyperledger.github.io/composer/latest/reference/cto_language.html

      - Script File（**.js**）: 该文件最终对应生成fabric层的chaincode。在应用层，实现具体的Transaction Functions。使用javaScript来实现。(暂时支持ES5语法)

      - Access Control（**.acl**）: 该文件用来定义访问控制规则。对比fabric层的acl，该文件为应用层规则，层级高，语法简单，实现快速。特有语法（[Access Control Language][id]）

        [id]:https://hyperledger.github.io/composer/latest/reference/acl_language.html

      - Query Definitions (**.qry**) ：该文件实现了查询功能。
    - 图例

![Business Network Archive_bna](https://github.com/golang-everyday/blockchain-everyday/tree/master/picture/hyperledger/hyperledger-composer/Business Network Archive_bna.png)

![composer应用开发架构](https://github.com/golang-everyday/blockchain-everyday/tree/master/picture/hyperledger/hyperledger-composer/composer应用开发架构.png)

 * 开发环境安装：

    * 安装客户端工具（不要使用**su**和**sudo**）

       * ```bash
         //composer cli
         npm install -g composer-cli@0.20
         ```

       * ```bash
         //一个提供rest apis的rest 服务器
         npm install -g composer-rest-server@0.20
         ```

       * ```bash
         //用于生成应用资产的实用工具
         npm install -g generator-hyperledger-composer@0.20
         ```

       * ```bash
         //使用Yeoman用来生成应用
         npm install -g yo
         ```

* 创建一个商业网络档案（business network archive）

  * 该网络档案，为.bna文件，即由Model File、Script File、Access Control、Query Definitions（可选）生成。

    * ```bash
      //生成.bna文件
      composer archive create -t dir -n .
      ```

* 部署商业网络

  * 将.bna安装到自己的fabric环境中，并启动网络。

    * ```bash
      composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna
      ```

    * ```bash
      composer network start --networkname tutorial-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
      ```

  * 将card（**身份卡片**）导入本地wallet，用于身份管理。

    * ```bash
      composer network import --file metworkadmin.card
      ```

  * 测试网络是否部署成功

    * ```bash
      //此处的admin为部署启动网络时，创建的网络管理员。
      composer network ping --card admin@tutorial-network
      ```

  * 生成一个REST server

    * ```bash
      composer-rest-server
      ```

#### 为一个单组织的fabric部署一个商业网络

 * 启动fabric环境（此处以一个fabric示例环境``fabric-dev-servers``为例，进行演示）

    * ```bash
      mkdir ~/fabric-dev-servers && cd ~/fabric-dev-servers
      curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
      tar -xvf fabric-dev-servers.tar.gz
      ```

   * ```bash
     //设置环境变量，下载fabric所需镜像
     cd ~/fabric-dev-servers
     export FABRIC_VERSION=hlfv12
     ./downloadFabric.sh
     ```

   * ```bash
     //启动fabric环境，并创建一个PeerAdminCard（用来安装、部署商业网络的身份）
     cd ~/fabric-dev-servers
     export FABRIC_VERSION=hlfv12
     ./startFabric.sh
     ./createPeerAdminCard.sh
     ```

* 查看fabric环境的相关配置项

  * ```bash
    //cryptogen配置文件路径
    ~/fabric-dev-servers/fabric-scripts/hlfv12/composer/crypto-config.yaml
    ```

  * ```bash
    //configtxgen配置文件路径
    ~/fabric-dev-servers/fabric-scripts/hlfv12/composer/configtx.yaml
    ```

  * organization

    * 组织名：org1，组织域名：org1.example.com，MSP：Org1MSP

  * network components（网络组件）

  ![network_components](https://github.com/golang-everyday/blockchain-everyday/tree/master/picture/hyperledger/hyperledger-composer/network_components.png)

  * Users

    * 配置了一个名为```Admin@org1.example.com```的组织管理员用户，该用户有权限为商业网络中的组织内所有peer节点安装chaincode，并有权限启动商业网络。

    * ```bash
      //Admin@org1.example.com的证书、私钥存储路径
      ~/fabric-dev-servers/fabric-scripts/hlfv12/composer/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
      ```

    * 除了admin，已经为org1中的ca配置了默认用户，该用户有名为```admin```的注册ID和```adminpw```的注册密码，但是这个用户不能部署区块链商业网络。

  * Channel

    * 创建一个名为```composerchannel```，并将peer节点```peer0.org1.example.com```加入channel。

* 创建一个连接配置文件（connection.json）

* 找到admin的证书和私钥

* 为fabric管理员创建业务网络card

* 导入fabric管理员的业务网络card

* 在fabric peer节点上安装业务网络

* 启动区块链业务网络

* 导入业务网络管理员的业务网络卡

* 未完待续...