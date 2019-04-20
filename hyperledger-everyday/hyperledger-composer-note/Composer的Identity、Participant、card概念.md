#Composer的Identity、Participant、card概念

## 1. Participant

* **Participant**是区块链业务网络的**参与者**，可进行：操作assets，提交transactions，与其他participant进行assets交换等业务。可以理解为**业务网络中的用户**。

## 2. Identity

* **Identity**（身份）是**Fabric区块链**网络中的重要概念，它表示一个独立的用户身份，它由Fabric CA颁发，是权限控制的基础。一个Participant会拥有一个一个或多个Identity文档，用以表示这个Participant的身份多个方面；在与Fabric网络交互时，participant本身并不被允许与Fabric网络对话，因为它只是一个resource，是一个资源实例；它必须通过被Fabric CA认可的Identity文档证明当前的Participant的身份。也就是说：我们需要建立Participant—Identity的对应关系。
* 相关概念：
  * Issue(颁发)
    * 我们可以Issue一个新的Identity文档给一个Participant，这个Participant便可通过这个Identity与Fabric业务网络进行交互。
  * Bind(绑定)
    * 我们可以Bind一个现有的Identity文档给一个Participant。
  * Revoke(撤回)
    * 当Identity不再被允许使用时（比如：过期、被盗用），我们可以通过Revoke操作使这个Identity不再被允许来用来访问业务网络。Revoke操作并不会影响相关的Particpant或Assets，这二者与Identity是相互独立的。
  * Identity Registry(身份注册表)
    * Composer框架下的区块链业务网络会维护一个Identity Registry，保存所有的Issue、Bind产生的Identity-Participant之间的对应关系。  当一个participant利用拥有的identity文档连接到业务网络、提交交易时，Composer会从Identity Registry中寻找当前连接所用的Identity对应的Participant作为Current Participant。这样，我们就可以将Fabric CA所认证的身份转化为业务网络中的一个具体的参与者（Participant）。   在Access Control Rule中，我们可以看到，所有的授权规则都是以Paricipant为基础的，而Identity与Participant的对应正是其重要的实现步骤。
  * Active(激活)
    * 当Identity第一次被连接到Fabric网络使用时，会被激活，并产生、记录一些信息，比如：证书等。

## 3. Card

* Business Network Card文件（.card）是**Identity的载体**，它包含了到业务网络的**连接信息**，**Identity认证信息**。执行Issue Identity时，会生成对应的Card文件；客户端连接业务网络时，就是通过指定**Card名称**来确认Identity的。

* Card文件结构

  card文件是一个zip格式的压缩文件，主要有以下几个文件构成。

  * **meatadata.json**（Identity的相关信息），示例：

    ```json
    {
      "version": 1,
      "userName": "admin",
      "businessNetwork": "bikesharing-network",,
      "enrollmentSecret": "adminpw"
    }
    ```

    <username>@<businessNetwork>即组成以后通过 --card参数使用的Card名称。

  * **connection.json**（到业务网络的连接信息），示例：

    ```json
    {
      "name": "hlfv1",
      "x-type": "hlfv1",
      "x-commitTimeout": 300,
      "version": "1.0.0",
      "channels": ...,
      "organizations": ...,
      "orderers": ...,
      "peers": {
      	"peer0.org1.exmaple.com": {
      		"url": "grpc://localhost:7051",
      		"eventUrl": "grpc://localhost:7053"
    		}
    	},
    	"certificateAuthorities": ...
    }
    ```

  * **credentials**

    **credentials\certificate**，**credentials\privateKey**
credentials文件夹下的两个文件（**证书与私钥**）是可选的。如果没有credentials文件夹，则metadata.json文件夹中的enrollmentSecret属性必须存在。如果enrollmentSecret属性存在，则在执行Card导出时，就会在导出的Card文件中包括credentials文件夹。

* 导出Card

  * 当Card文件被连接使用后（激活Identity），如果这个Identity需要被其他客户端重用用以连接业务网络，则需要进行一次export（导出）操作，其他客户端应该使用这个导出的Card文件。

* Card Store与Wallet

  * 执行Composer CLI命令（如composer network，composer-rest-server）时，都需要指定--card参数，以指定Card文件；而在此之前，都需要执行composer card import操作，以导入一个Card文件。（在REST Server Web Page上同样也有类似操作，我们会稍后讲解。）

  * Composer Card文件路径

    ```bash
    /home/fabric/.composer/cards
    ```

    这个保存了很多Card的存储机制就是Card Store，在RESR Server web Page上表示为wallet。我们导入的将Composer CLI Command工具所使用的Card文件都会被Wallet保存下来，而Card文件里面会包括enrollmentSecret，以及CA颁发的证书，私钥，所以说，如果我们执行card import，那就意味我们是以"信任"那个Wallet为前提的。

    wallet的存储方式是可以配置的，并自定义其实现方式，比如：compiser-wallet-filesystem，composer-wallet-inmemory。

