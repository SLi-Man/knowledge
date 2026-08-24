# Keepalived

## 概述

Keepalived 是一个基于 VRRP 协议的高可用（High Availability）解决方案，最初专为 LVS 负载均衡器设计，现已扩展支持通用的 VIP 漂移和健康检查功能。

## 核心功能

| 功能 | 说明 |
|------|------|
| **VRRP** | 虚拟路由冗余协议，实现 VIP 漂移 |
| **健康检查** | 支持 TCP、HTTP、HTTPS、MISC 等多种检查方式 |
| **LVS 集成** | 自动管理 IPVS 规则，配合 LVS 实现高可用负载均衡 |
| **通知脚本** | 状态切换时执行自定义脚本 |
| **配置同步** | 支持全局配置，简化多节点管理 |

## 架构原理

```
┌──────────────┐     VRRP 组     ┌──────────────┐
│  Master 节点  │ ◄────────────► │  Backup 节点  │
│              │                 │              │
│  VIP (192.168.1.100)          │              │
│  Keepalived  │                 │  Keepalived  │
│  LVS (IPVS)  │                 │  LVS (IPVS)  │
└──────┬───────┘                 └──────────────┘
       │
  ┌────┴────┐
  │ Real Server Pool │
  └─────────┘
```

## VRRP 状态

| 状态 | 说明 |
|------|------|
| MASTER | 持有 VIP，处理流量 |
| BACKUP | 待命，监听 MASTER 的 VRRP 通告 |
| FAULT | 故障状态，通常会触发故障转移 |
| INIT | 初始状态，等待 VRRP 启动 |

## 安装

### CentOS/RHEL

```bash
yum install -y keepalived
```

### Ubuntu/Debian

```bash
apt install -y keepalived
```

### 源码编译

```bash
# 安装依赖
yum install -y gcc-c++ openssl-devel libnl3-devel

# 编译安装
./configure --prefix=/usr/local/keepalived --with-kernel-dir=/lib/modules/$(uname -r)/build
make && make install
```

## 核心配置

配置文件：`/etc/keepalived/keepalived.conf`

### 全局配置

```conf
global_defs {
    router_id LVS_MASTER
}
```

### VRRP 实例（Master 节点）

```conf
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 150
    advert_int 1

    authentication {
        auth_type PASS
        auth_pass 12345678
    }

    virtual_ipaddress {
        192.168.1.100
    }
}
```

### VRRP 实例（Backup 节点）

```conf
vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1

    authentication {
        auth_type PASS
        auth_pass 12345678
    }

    virtual_ipaddress {
        192.168.1.100
    }
}
```

## 非抢占模式

1. 两个节点的 state 都为 BACKUP
2. 两个节点都加上配置 nopreempt
3. 其中一个节点的优先级必须要高于另一个节点的优先级

## 

## 健康检查脚本

### TCP 检查

```conf
vrrp_script chk_tcp {
    script "/bin/bash -c 'echo >/dev/tcp/127.0.0.1/8080'"
    interval 2
    weight -20
    fall 2
    rise 1
}
```

### HTTP 检查

```conf
vrrp_script chk_http {
    script "/usr/bin/curl -o /dev/null -s -w '%{http_code}' http://127.0.0.1:8080/health | grep -q 200"
    interval 2
    weight -20
    fall 3
    rise 1
}
```

### 进程检查

```conf
vrrp_script chk_process {
    script "/bin/pidof nginx"
    interval 2
    weight -30
}
```

### LVS 规则检查

```bash
#!/bin/bash
# /etc/keepalived/check_lvs.sh
if ipvsadm -L -n 2>/dev/null | grep -q "192.168.1.100"; then
    exit 0
else
    exit 1
fi
```

```conf
vrrp_script chk_lvs {
    script "/etc/keepalived/check_lvs.sh"
    interval 2
    weight -20
}
```

### Nginx检查

```bash
#!/bin/bash
# /etc/keepalived/check_ng.sh
nginx=`ps aux|grep nginx|grep -v grep|wc -l`
if [ $nginx -eq 0 ];then
    systemctl restart nginx
    if [ $? -ne 0 ];then
        systemctl stop keepalived
    fi
fi
```

```conf
vrrp_script chk_nginx {
    script "/etc/keepalived/check_ng.sh"
    interval 5
}
```



## 通知脚本

