# 关于监控docker容器状态的两种方式

​        在fabric生产环境中的底层网络搭建相信大部分公司会采用docker的方式，根据各个节点的情况以及公司的服务器数量来决定整个网络的搭建分布，比如一些占内存较大的节点(couchdb,peer)需要单独放在一台服务器上，同时在fabric1.4.1之前没有raft算法，大家都使用kafka这种共识组件的时候，就需要对kafka集群以及负责维护它数据状态的集群zookeeper进行分配，比较麻烦(相对于raft来说)，当然，fabric中的共识模块属于可插拔，一些公司会根据自己的需求将一些其他的共识算法加进去，这里不再赘述。本篇文档就是通过脚本工具监测各个fabric底层网络的节点docker的状态，当这些容器的status出现Exited的时候，能够将这些情况及时地通过邮件等方式反馈给开发人员，避免数据积压，不然的话，你只能时刻关注区块链浏览器上显示的最新数据去发现问题了，首先，docker容器退出会有两种形式导致退出，一种是cpu使用率过大导致容器异常退出，这种一般会发生在anchor节点上，说白了 就是一个节点承担了太多角色，数据量访问过大，给它累死了,当有这种情况发生的时候，可以通过peer restart的方式将它重新的启动起来就可以了，这种也可以使用脚本实现；另外一种就是主机的内存满了导致docker容器异常退出，这种情况一般发生在比如couchdb这种节点上，这种肯定不能通过peer restart的方式启动，这种就需要你给你们的服务器加个大一点的硬盘，或者你跟老板申请再去买一台性能好的服务器。

​        本文档提供两种监控docker邮件报警的方式，一种是通过脚本与linux中的crontab结合，比较简单实现的一种方式；另一种就是通过使用zabbix工具去监控docker的内存使用率以及cpu使用率，根据你设置的阈值去进行邮件报警。

### 1. 使用脚本配合Linux进行监控docker容器的状态

- 首先是给你的阿里云服务器安装mailx，使用这个工具可以帮你去访问相应的stmp服务器。
- 接着编写脚本，我这里是使用python编写监控脚本的，所以需要安装一些关于python脚本的模块。
- 最后在linux工具crontab中去定义你需要执行脚本的间隔时间，我这里是每隔30秒去执行一次监控脚本。

###### 1.1安装mailx

- 执行命令apt-get install sendmail安装发送邮件的功能，这会给你提供一个smtp服务器，不然发邮件的时候就会总报you need a smtp server之类的错误。
- 执行命令apt-get install bsd-mailx 安装我们需要安装的mailx的工具。
- 当下载mailx完成后，在/etc目录下回多出叫s-nail.rc的文件，执行命令vi /etc/s-nail.rc进入到文件中，在文件中的最后一行将图1.1的代码填写到s-nail.rc文件的最后，这些代码主要是配置你自己作为发送邮件的一方的账号信息，这里以163邮箱为例，每一行需要的信息我已经在下面代码块中标注出来了。

```
set from="******@163.com"//这里是填写你的163邮箱的账户名
set smtp="smtps://smtp.163.com:25"//这里是你要访问的163邮箱的stmp服务器的地址，25号端口有的时候会被封禁，这时候将25改用465即可
set smtp-auth-user="***********@163.com"//这里是你去访问stmp服务器的用户名
set smtp-auth-password="*********"//这个不是你账号的密码，而是你账号的客户端授权码
set smtp-auth=login//这是是指定是以登陆的方式去访问stmp服务器

```

- 这时候如果你发邮件的话，邮件会发送成功，但是速度会很慢，这个的主要原因是因为你的DNS解析的很慢，需要配置/etc/hosts文件，执行命令vi /etc/hosts进入到hosts文件中，按照如下代码块中的配置进行改动。

```
127.0.0.1 localhost.localdomain localhost6 localhost6.localdomain6 *******
//hosts文件中有很多行 在解析DNS的时候是从文件最上面一行一行解析的，只需要改动127.0.0.1开头的这一行就行了后面****那里填写上你当前的用户名就行了，注意不是root,是你当前root@的那个名字
```

- 执行命令 echo "邮件的正文" | mail -vs "邮件的标题" “邮件的接收地址”  执行完命令邮件就会发送到了制定的地址了，但是qq邮箱的话会有反垃圾机制，这一点你可以通过在修改你个人账户的收信规则，163和企业邮箱我这里都没问题，执行到这，我们就完成了命令行发送邮件的功能。

#### 1.2编写监控docker的脚本

> ​        这里写一下编写脚本的思路，脚本使用python进行编写，很简单，编写的思路就是先获取到当前主机中所有运行的docker，通过docker的status把所有已经是Exited状态的docker容器都筛选出来，将这些容器的名字都放到一个数组中，这时候，需要你选择要监控哪个docker容器的status,由于公司有需求，所以选择的是peer节点的容器，遍历整个数组，做个判断是否有你所要监控的容器，有的话就发送邮件报警，以下是脚本的具体实现代码。

```
#!/usr/bin/env python
import os
def docker_status_discovery(docker_status_finder):
    for containerid in docker_status_finder.readlines():
        if containerid=='cli\n':
            os.system('echo "hyperledger/fabric-peer Exited"|mail -s "Docker Exited" "***********@163.com" ')
    return
if __name__=="__main__":
    docker_status_finder = os.popen("""sudo docker ps -a |grep 'Exited'|awk {'print $NF'} """)
    docker_status_discovery(docker_status_finder)

```