## 4. 身份认证

用户登陆REST Server Web Page时，系统可以分辨出当前用户所对应的Participant，以便在之后应用Access Control Rules。

* 颁发Identity

  * 使用identity issue

    ```bash
    $ composer identity issue --card admin@bikesharing-network --file bob.card
        --newUserId bob --participantId
        "resource:org.bikesharing.biznet.BikeUser#bu_1"
    ```

    运行成功后会生成bob.card文件。

  * card import

    ```bash
    composer card import --file bob.card
    ```

  * network ping

    ```bash
    composer network ping --card bob@bikesharing-network
    ```

    运行成功后返回内容如下：

    ```bash
    The connection to the network was successfully tested:
        bikesharing-network
     //…
     participant: org.bikesharing.biznet.BikeUser#bu_1
    identity:
        org.hyperledger.composer.system.Identity#b0a3c282d44cf76cab731eb25c473ee53a8ba87129da572381f542f5b415bb53
    Command succeeded
    ```

    其中：participant是这个Card对应的BikeUser#bu_1,

    Identity ID是 b0xxx…...

  * card export

    如果我们准备在REST Server Web Page中使用这个Card(即Identity)。但我们要先使用export导出Card，因为Identity已经使用并激活（active）。

    反正，如果我们只是issue成功，但在Composer CLI端并没有使用过这个Identity，而是直接将之在Rest Server Web Page中使用，那么，当我们想通过Composer CLI命令行工具重用这个Identity时，则需要在REST Server Web Page中将之导出。

    ```bash
    composer card export --card bob@bikesharing-network --file
        bob_export.card
    ```

    运行成功后，我们可以得到bob_export.card文件。

  * 导入Card

    通过浏览器访问RESR Server，点击进入POST /Wallet/import，"Choose file"，选择之前生成的bob_export.card文件，在name字段输入bob_export.card（这里可以使用其他便于理解的名字），点击Try it out!。

    执行成功后，再执行GET /wallet，会得到如下内容：

    ```json
    [
      {
        "name" : "bob_export.card",
        "dafault" : true
      }
    ]
    ```

    再执行SYSTEM GET system/ping，会得到如下内容：

    ```bash
    {
      "version": "0.19.4",
      "participant": "org.bikesharing.biznet.BikeUser#bu_1",
      "identity": "org.hyperledger.composer.system.Identity#b0a3c282d44cf76cab731eb25c473ee53a8ba87129da572381f542f5b415bb53"
    }
    ```

    通过participant及Identity属性内容，我们可以知道，此时通过浏览器登录REST Server访问bikesharing-network区块链业务网络的用户已经确定为之前得到的Fabric CA授权认证的Idetity bob@bikesharing-network。此用户对业务网络资源的所有操作都将以相关联的BikeUser#bu_1作为授权对象，为Access Control Rules控制。

    在Composer CLI命令行工具中使用的bob.card与在浏览器中使用的bob_export.card其实对应了同一个Identity：bob@bikesharing-network。

    此时，我们提交操作（如添加Asset, Participant，Transaction）后，在SYSTEM /system/historian中都会得到相应的"participantInvoking" : "resource：org.bikesharing.biznet.BikeUser#bu_1"。说明操作都是以这个Participant-Identity对应的身份进行的。

  * 撤销Identity

    通过revoke命令撤销Identity（bob@bikesharing-network）与Paritcipant（BikeUser#bu_1）之间的对应关系：

    ```bash
    composer identity revoke --card admin@bikesharing-network --identityId
        b0a3c282d44cf76cab731eb25c473ee53a8ba87129da572381f542f5b415bb53
    ```

    这里，--card参数是有权限执行revoke命令的Card; —identityId是bob@bikesharing-network的identityID(请注意替换)。

    命令执行后，再次执行REST Server Web Page上的操作，会提示类似"Error: The current identity, … has been revoked" 错误。

  * 设置 Default Card

     按上述方法，我们可以导入多个Card文件，以对应当前用户的多重身份。可以通过Wallet POST /wallet/{name}/setDefault设置某一个Card为默认。则之后通过此页面的操作都以此Card 作为Fabric Identity。

  ## 5.新的权限控制策略

  未完待续

