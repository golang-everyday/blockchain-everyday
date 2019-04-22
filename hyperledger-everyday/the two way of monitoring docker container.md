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
- 直接在window中通过http://+你阿里云的ip+/zabbix可以直接对zabbix的web页面进行访问了，如下图，当然如果内网比较严格的话是访问不到的，这个就需要去ECS平台上去设置，只要两台机器互相能ping通就可以访问到了,一下图片是顺序的安装步骤图片。

![zabbix-index1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-index.png?raw=true)

![zabbix-index2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-index2.png?raw=true)

![zabbix-index3](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-index3.png?raw=true)

![zabbix-index4](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-index4.png?raw=true)

![zabbix-index5](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-index5.png?raw=true)

![zabbix-index6](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-index6.png?raw=true)

- 在以上安装步骤中，在web配置的第二张的图片中的所有配置项必须都是OK状态，其中有一些实在配置文件中配置好的，如果你按照我的步骤进行的话是没有问题的，另外还有就是可能有些别的配置依赖包没有安装上，这时你就可以选择用apt-get直接安装就可以了。完成以上步骤就可以完成zabbix的web安装了。
- 执行命令apt-get instal zabbix-agent安装zabbix的客户端。
- 执行命令vi /etc/zabbix/zabbix_agentd.conf进入到zabbix客户端的配置文件中，将配置项按照下列代码块配置好。

```
Server=你阿里云的主机ip
ListenPort = 10050 
ServerActive=你阿里云的主机ip
```

- 完成这步时就已经完成了zabbix的安装工作，接下来我们来进行编写脚本实现对主机上的docker进行监控的功能。
- 首先先完成脚本的编辑工作，第一个脚本是让zabbix发现监控主机上的所有的docker容器，我命令为docker_discovery.py,具体的脚本内容如下代码块。

```
#!/usr/bin/env python 
import os
import simplejson as json
t=os.popen("""sudo docker ps -a |grep -v 'CONTAINER ID'|awk {'print $NF'} """)
container_name = []
for container in  t.readlines():    
     r = os.path.basename(container.strip()) 
     container_name += [{'{#CONTAINERNAME}':r}]
print json.dumps({'data':container_name},sort_keys=True,indent=4,separators=(',',':'))

```

- 第二个脚本是对监控docker的cpu以及内存进行监控的脚本，我命名为docker_monitor.py,具体内容如下代码块。

```
 #!/usr/bin/env python
 import docker
 import sys
 import subprocess
 import os
  
 def check_container_status(container_name,collect_item):
     #docker_client = docker_client.containers.get(container_name)
     container_collect=docker_client.containers.get(container_name).stats(stream=True)
     old_result=eval(container_collect.next())
     new_result=eval(container_collect.next())
     container_collect.close()
     if collect_item == 'cpu_percent':
        cpu_total_usage=new_result['cpu_stats']['cpu_usage']['total_usage'] - old_result['cpu_stats']['cpu_usage']['total_usage']
        cpu_system_uasge=new_result['cpu_stats']['system_cpu_usage'] - old_result['cpu_stats']['system_cpu_usage']
        cpu_num=len(old_result['cpu_stats']['cpu_usage']['percpu_usage'])
        result=round((float(cpu_total_usage)/float(cpu_system_uasge))*cpu_num*100.0,2)
     elif collect_item == 'mem_percent':
        mem_usage=new_result['memory_stats']['usage']
        mem_limit=new_result['memory_stats']['limit']
        result=round(float(mem_usage)/float(mem_limit)*100.0,2)
     return result
if __name__ == "__main__":
    docker_client = docker.DockerClient(base_url='unix://var/run/docker.sock', version='1.27')
    container_name=sys.argv[1]
    collect_item=sys.argv[2]
    print check_container_status(container_name,collect_item)

```

- 第三个脚本是用来发送邮件报警的，我命名为sendmail.sh，非常简单就是一个发送邮件的命令，邮件的其他信息我们在zabbix的web界面中进行定义，具体内容如下代码块。

```
echo "$3" | mail -s "$2" "$1"
```

