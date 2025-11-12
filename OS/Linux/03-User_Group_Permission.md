# 用户、组与权限

## 一、操作系统用户分类

### 1.1 用户分类

- **管理员用户：**root，拥有整个系统下最高权限
- **普通用户**：拥有个人用户的最高权限
- **傀儡用户：**只为了运行程序而存在，**不能登录**

### 2.2 系统中用户分类表示

| 用户     | UID（default） |
| -------- | -------------- |
| root     | 0              |
| 傀儡用户 | 1-999          |
| 普通用户 | 1000+          |



## 二、用户相关的配置文件

### 2.1 用户信息 passwd

```bash
root:x:0:0:root:/root:/bin/bash
```

- 第1列：用户名
- 第2列：密码占位符（shadow文件）
- 第3列：UID
- 第4列：GID
- 第5列：用户别名
- 第6列：家目录
- 第7列：命令解释器

### 2.2 用户组信息 group

```bash
root:x:0:
```

- 第1列：组名
- 第2列：组密码
- 第3列：GID
- 第4列：组成员列表，**不含组主用户**



## 三、用户相关的目录

### 3.1 用户家模板 skel

**创建用户的流程：**

1. `useradd sliman` 命令创建用户
2. 将 `/etc/skel/` 目录下的所有隐藏文件拷贝到 `sliman` 的家目录
3. 修改文件属主和属组

**如果命令行左侧变成bash版本号怎么办？**

<span id="interviewQuestion"></span>

1. 注释掉 `/etc/profile` 中的`PS1` 赋值行（如有）

2. 删除/备份家目录下的 `.bash_profile` 和 `.bashrc`

3. 命令 `cp /etc/skel/.* .` 拷贝 `skel` 目录下的所有文件到家目录

4. 重新进入会话

    

## 四、用户相关命令

### 4.1 创建用户 - useradd

语法格式：

```bash
useradd [参数] <用户名>
```

参数：

- `-s` ：指定命令解释器
- `-u` ：指定UID
- `-g` ：指定GID
- `-M` ： 不创建家目录 
- `-G`：附加组

案例：

```bash
# 创建一个虚拟用户test01 uid888 gid888 不创建家目录 不允许登录系统
groupadd -g888 test01  # 一定要先创建组
useradd -u888 -g888 -M -s /sbin/nologin test01

# 批量创建10个用户

```

### 4.2 删除用户 - userdel

```bash
userdel test01  # 删除用户，但保留用户相关文件（不推荐）
userdel -r test01  # 删除用户，同时删除用户相关的所有文件
```

### 4.3 创建组 - groupadd

```bash
groupadd -g888 test01  # 创建一个UID为888的组
```

### 4.4 删除组 - groupdel

```bash
groupdel test01
```

### 4.5 查看用户ID - id

```bash
> id sliman
uid=1000(sliman) gid=1000(sliman) groups=1000(sliman)
```

### 4.6 设置密码 - passwd

方法一：交互式设置密码

```bash
passwd  # 设置当前用户密码
passwd sliman  # 设置指定用户密码
```

方法二：免交互式设置密码

```bash
echo 123456 | passwd --stdin sliman
```

PS：Linux 不允许未设置密码的用户登录

### 4.7 修改文件属主属组 - chown

语法格式：

```bash
chown [-R] [用户].[组] <文件/目录名>
```

- `-R` ：递归修改目录及其子目录下的所有文件属主属组

案例：

```bash
# 修改文件属主和属组为root
chown root.root 1.txt
# 设置目录及目录下的所有文件属组为root
chown -R .root dir/
```



## 五、sudo 提权

普通用户下可以通过sudo命令来获取部分root的权限。

**修改sudo配置：**

方法一：`visudo` 命令（推荐）visudo命令支持语法检查

方法二：手动编辑 `/etc/sudoers` 文件

跳转至100行，使用如下格式添加所有权限

```bash
root    ALL=(ALL)   ALL
```

例：

```bash
# 添加cat命令给用户
sliman    ALL=(ALL)    /usr/bin/cat

# 用户无需输入密码使用命令
sliman    ALL=(ALL)    NOPASSWD: ALL

# 取反，不允许使用某命令
sliman    ALL=(ALL)    !/usr/bin/mv,!/usr/bin/rm
```

**查询当前用户权限：**

```bash
sudo -l
```

**刷新sudo密码缓存（即下次使用sudo需要重新输入密码）：**

```
sudo -k
```

