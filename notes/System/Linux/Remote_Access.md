# 远程管理

## SSH

### SSH工作原理

**SSH（Secure Shell）** 是一种在不安全网络上提供安全远程登录和数据传输的网络协议，广泛用于 Linux/Unix 系统管理。它通过 **加密通信** 防止密码和数据被窃取，并支持 **口令认证** 与 **公钥认证** 两种方式。

### ssh命令

```bash
ssh [options] [user@]hostname [command]
```

选项：

- `-p`: 指定端口，默认22

### SCP

```bash
scp [选项] [源文件] [目标路径]
```

选项：

- `-P`: 指定端口，默认22
- `-r`: 递归复制目录

### SSH配置文件

路径：`/etc/ssh/sshd_config`

### SSH连接优化

在配置文件中常用的优化修改：

```bash
Port                    6666  # SSH远程连接端口
PermitRootLogin         no    # 禁止root用户直接远程登录
PasswordAuthentication  no    # 禁止使用密码直接远程登录
UseDNS                  no    # 禁止ssh进行dns反向解析，影响ssh连接效率参数
GSSAPIAuthentication    no    # 禁止GSS认证，减少连接时产生的延迟
```

