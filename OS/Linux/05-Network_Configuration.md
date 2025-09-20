# 网络配置

## 一、网卡配置文件

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

## 二、DNS 配置

### 2.2 resolv.conf 文件

位置：`/etc/resolv.conf`

作用：指定系统解析域名时使用的 DNS 服务器和搜索域（即刻生效）

```bash
nameserver 8.8.8.8
nameserver 8.8.4.4
```

**网卡 DNS 配置和 resolv.conf 之间的关系：**

1. 如果网卡中配置了 DNS，重启系统网卡会覆盖 resolv.conf
2. 如果网卡中不配置 DNS，则不会覆盖 resolv.conf

## 三、网络服务

查看系统当前开启的服务（netstat 包含在 `net-tools`软件包中）：

```bash
netstat -tnulp
```

