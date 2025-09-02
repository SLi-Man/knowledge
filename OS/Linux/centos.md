# Linux 配置文件和日志

## 1  Linux 系统重要配置文件

### 1.1 网卡配置文件

位置：`/etc/sysconfig/network-scripts/ifcfg-eth0`

```bash
TYPE=Ethernet       # 网络类型 以太网
BOOTPROTO=none      # 配置 IP 地址方式 dhcp、none、(static)
NAME=eth0           # 网卡在系统中显示的名称
DEVICE=eth0         # 网卡硬件的名称
ONBOOT=yes          # 开机自动运行 network 服务
IPADDR=10.0.0.200   # IP 地址
PREFIX=24           # 子网掩码
GATEWAY=10.0.0.2    # 网关
DNS1=223.5.5.5      # DNS 服务器
```



### 1.2 fstab 文件

位置：`/etc/fstab`

作用：开机自动挂载磁盘

```bash
UUID=63A4-5525  /boot/efi       vfat    umask=0077      0       1
# 第一列：设备名称，可以是 UUID，也可是使用设备名称
# 第二列：挂载点
# 第三列：系统文件的类型
# 第四列：挂载参数，默认 default 即可
# 第五列：开机自检，0不自检 1自检
# 第六列：开机备份，0不备份 1备份
```



### 1.3  resolv.conf 文件

位置：`/etc/resolv.conf`

作用：指定系统解析域名时使用的 DNS 服务器和搜索域（即刻生效）

```bash
nameserver 8.8.8.8
nameserver 8.8.4.4
```

网卡 DNS 配置和 resolv.conf 之间的关系：

1. 如果网卡中配置了 DNS，重启系统网卡会覆盖 resolv.conf
2. 如果网卡中不配置 DNS，则不会覆盖 resolv.conf



### 1.4 rc.local 文件

位置：`/etc/rc.local`

作用：开机启动命令

第一次使用需要添加权限：`chmod +x /etc/rc.local`



### 1.6 inittab 文件

位置：`/etc/initab`

#### 1.6.1 Linux 运行级别

- 0  表示关机
- 1  表示单用户，类似 Windows 安全模式
- 2  表示多用户，但是不支持 NFS（缺少很多功能，很少用）
- 3  表示完全多用户，默认运行在 3 级别
- 4  保留待开发
- 5  表示桌面运行级别，需提前安装 DESKTOP 包
- 6  表示重启

查看系统的运行级别：`runlevel`
进入到对应的级别：`telinit <level>`



### 1.5 motd 文件

位置：`/etc/motd`

作用：开机提示文字



### 1.6 issue & issue.net 文件

位置：`/etc/issue` & `/etc/issue.net`

 安全优化：这两个文件最好清空，防止内核信息暴漏。



## 2 proc 下重要的配置文件

```bash
/proc 内存的映射
1. /proc/cpuinto  查看 cpu 的信息
2. /proc/meminfo  查看内存的信息
3. /proc/loadavg  查看负载的信息
4. /proc/mounts   查看挂载的信息，唯一需要掌握的文件，其它都通过命令代替
```

#### 2.1 相关命令

**lscpu** 查看 cpu 的信息

**free** 查看内存的信息，常用 -h 参数

**df** 查看磁盘信息

**uptime** 查看系统负载

```bash
 15:44:16 up  1:06,  1 user,  load average: 0.00, 0.04, 0.17
 系统时间   运行时间    连接用户    平均负载     1分钟  5分钟 10分钟
 平均负载：数值接近或者超过系统核心数，则表示非常繁忙
```

**w** 查看系统负载和用户信息

```bash
 15:54:25 up  1:16,  1 user,  load average: 0.00, 0.01, 0.09
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    192.168.2.200    14:39    1.00s  0.31s  0.05s w
```



## 3 var 系统配置文件

### 3.1 messages 文件

位置：`/var/log/messages`

说明：系统日志文件



### 3.2 secure 文件

位置：`/var/log/secure`

说明：系统登录和退出日志



### 3.3 日志查看命令

**tail**

```bash
1. tail      # 显示文件的最后 10 行
    -n 数字  # 显示文件末尾的第 n 行，可简写为 -数字
    -f      # 实时显示文件内容
    tailf == tail -f 
    
# 通过管道符将命令结果输出给 tail 命令
ps: ip addr | tail -2
```

**grep**


```bash
2. grep '过滤的内容' file  # 过滤文件中的单词，默认是模糊匹配（匹配行）
    -w    # 精准匹配
```

**head**

```bash
3. head    # 显示文件的前 10 行，基本语法与 tail 一致
```



 