- 首先zabbix服务端中的脚本路径是在/etc/zabbix/zabbix_server.conf中的AlertScriptsPath配置项中配置的，默认的路径是/usr/lib/zabbix/alertscripts，当然路径也是可以自己定义的，将刚才写的三个脚本文件都放在默认的脚本目录下，提个醒，脚本写完之后命令行测试一下看好不好用，还有就是，如果你改动了zabbix客户端或者服务器的配置文件之后，需要使用/etc/init.d/zabbix_server(agent) restart命令重新启动一下。
- 然后是配置zabbix客户端文件中的配置项,执行命令vi /etc/zabbix/zabbix_agentd.conf 按照如下的代码块内容修改配置项。

```
UnsafeUserParameters=1 //这个必须配置，允许使用用户自定义的参数
UserParameter=docker_discovery,sudo python /usr/lib/zabbix/alertscripts/docker_discovery.py //这一行是添加自定义的zabbix_discovery文件
UserParameter=docker_status[*],sudo /usr/bin/python /usr/lib/zabbix/alertscripts/docker_monitor.py $1 $2//这一行是添加zabbix_monitor文件
UserParameter=sendmail[*],sudo /bin/bash /usr/lib/zabbix/alertscripts/sendmail.sh $1 $2 $3//这一行是添加sendmail.sh文件
Include=/etc/zabbix/zabbix_agentd.d/*.conf  //导入默认路径的配置文件的配置信息
```

- 执行完以上步骤之后，执行/etc/init.d/zabbix_server(agent) restart重新加载服务端配置信息， 重新加载客户端的配置信息，接下来就可以去设置web界面了。
- 首先是在页面中添加模板，点击zabbix页面最上面一行的Configuration，然后点击Template,进入到如下界面。

![zabbix-template1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-Template1.jpg?raw=true)

- 然后点击右上角的Create Template,按照如下图片进行填写。

![zabbix-template2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-Template2.jpg?raw=true)

- 点击Update,我这里是我以前写的模板，所以是Update,你那里应该是Add,而且对于Hosts的添加，选择了Zabbix-server以及docker_monitor，Zabbix-server是默认监控本地主机的，docker_monitor是我自己添加的监控我的阿里云主机的，这个需要你添加hosts，接下来即将介绍到。
- 首先是在页面添加host主机，就是你要监控的主机，点击web页面最上面的Configuration，然后点击Host groups，点击Zabbix servers同行的Hosts，进入到如下界面。

![zabbix-host](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-host.jpg?raw=true)

- 点击右上角的Create host，按照如下图片填写，填写完成后点击添加。

![zabbix-host2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-host2.jpg?raw=true)

- 在添加完之后你会得到如下界面，就是刚创建的docker_monitor使用的模板就是我们在第一步创建的Docker_

Template.

![zabbix-host3](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-host3.jpg?raw=true)

- 接下来我们就可以直接在模板中添加监控的信息。在Configuration->Templates下找到刚刚创建的Docker Template点击同一行的Applications添加应用，如下图，这里我已经创建好了一个docker_discovery。

![zabbix-application](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-Application.jpg?raw=true)

- 注意添加这个应用是和我们写的docker_discovery.py脚本进行交互的，就是去发现所有的docker容器，application的名字必须要和所写的脚本的名字一样才可以，现在点击右上角的Create application创建应用，按照下图填写。

![zabbix-application2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-application2.jpg?raw=true)

- 接下来点击Discovery rules选项去定义发现规则，界面如下。

![zabbix-rule](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-rule.jpg?raw=true)

- 点击右上角的Create discovery rule,按照如下界面填写。

![zabbix-rule2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-rule2.jpg?raw=true)

- 创建好发现规则之后，点击同一行的Item prototypes添加项目原型，界面如下图。

![zabbix-item1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-item1.jpg?raw=true)

- 这里我们配置的是监控docker的cpu以及memry的监控项，我已经创建好了，点击右上角的Create item prototype按照如下几幅图的tian写就ok了。

![zabbix-item2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-item2.jpg?raw=true)

- 这一项我们定义的是对dockercpu的监控，因为通过脚本运算得到的是百分比，所以要加%。

![zabbix-item3](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-item3.jpg?raw=true)

- 这里是对docker memry的监控，同cpu监控一样，完成两个项目原型的创建之后，我们就可以看到监控docker的效果了，我这里随便地起了几个之前测试用的docker容器，点击Monitoring->Lastest data ,选择对主机docker_monitor监控就可以了，效果如下图。

![zabbix-lastest](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-lastest.jpg?raw=true)

