# 系统优化

## 1 查看系统的版本号

```bash
cat /etc/redhat-release
# 或者
hostnamectl
```



## 2 查看系统内核版本

```bash
# 显示所有内核信息
uname -a
# 只显示内核版本号
uname -r
```



## 3 系统时间同步

- 硬件时间（BIOS 时间）
- 系统时间（操作系统时间）

> 硬件时间和系统时间必须一致。

### 3.1 查看系统时间

```bash
date
    +%F  # 只显示年月日 
    +%F-%H-%M-%S  # 显示年月日、时、分、秒 
    -s <datetime> # 手动设置系统时间
Thu Sep  4 19:46:36 CST 2025
# CST(China Standard Time) 中国标准时间
# 比 UTC(Coordinated Universal Time, 协调世界时) 早 8 小时
```

### 3.2 查看硬件时间

```bash
clock
Thu 04 Sep 2025 07:58:52 PM CST  -0.101606 seconds
```

### 3.3 同步系统时间

**ntpdate** 同步系统时间

```bash
ntpdate <ntp server> # 向 NTP 服务器同步系统时间
```

**hwclock** 同步硬件时间

```bash
hwclock -w  # 将硬件时间设置为当前系统时间
```



## 4 关闭 SELinux

SELinux(Security-Enhanced Linux) 是美国国家安全局（NSA）开发的安全子系统。

查看 SELinux：

```bash
getenforce
```

临时关闭 SELinux：

```bash
setenforce 0
```

永久关闭 SELinux：

修改文件 `/etc/selinux/config`，`SELINUX`参数设置为`disabled`，重启生效。



## 5 关闭防火墙

查看防火墙状态：

```bash
systemctl status firewalld
systemctl disable firewalld
```



## 6 YUM 仓库优化

### 6.1 查看当前系统仓库：

```bash
yum repolist
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: mirrors.aliyun.com       # 默认仓库地址
 * extras: mirrors.aliyun.com     
 * updates: mirrors.aliyun.com
repo id                     repo name                                    status
base/7/x86_64               CentOS-7 - Base - mirrors.aliyun.com         10,072
extras/7/x86_64             CentOS-7 - Extras - mirrors.aliyun.com       526
updates/7/x86_64            CentOS-7 - Updates - mirrors.aliyun.com      6,173
repolist: 16,771    # 默认仓库软件的个数
```

### 6.2 修改默认的仓库

阿里云仓库地址：`developer.aliyun.com/mirror`

LinuxMirrors：`linuxmirrors.cn`

#### 6.2.1 备份默认仓库

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
```

#### 6.2.2 下载仓库到本地

```bash
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
```

#### 6.2.3 检查配置是否正确

```bash
yum repolist
```

### 6.3 配置扩展仓库

配置 epel 扩展仓库：

```bash
wget -O /etc/yum.repos.d/epel.repo https://mirrors.aliyun.com/repo/epel-7.repo
```

尝试安装 sl 和 cowsay：

```bash
yum -y install sl cowsay
```



## 7 SSH 远程连接优化

**禁用 DNS 反向解析**

修改配置文件：`/etc/ssh/sshd_config`，跳转至 115 行，将 UseDNS 参数改为 yes：

```bash
UseDNS yes  # 改为 no
```

重启 ssh 服务：

```bash
systemctl restart sshd
```



## 8 字符集优化

```bash
echo $LANG           # 查看系统字符集
LANG=en_US.UTF-8     # 设置语言（临时修改）
vim /etc/locale.conf # 永久修改
```

 
