## CentOS

## #1 安装注意事项

### 1 安装时修改网卡默认以eth开头

centos7.x 默认网卡名称开头是ens。

安装启动时，在选项界面按`Tab`键编辑参数，增加以下两个参数：

```bash
biosdevname=0 net.ifnames=0
```

### 2 软件包选择

Minimal Install：

- Debugging Tools
- Compatibility Libraries
- Development Tools
- System Administration Tools

### 3 其它选项

1. 语言添加中文支持
2. 关闭KDUMP

## #2 模板机优化

### 1 添加网卡

### 2 修改YUM默认镜像源

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup # 备份
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
```

### 3 安装epel扩展仓库

```bash
wget -O /etc/yum.repos.d/epel.repo https://mirrors.aliyun.com/repo/epel-7.repo
```

### 4 安装常用命令

```bash
yum -y install vim wget net-tools lrzsz tree bash-competion.noarch bash-completion-extras.noarch ntp date lsof
```

### 5 关闭NetworkManager和防火墙

```bash
systemctl stop NetworkManager firewalld
systemctl disable NetworkManager firewalld
```

### 6 关闭SELinux

```bash
setenforce 0 # 临时
sed -i '7c SELINUX=disable'
```

### 7 修改进程同时打开的文件数量

```bash
# 默认1024
ulimit -n 65535  # 临时生效
echo '* - nofile 65535' >> /etc/security/limits.conf
```

### 8 优化SSH

```bash
# 1. 创建普通用户
# 2. 修改默认端口
# 3. 优化登录速度
sed -i '115c UseDNS no' /etc/ssh/sshd_config # 重启sshd生效
```

### 9 bash颜色优化

```bash
export PS1="\[\e[1;32m\]\u@\h\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\[\e[1;31m\]\$ \[\e[0m\]"
```

### 