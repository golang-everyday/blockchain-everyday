### explorer

- 如果你连不上explorer
  - 绝壁是你的配置文件问题
  - explorer的配置文件与nodeSDK类似， 但是在配置文件上方加了一个 `client`项，注意仔细比对

- 当前explorer版本的bug比较多， 如果你遇到了什么不能解决的问题， 可以尝试切换版本


### 搭建区块链浏览器

> 目的：查看区块上的交易详细信息

[项目地址](https://github.com/hyperledger/blockchain-explorer)

#### 1. 安装依赖

- nodejs 8.11.x (9.x暂不支持)
- PostgreSQL 9.5 或更高版本
- Jq [https://stedolan.github.io/jq/]

#### 2. 下载项目

- `git clone https://github.com/hyperledger/blockchain-explorer.git`
- `cd blockchain-explorer`
- `git checkout -b release-3.8`

#### 3. 数据库设置

- `cd blockchain-explorer/app`

- 编辑 explorerconfig.json 更新 postgreSQL 信息

  - **信息要与本地数据库环境一致**
  - postgreSQL host, port, database, username, password details.

- ```json
  "postgreSQL": {
  
  "host": "127.0.0.1",
  
  "port": "5432",
  
  "database": "fabricexplorer", # 数据库名称，由下面的脚本创建
  
  "username": "hppoc", # 用户名
  
   "passwd": "password" # 密码
  
  }
  ```

- 运行创建数据库脚本:

  ```shell
  $ cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
  $ ./createdb.sh
  ```

- 运行数据库状态命令，查看连接到数据库是否正常

  ```shell
  sudo -u postgres psql
  ```

#### 4. 设置fabric参数

- **fabric** 配置文件路径

  - `blockchain-explorer/app/platform/fabric/config.json`
  - 在该路径下有几个官方给出的config文件可做参考（v0.3.9.1版本）

- 确保 在 `docker-compose.yaml`的配置文件中，为每一个peer节点添加了如下环境变量：

  - `CORE_PEER_GOSSIP_BOOTSTRAP`

  - `CORE_PEER_GOSSIP_EXTERNAL_ENDPOINT`

  - 以上两个环境变量是为了能够实现 fabric 的服务发现，以便本项目使用

    - 一般为peer0.org1.example.com:7051

    ```shell
    CORE_PEER_GOSSIP_BOOTSTRAP="peer0.org1.example.com:7051"
    CORE_PEER_GOSSIP_EXTERNAL_ENDPOINT="peer0.org1.example.com:7051"
    ```

    

- **ca** 配置文件路径

  - `blockchain-explorer/app/platform/fabric/config_ca.json`

  - 或者使用如下环境变量的方式进行配置：

    ```shell
    export ENROLL_ID="hlbeuser"
    export ENROLL_AFFILIATION="org1"
    export ADMIN_USERNAME="admin" #ca管理员id
    export ADMIN_SECRET="adminpw" #ca管理员密码
    ```

#### 5. 初始化区块链浏览器

**重要！每一次版本操作后都要进行！**

- 另起一个命令行窗口：
- `cd blockchain-explorer`
- `npm install`
- `cd blockchain-explorer/app/test`
- `npm install`
- `npm run test`
- 以下命令都在`blockchain-explorer/clien`t文件夹下操作：
- `cd client/`
- `npm install`
- `npm test -- -u --coverage`
- `npm run build`

#### 6. 启动项目

```shell
$ cd blockchain-explorer
$ node main.js #或者用脚本启动 ./start.sh
```

#### 7. 访问浏览器

本地端口：localhost:8080

> 可以在 blockchain-explorer/appconfig.json 中修改绑定端口，默认8080
