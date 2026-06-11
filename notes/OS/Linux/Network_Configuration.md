# 网络配置

## #1 网卡配置文件

位置：`/etc/sysconfig/network-scripts/ifcfg-eth0`（CentOS7）

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

---

## #2 DNS 配置

### resolv.conf 文件

位置：`/etc/resolv.conf`

作用：指定系统解析域名时使用的 DNS 服务器和搜索域（即刻生效）

```bash
nameserver 8.8.8.8
nameserver 8.8.4.4
```

**网卡 DNS 配置和 resolv.conf 之间的关系：**

1. 如果网卡中配置了 DNS，重启系统网卡会覆盖 resolv.conf
2. 如果网卡中不配置 DNS，则不会覆盖 resolv.conf

## #3 网络服务

查看系统当前开启的服务（netstat 包含在 `net-tools`软件包中）：

```bash
netstat -tnulp
```



查看公网IP：

```bash
curl cip.cc
```



## #4 网络命令

### tcpdump - 抓包工具

```bash
tcpdump [-adeflnNOpqStvx][-c<数据包数目>][-dd][-ddd][-F<表达文件>][-i<网络界面>][-r<数据包文件>][-s<数据包大小>][-tt][-T<数据包类型>][-vv][-w<数据包文件>][输出数据栏位]
```

- `-nn`: 不把端口号转换成应用层协议
- `-n`: 不把IP解析成主机名
- `-vv`: 输出详细报文
- `-v`: 输出稍微详细报文
- `-i`: 指定监听的网卡

```bash
# 常用
tcpdump -nnvvi <网卡>

# 默认启动
tcpdump -vv # 默认情况下将监视第一个网卡下的数据
```

过滤主机：

- `[src|dst] host`

```bash
tcpdump -i eth0 host 10.0.0.2
tcpdump -i eth0 src host 192.168.1.1
tcpdump -i eth0 dst host 192.168.1.1
```

过滤端口：

- `[src|dst] port`

```bash
tcpdump -i eth0 port 80
tcpdump -i eth0 src port 80
tcpdump -i eth0 dst port 80
```

过滤协议：

```bash
tcpdump -i eth1 arp
tcpdump -i eth1 ip
tcpdump -i eth1 tcp
tcpdump -i eth1 udp
tcpdump -i eth1 icmp
```

### ping  - 测试连接

- `-c`: 数据包个数
- `-W`: 延迟时间（秒）

```bash
ping -c1 -W1 www.baidu.com
```

### nc - netcat

- `-l`: 监听一个端口

```bash
nc -l 12345  # 监听12345端口
```

### nmap - 扫描端口

扫描指定主机开放了哪些端口，不指定端口将扫描全部。

- `-p`: 指定端口

案例：写一个脚本探测自己所有服务器上开放的服务及端口，并计算某些服务占所有服务的百分比，70台服务器。

### netstat - 网络状态

```bash
netstat [-acCeFghilMnNoprstuvVwx][-A<网络类型>][--ip]
```

- `-a`：--all 显示所有连接中的socket
- `-t`：--tcp 显示TCP的连接状况
- `-u`：--udp 显示UDP的连接状况
- `-n`：--numeric 不通过DNS，直接使用IP地址
- `-l`：--listening 显示监听中的socket
- `-p`：--programs 显示正在使用socket的程序识别码和程序名称

### ss - 网络状态

跟netstat类似。

- `-a`: 显示所有socket
- `-n`: 不做DNS解析

### traceroute 路由跟踪

- `-n`: 不做DNS解析
- `-I`: 

```bash
traceroute -n -I www.baidu.com
```

### iftop - 流量监控

- TX：发送流量
- RX：接收流量
- TOTAL：总流量
- cum：运行iftop起产生的总流量
- peak：流量峰值
- rates：分别表示过去2s 10s 40s 的平均流量

dstat - 实时流量

```bash
dstat -nf
```

