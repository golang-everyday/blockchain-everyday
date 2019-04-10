### Hyperledger-Composer

- 简介：
  - hyperledger-composer是一个基于fabric的应用层开发工具，可快速、简单的开发区块链应用。其属于hyperleder家族成员之一。
- 架构组成：
  - Business NetWork Archive(***.bna***)
    - 该.bna文件，是由composer将业务层模型定义、打包所得到的，最终用来部署在fabric生产网络中，快速实现业务功能。
    - 其由四个类型文件生成：
      - Model File（***.cto***）：该文件用来定义数据模型。例如资产（Assets）、参与者（Particioants）、交易（Transactions）等。使用语法xxx
      - Script File（***.js***）: 该文件最终对应生成fabric层的chaincode。在应用层，实现具体的Transaction Functions。使用javaScript来实现。
      - Access Control（***.acl***）: 该文件用来定义访问控制规则。对比fabric层的acl，该文件为应用层规则，层级高，语法简单，实现快速。
      - Query Definitions (***.qry***) ：该文件实现了查询功能。
    - 未完待续。。。