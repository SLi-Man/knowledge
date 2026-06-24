# Rsync

## 选项

- `-a`: 归档模式传输，保留文件所有属性，等于-tropgDl
- `-v`: 详细模式输出
- `-z`: 传输时进行压缩提高效率
- `-t`: 保留文件修改时间
- `-r`: 递归复制目录
- `-o`: 保留文件所有者
- `-p`: 保留文件权限
- `-g`: 保留文件所属组
- `-D`: 保留设备文件（限超级用户）
- `-l`: 保留符号链接
- `-P`: 显示传输速度
- `--bwlimit`: 限速 
- `--password-file=`: 指定密码文件，需600权限
- `--delete`: 无差异同步，以SRC为准
- `--exclude=PATTERN`: 排除匹配PATTERN的文件
- `--include=PATTERN`: 包含匹配PATTERN的文件

## 传输模式

### 本地模式

```bash
Local: rsync [OPTION...] SRC... [DEST]
```

案例：

```bash
# 拷贝文件
rsync -avz a.txt /opt/
# 拷贝目录下的文件，加“/”表示将abc下的文件拷贝至目标位置，相当于cp命令的abc/*
rsync -avz abc/ /opt/
# 拷贝目录本身
rsync -avz abc /opt/
```

### 远程模式

```bash
# 不加用户名时，默认使用当前登录的用户名去登录对方服务器
Pull: rsync [OPTION...] [USER@]HOST:SRC... [DEST]
Push: rsync [OPTION...] SRC... [USER@]HOST:DEST...
```

案例：

```bash
# 拉取远程文件
rsync -avz root@172.16.1.7:/root/7.txt ./
# 推送文件
rsync -avz abc root@172.16.1.7:/opt/
```

### 守护进程模式

修改文件：`/etc/rsyncd.conf`

```bash
uid = rsync                      # 运行进程的用户
gid = rsync                      # 运行进程的用户组
port = 873                       # 监听端口
fake super = yes                 # 无需让rsync以root身份运行，允许接收文件的完整属性
use chroot = no                  # 禁锢推送的数据至某个目录，不允许跳出该目录
max connections = 200            # 最大连接数
timeout = 600                    # 超时时间
ignore errors                    # 忽略错误信息
read only = false                # 对备份数据可读写
list = false                     # 不允许查看模块信息
auth users = rsync_backup        # 定义虚拟用户，作为连接认证用户
secrets file = /etc/rsync.passwd # 定义rsync服务用户连接认证密码文件路径
log file = /var/log/rsyncd.log   # 日志文件

[backup]           # 定义模块信息
comment = welcom to backup!   # 模块注释信息
path = /backup     # 定义接收备份数据目录
```

 创建虚拟用户：

```bash
useradd -M -s /sbin/nologin rsync
```

创建密码文件：`/etc/rsync.passwd`

```bash
rsync_backup:123456
```

修改密码文件权限：

```bash
chmod 600 /etc/rsync.passwd
```

创建目录：

```bash
mkdir /backup
chown rsync.rsync /backup
```

启动/开机自启：

```bash
systemctl start rsyncd
systemctl enable rsyncd
```

客户端连接：

```bash
rsync -avz abc rsync_backup@10.0.0.41::backup
```

## 案例

### 密码免交互

**1 使用参数指定密码文件**

```bash
echo 123456 > /etc/rsync.pass
chmod 600 /etc/rsync.pass  # 密码文件必须为600权限
rsync -avz abc rsync_backup@10.0.0.41::backup --password-file=/etc/rsync.pass
```

**2 使用Rsync的内置变量**

```bash
export RSYNC_PASSWORD=123456
rsync -avz abc rsync_backup@10.0.0.41::backup
```

## 实战

### 客户端需求

```bash
# 1. 准备环境
Date=`date +%F-%H-%M`
dir=`hostname`_`hostname -I|awk '{print $1}'`_$Date
mkdir /backup/$dir

# 2. 打包好备份到指定目录
tar czf /backup/$dir/etc_$Date.tar.gz /etc/hosts /etc/passwd &>/dev/null

# 3. 将打包的MD5写入md5.log
md5sum /backup/$dir/*.tar.gz > /backup/$dir/md5.log

# 3. 推送文件至备份服务器
export RSYNC_PASSWORD=123456
rsync -az /backup/$dir rsync_backup@172.16.1.41::backup

# 4. 客户端服务器本地保留近7天的数据
find /backup/ -mtime +7|xargs rm -rf
```

### 服务端需求

1. 配置好Rsync服务

2. 校验客户端数据是否完整

```bash
Date=`date +%F`
md5sum -c /backup/*_*_*/*.log > /backup/$Date.log
```

3. 服务端将每天结果通过邮件发送

   配置邮件服务：`/etc/mail.rc`

   ```bash
   set from=
   set smtp=smtps://smtp.exmail.qq.com:465
   set smtp-auth-user=
   set smtp-auth-password=
   set smtp-auth=login
   set ssl-verify=ignore
   set nss-config-dir=/etc/pki/nssdb/
   ```

4. 定时脚本

   ```bash
   # 1. 检查客户端数据是否完整
   Date=`date +%F`
   md5sum -c /backup/*_*_*/*.log > /backup/$Date.log
   
   # 2. 将校验后的结果发送邮箱
   if [ `grep FAILED /backup/$Date.log|wc -l` -ge 1 ];then
     echo '有失败结果，将发送邮件！'
     mail -s "$Date 检查结果" me@ilimeng.cn < /backup/$Date.log &>/dev/null
   fi
   
   # 3. 删除180天的数据
   find /backup -mtime +180|xargs rm -rf
   ```

## Sersync - 实时同步

Github: [wsgzao/sersync: rsync+inotify-tools](https://github.com/wsgzao/sersync)

安装依赖：

   ```bash
   yum install -y inotify-tools rsync
   ```

编辑配置文件：`confxml.xml` 后启动：

   ```bash
   ./serrsync2 -dro confxml.xml
   # d 守护进程 r 监控前推送 o 指定配置文件
   ```

   

