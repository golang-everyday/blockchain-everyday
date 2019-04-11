### fabric-node-sdk

- 如果你连不上fabric：

  - 绝壁是你的配置文件问题

- Gateway使用注意：

  - `gateway.getClient()` 返回的client的MSPID一定是与钱包内的账户相对应的，假如做切换用户操作，一定要注意避开

- 切换账户：

  - 切换账户的时候一定要保证 client === null， 或者新建client， 再使用`setStateStore`方法

    ```js
    // 创建Client -> 从配置文件读取私钥  -> 存储在 ./tmp 目录下
    const client = new Client();
    client.setStateStore(await Client.newDefaultKeyValueStore({
        path: getStateStore(orgName) //这个方法仅仅是指定一个本地路径
    }));
    ```

- 动态更新：

  - **动态添加orderer不行**
  - 动态更新org，修改org或者添加节点等，**本质都是 更新channel**
  - 参考：
    - [命令行修改版](https://gerrit.hyperledger.org/r/#/c/13687/)
    - [nodeSDK修改版](https://github.com/hyperledger/fabric-sdk-node/blob/release-1.4/test/integration/configtxlator.js)