####  1.3结合linux的crontab工具定时地检测制定docker容器

- 执行命令cron start 将cron服务启动起来
- 执行命令crontab -e 定义指定脚本的访问时间以及脚本的路径，这里如果报命令找不到什么的，就需要安装一下apt-get.
- 执行完上步，会进入到一个文件中，在文件最后一行里添加以下代码，表示每隔30秒访问一次指定的脚本，注意，脚本路径需要用绝对路径来指定。

```
* * * * * sleep 30;python /root/peer0.py
```

- 如果有小伙伴儿需要不同的时间的去执行脚本，[参考这里](https://www.cnblogs.com/lgqboke/p/5805809.html)。

> ​        通过python脚本去监控指定docker容器的第一种方式就介绍就告一段落，下面开始介绍一下用zabbix监控docker容器的cpu以及内存的使用率，根据你设定的阈值进行邮件报警。

### 2.使用zabbix结合脚本实现对docker容器的批量监控

- 首先，在阿里云上安装zabbix,包括zabbix-agent、zabbix-server以及一些依赖的安装，依赖主要包括php的一些包，因为web界面是用php写的，还有就是mysql数据库。zabbix的监控的大致思路就是将zabbix-server作为一个信息中心不断向zabbix-agent获取数据，也就是说zabbix-agent安装在你想要检测的主机上，然后再安装了zabbix-server的主机上看到监控数据的情况，我是在一台主机上安装了agent和server,在window上用web界面来检测阿里云上的docker状态，通过修改web界面来得到自己想要的结果。
- 编写docker脚本，脚本一共有两个，第一个脚本是用来发现当前运行正常的docker容器都有哪些，我命名为docker_discovery.py，另一个脚本是用python提供的docker模块，来获取到各个docker容器的cpu以及memry的使用情况，这个脚本我命名为docker_monitor.py。
- 然后是给你的阿里云主机安装mailx，这个再上节已经讲过，不再赘述，然后需要编写一个专门发邮件的脚本，就叫它sendmail吧。
- 最后是在web页面配置Trigger以及media来进行邮件报警。

#### 2.1安装zabbix

- 执行命令apt-get install apache2 -y安装阿帕奇
- 执行命令apt-get install mysql-server -y安装mysql
- 执行命令apt-get install php7.0  php7.0-gd libapache2-mod-php7.0 php7.0-mysql php7.0-bcmath php7.0-mbstring php7.0-xml安装前端web页面所需要的php文件,
- 由于zabbix的前端界面会对配置文件中的一些配置项有硬性的需求，所以需要去修改配置文件，执行命令vim /etc/php/7.0apache2/php.ini 通过vim的搜索功能找到以下代码块中的配置项，并改成相应的数值。改好之后，执行命令/etc/init.d/apache2 restart重启阿帕奇。

```
date.timezone = Asia/Shanghai  # 时区改为亚洲上海
max_input_time = 300           # 每个PHP页面接收数据所需的最大时间
max_execution_time= 300        # 超时设置
post_max_size = 16M            # 设定 POST 数据所允许的最大大小
```

- 执行命令wget http://repo.zabbix.com/zabbix/3.2/ubuntu/pool/main/z/zabbix-release/zabbix-release_3.2-1+xenial_all.deb 拉取zabbix的安装包，执行dpkg -i zabbix-release_3.2-1+xenial_all.deb安装zabbix,安装完成之后执行命令apt-get update进行更新。
- 执行命令apt-get install zabbix-server-mysql安装zabbix服务端。
- 执行命令mysql -uroot -p -e "create database zabbix character set utf8"创建zabbix表
- 执行命令 mysql -uroot -p -e "grant all on zabbix.* to 'zabbix'@'localhost' identified by 'zabbix'"创建mysql账号，密码是zabbix。
- 执行命令zcat /usr/share/doc/zabbix-server-mysql/create.sql.gz | mysql -uzabbix -p zabbix拷贝当前的数据表到Mysql,注意这个时候需要的密码是你刚才刚刚设置的zabbix密码。
- 在后面马上要安装zabbix前端的web页面，那个时候访问页面登录会有用户名和密码，这些需要在zabbix-server.conf中配置好，执行命令vi /etc/zabbix/zabbix_server.conf进入到zabbix服务器配置文件中按照下面的代码块找到相应的配置项并修改成对应的数值。

```
DBHost=你主机的ip
DBName=zabbix
DBUser=zabbix
DBPassword=zabbix
```

- 执行命令/etc/init.d/zabbix-server restart让zabbix服务器重新加载配置项。
- 执行命令apt-get install zabbix-frontend-php安装前端web界面。
- 执行命令cp -r /usr/share/zabbix /var/www/html/zabbix将zabbix拷贝到前端文件中，这里面zabbix的路径根据不同的操作系统路径不同，注意一下。
- 直接在window中通过http://+你阿里云的ip+/zabbix可以直接对zabbix的web页面进行访问了，如下图，当然如果内网比较严格的话是访问不到的，这个就需要去ECS平台上去设置，只要两台机器互相能ping通就可以访问到了。

