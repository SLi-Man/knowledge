# LVS (Linux Virtual Server)

## 概述

LVS 是基于 Linux 内核的四层负载均衡解决方案，由章文嵩博士开发，是 Linux 官方内核的一部分。

## 核心组件

- **IPVS (IP Virtual Server)**：内核模块，实现核心负载均衡逻辑
- **ipvsadm**：用户态管理工具，用于配置虚拟服务

## 工作模式{#WorkPattern}

| 模式 | 全称 | 说明 |
|------|------|------|
| DR | Direct Routing | 直接路由模式，性能最优 |
| NAT | Network Address Translation | 网络地址转换模式 |
| TUN | IP Tunneling | IP 隧道模式 |
| FWNAT | Full NAT | 完整 NAT 模式（已废弃） |

## 调度算法

1. RR (Round Robin) — 轮询
2. WRR (Weighted Round Robin) — 加权轮询
3. LC (Least Connection) — 最少连接
4. WLC (Weighted Least Connection) — 加权最少连接
5. LBLC (Locality-Based Least Connection) — 基于局部性的最少连接
6. LBLCR (Locality-Based Least Connection with Replication) — 带复制的 LBLC
7. SH (Source Hash) — 源地址哈希
8. DH (Destination Hash) — 目标地址哈希
9. PE (Ping Envoy) — 预测式调度

## 快速上手

### 安装 ipvsadm

```bash
# CentOS/RHEL
yum install ipvsadm

# Ubuntu/Debian
apt install ipvsadm
```

### 基本配置

```bash
# 添加虚拟服务
ipvsadm -A -t 192.168.1.100:80 -s rr

# 添加真实服务器（DR 模式）
ipvsadm -a -t 192.168.1.100:80 -r 192.168.1.10:80 -g
ipvsadm -a -t 192.168.1.100:80 -r 192.168.1.11:80 -g

# 查看规则
ipvsadm -L -n

# 删除虚拟服务
ipvsadm -D -t 192.168.1.100:80
```

## DR 模式配置要点

### Director 端

```bash
# 启用 IP 转发
echo 1 > /proc/sys/net/ipv4/ip_forward

# 绑定 VIP（不对外宣告 ARP）
ip addr add 192.168.1.100/32 dev eth0
echo 1 > /proc/sys/net/ipv4/conf/eth0/arp_ignore
echo 2 > /proc/sys/net/ipv4/conf/eth0/arp_announce
```

### Real Server 端

```bash
# 安装 arptables
# 配置 arptables 抑制对 VIP 的 ARP 响应
arptables -A IN -d 192.168.1.100 -j DROP
arptables -A OUT -s 192.168.1.100 -j mangle --mangle-ip-s 192.168.1.100
```

## 与 Keepalived 结合

Keepalived 提供 VIP 漂移和健康检查，与 LVS 搭配实现高可用负载均衡集群。

```
Keepalived (VIP 管理 + 健康检查)
    ↕
   LVS (IPVS 内核模块，四层负载均衡)
    ↕
  Real Server Pool
```

## 常见问题

### Q: DR 模式下 Real Server 为什么收不到请求？
- 检查 VIP 是否在 Director 和 Real Server 上正确绑定
- 确认 arptables 规则是否生效
- 检查内核参数 `arp_ignore` 和 `arp_announce`

### Q: 如何持久化 ipvsadm 规则？
```bash
# 保存规则
ipvsadm -S > /etc/sysconfig/ipvsadm

# 恢复规则
ipvsadm -R < /etc/sysconfig/ipvsadm
```

## 参考资料

- [LVS 官方网站](http://www.linuxvirtualserver.org/)
- [IPVS 调度算法](http://www.linuxvirtualserver.org/VS-Scheduling-Gs.html)