- 其中，灰色的是当前主机中退出的或者是以前监控过的docker容器，黑色的是up状态的docker容器，可以点击Graph查看docker的cpu以及内存在各个时间段的线性图。

- 执行到这一步就已经可以对docker进行监控了，接下来我们介绍一下如何自己去配置一个报警器，然后当触发报警器时想指定的邮箱定时发送邮件。
- 点击Configuration->Template,点击Docker Template 的Discovery,最后点击docker_discovery的Trigger prototypes，得到如下界面。

![zabbix-trigger1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-trigger1.jpg?raw=true)

- 这里我已经创建好了检测docker的cpu以及内存的报警器了，你可以点击右上角的Create trigger prototype,按照下图进行填写。

![zabbix-trigger2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-trigger2.jpg?raw=true)

![zabbix-trigger3](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-trigger3.jpg?raw=true)

- Name填写{#CONTAINERNAME}是zabbix去找监控docker的名字的语法，expression里面写了出发报警器的阈值，比如这里写的是docker容器的cpu或内存使用率大于80%，可以根据自己的需求去更改。

- 接着需要添加邮件媒介，点击Administration->Media types,点击右上角的Create medir type,按照下图填写。

![zabbix-media1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-media1.jpg?raw=true)

- 接下来我们需要添加一个管理员权限的用户，点击Administration->Users，点击右上角的Create user，按照下图填写。

![zabbix-user1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-user2.jpg?raw=true)

![zabbix-user3](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-user3.jpg?raw=true)

![zabbix-user4](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-user4.jpg?raw=true)

- 添加用户一共需要填写三个大的配置项，第一张图是创建用户名以及用户所属的用户组；第二张图给用户添加报警媒介，这里我们选择刚创建的Script，因为使用的是邮件，所以需要填写邮件接收人的地址；第三张图是对用户的权限进行设置，这里是选择Admin的权限。
- 接下来定义出发动作Action,Action是将从触发报警器到发送邮件之间的媒介，点击Configuration->Actions,点击右上角Create action,按照下图填写。



![zabbix-action1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-action1.jpg?raw=true)

![zabbix-action2](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-action2%20.jpg?raw=true)

![zabbix-action3](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-action3.jpg?raw=true)

- 以上三幅图都是action的配置，第一个是配置action所监控的报警器，这里选择的Trigger如果阈值被触发，那么，就会出发action发送邮件，第二张图是配置邮件的内容，下面的Operations配置的邮件发送的时选择的媒介，这里选择的是刚创建的Script方式，第三章是当容器恢复到正常状态时的邮件内容。
- 进行到这一步，我们就已经将zabbix设置好了，现在我们进行测试，我们将cpu的trigger改成大于0就触发报警器，可以点击Reports->Action log去查看邮件发送情况，如下图。

![zabbix-action-log](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-action-log.jpg?raw=true)

- action的log日志显示邮件已经发送，下面来看看邮箱报警，如下图。

![zabbix-mail1](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-mail1.jpg?raw=true)

- 如上图所示，发来报警邮件，之所以有一个OK状态的邮件是因为，我把报警器又重新调回了80%，所以docker恢复正常了，也给你的邮箱发送恢复邮件，下面看一下problem以及OK状态的邮件的具体内容，如下图。

![zabbix-ok-mail](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-ok-mail.jpg?raw=true)

![zabbix-problem-mail](https://github.com/golang-everyday/blockchain-everyday/blob/master/hyperledger-everyday/zabbix-pictures/zabbix-problem-mail.jpg?raw=true)

- 进行到这步，文件要介绍的监控docker容器发送报警邮件的内容就此告一段落，最后总结一下两种方法。
- 通过脚本和linux工具crontab配合实现起来比较容易，这个主要是真对docker的状态，通过监测docker的状态，来进行报警，但是不知道具体是什么原因导致docker异常退出的。
- 用zabbix和脚本来监控docker的方式实现起来有一些麻烦，但是可以对docker的cpu以及内存进行监控，但是docker的cpu以及内存的使用实际上就是宿主机本机使用情况，阿里云平台就有监控主机的功能，支持邮件短信，功能更加强大。从另外一方面来说，实际开发环境中，fabric接收交易的数量非常庞大，可能一瞬间就把docker给down掉了，这样zabbix是无法对docker进行监控了，所以，大家对于zabbix的话可以斟酌使用。

