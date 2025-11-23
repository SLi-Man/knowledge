# 包管理

## 一、YUM 镜像仓库

### 1.1 YUM 命令

```bash
yum [-y] [参数] [软件包名称]
```

参数：

- `install`：安装
- `remove`：卸载
- `repolist`：查看默认仓库
- `reinstall`：类似覆盖安装
- `clean all`：清理仓库缓存

查找命令所在软件包：

```bash
yum provides rz    # 有的搜不到
```

### 1.2 查看当前系统仓库：

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

### 1.3 修改默认的仓库

阿里云仓库地址：`developer.aliyun.com/mirror`

LinuxMirrors：`linuxmirrors.cn`

#### 1.3.1 备份默认仓库

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
```

#### 1.3.2 下载仓库到本地

```bash
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
```

#### 1.3.3 检查配置是否正确

```bash
yum repolist
```

### 1.4 配置EPEL扩展仓库

配置 epel 扩展仓库：

```bash
wget -O /etc/yum.repos.d/epel.repo https://mirrors.aliyun.com/repo/epel-7.repo
```

尝试安装 sl 和 cowsay：

```bash
yum -y install sl cowsay
```

---

## 二、RPM 软件包管理

rpm（Red Hat Package Manager），是用于管理Linux各项套件的程序。它**不支持自动管理包依赖**。

### 2.1 命令语法

语法格式：

```bash
rpm [选项] [包名]
```

选项：

- `-i`：install，安装
- `-v`：verbose，显示更详细的信息
- `-h`：hash，打印 #，显示安装进度
- `-e`：erase，卸载
- `-q`：query，查询包名
- `-a`：all，查询全部已安装包
- `-l`：list，列出包中的文件

示例：

```bash
rpm -ivh zip-3.0-11.el7.x86_64.rpm    # 安装指定包
rpm -e zip        # 卸载指定包
rpm -qa zip       # 查询软件包是否已安装
rpm -ql cowsay    # 查看包安装了哪些文件
```