```bash
#!/bin/bash
# /etc/keepalived/notify.sh

LOG_FILE="/var/log/keepalived/notify.log"
STATE=$1

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$STATE] $1" >> $LOG_FILE
}

case $STATE in
    master)
        log "切换为 MASTER 状态"
        ipvsadm -R < /etc/ipvsadm.rules
        ;;
    backup)
        log "切换为 BACKUP 状态"
        ;;
    fault)
        log "进入 FAULT 状态"
        ;;
esac
```

## LVS + Keepalived 高可用集群

### Director 配置（Master）

```conf
global_defs {
    router_id LVS_DIRECTOR_1
}

vrrp_script chk_lvs {
    script "/bin/bash -c 'ipvsadm -L -n | grep -q 192.168.1.100'"
    interval 2
    weight -20
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 150
    advert_int 1

    authentication {
        auth_type PASS
        auth_pass lvs_cluster
    }

    virtual_ipaddress {
        192.168.1.100/24 dev eth0
    }

    virtual_server 192.168.1.100 80 {
        delay_loop 2
        lb_algo rr
        lb_kind DR
        persistence_timeout 60
        protocol TCP

        real_server 192.168.1.10 80 {
            weight 1
            TCP_CHECK {
                connect_timeout 3
                connect_port 80
            }
        }

        real_server 192.168.1.11 80 {
            weight 1
            TCP_CHECK {
                connect_timeout 3
                connect_port 80
            }
        }
    }

    track_script {
        chk_lvs
    }

    notify_master "/etc/keepalived/notify.sh master"
    notify_backup "/etc/keepalived/notify.sh backup"
    notify_fault "/etc/keepalived/notify.sh fault"
}
```

### Director 配置（Backup）

```conf
# 与 Master 相同，修改以下部分
state BACKUP
priority 100
router_id LVS_DIRECTOR_2
```

## 双主模式

```conf
vrrp_instance VI_MASTER {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 150
    advert_int 1

    virtual_ipaddress {
        192.168.1.100/24
    }

    virtual_server 192.168.1.100 80 {
        delay_loop 2
        lb_algo rr
        lb_kind DR
        protocol TCP

        real_server 192.168.1.10 80 { weight 1 }
        real_server 192.168.1.11 80 { weight 1 }
    }
}

vrrp_instance VI_BACKUP {
    state BACKUP
    interface eth0
    virtual_router_id 52
    priority 100
    advert_int 1

    virtual_ipaddress {
        192.168.1.101/24
    }

    virtual_server 192.168.1.101 80 {
        delay_loop 2
        lb_algo rr
        lb_kind DR
        protocol TCP

        real_server 192.168.1.12 80 { weight 1 }
        real_server 192.168.1.13 80 { weight 1 }
    }
}
```

## 启动与管理

```bash
systemctl start keepalived
systemctl stop keepalived
systemctl restart keepalived
systemctl enable keepalived
systemctl status keepalived

# 测试配置
keepalived -t -f /etc/keepalived/keepalived.conf
```

## 日志排查

```bash
journalctl -u keepalived -f
tcpdump -i eth0 -nn vrrp
```

## 常见问题

### Q: VIP 没有漂移？
- 检查 MASTER 的 keepalived 是否正常运行
- 确认 VRRP 组 ID 和认证密码一致
- 检查 priority 设置，BACKUP 需低于 MASTER

### Q: 脑裂（Split-Brain）如何处理？  
```conf
# 增加优先级差值
# 使用仲裁脚本（第三方检测）
vrrp_script chk_quorum {
    script "/bin/bash -c 'ping -c 1 192.168.1.1 -W 2'"
    interval 5
    weight -100
}
```

### Q: LVS 规则未同步？
- 确认 `virtual_server` 配置已正确设置
- 检查 ipvsadm 是否安装
- 查看 keepalived 日志中的 IPVS 错误

### Q: 频繁切换如何解决？
```conf
vrrp_script chk_http {
    script "/usr/bin/curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/health | grep -q 200"
    interval 5
    fall 5
    rise 2
    weight -10
}
```

## 参考资料

- [Keepalived 官方网站](https://www.keepalived.org/)
- [Keepalived 配置参考](https://www.keepalived.org/manpage.html)
- [VRRP 协议 RFC 3768](https://tools.ietf.org/html/rfc3768)
