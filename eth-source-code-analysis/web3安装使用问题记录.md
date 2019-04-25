
### web3 安装使用报错问题记录：
##### 1.(0949) AssertionError [ERR_ASSERTION]: Invalid callback specified.
				
解决办法：
(1)Solc前几天发布了一个破解版本，这个错误与此有关。
(2)npm uninstall solc
(3)npm install solc@0.4.25

解决链接：https://stackoverflow.com/questions/53353167/npm-solc-assertionerror-err-assertion-invalid-callback-specified

##### 2.node deploy.js 报错 Error: Cannot find module 'web3'
解决办法：
会出现Cannot find module ‘web3’的问题解决方法如下：

(1)首先输入npm init初始化（执行过程中全部回车就好了，全部默认）
(2)然后输入npm install ethereum/web3.js --save
(3)重复 
 解决链接：https://blog.csdn.net/qq_41185868/article/details/80927673
 
  		
##### 3.web3版本问题  请检查你的web3.js版本：
如果version<1.0.0，使用：
web3.eth.contract(studentFactoryArtifact,address);// 注意区分contract大小写
如果version>1.0.0，使用：
new web3.eth.Contract(studentFactoryArtifact,address); // 注意区分Contract大小写

##### 4.问题出现，TypeError: web3.eth.Contract is not a constructor

如果部署中出现 问题：TypeError: web3.eth.contract is not a function

则需要安装 0.19版本的 web3，命令如下：

npm install web3@^0.19.0 --save

npm install web3@^1.0.0-beta.37

安装完成后，问题修复。
(注：这会降低版本,小心使用)
 