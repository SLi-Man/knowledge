# 文件系统与目录结构

## 一、文件详细属性

```bash
[root@learn ~]# ll
total 20
-rw-r--r--. 1 root root   65 Sep  3 22:46 1.txt
-rw-------. 1 root root 1434 Sep  2 14:30 anaconda-ks.cfg
-rw-r--r--  1 root root    4 Sep 12 23:05 a.txt
-rw-r--r--  1 root root    4 Sep 12 23:06 b.txt
-rw-r--r--. 1 root root  938 Sep  3 22:02 passwd
```

1. Part1 文件权限
2. Part2 开启 SELinux 后创建的文件将包含`.`
3. Part3 硬链接个数
4. Part4 所有者
5. Part5 所有组
6. Part6 大小
7. Part7 修改时间
8. 文件名


---

## 二、文件类型

```bash
-    # 表示普通文件
d    # 表示目录
l    # 表示软链接
b    # block 块设备 硬件设备
c    # 字节设备
p
s

ll /dev/urandom   # 不停往外吐东西
crw-rw-rw- 1 root root 1, 9 Sep 12 22:20 /dev/urandom

ll /dev/zero      # 可利用生成定量的数据
# 如生成一个10G的文件：
# dd if=/dev/zero of=10g.txt bs=1M count=10000
crw-rw-rw- 1 root root 1, 5 Sep 12 22:20 /dev/zero

ll /dev/null    # 空，类似黑洞，可以持续吃内容
crw-rw-rw- 1 root root 1, 3 Sep 12 22:20 /dev/null
# exp: 
ping -w1 -c1 www.baidu.com >/dev/null
echo $?  # $? 存储上一条命令的执行结果，如果是0则执行成功，如果非0则失败 
```

---



## 三、文件链接

### 3.1 硬链接

创建硬链接：

```bash
ln [文件名1] [文件名2]
```

硬链接的特点：

- inode 号一致，不分主副
- 改变一个文件的同时会影响另一个文件
- 删除一个硬链接不影响其他文件
- 目录不能创建硬链接
- 目录默认2个硬链接
- 硬链接不能跨文件系统，软链接可以
- 实用相对较少

目录存在 2 个硬链接的原因是目录下还包含两个目录`.`和`..`，其中`.`与目录本身互为硬链接。

### 3.2 软链接

创建软连接：

```bash
ln -s [源文件] [链接文件]
```

软连接的特点：

- inode 号不同，类似 Windows 下的快捷方式
- 可以跨文件系统
- 目录可以创建软链接
- 软链接的真正权限取决于源文件权限

### 3.3 硬链接与软链接的不同

1. 硬链接的 inode 相同，软链接的 inode 号不同
2. 目录不支持硬链接，只能做软链接
3. 硬链接不能跨文件系统，软链接可以
4. 目录硬链接个数默认 2，文件默认 1
5. 删除硬链接不影响源文件，硬链接个数为 0，则文件被删除
6. 删除软链接不影响源文件，删除源文件，则文件被删除
7. 软硬链接都是普通文件，可以直接用 rm 删除
8. inode 号都为 0，并且文件没有被进程调用，文件才真正的被删除

---

## 四、磁盘挂载

文件位置：`/etc/fstab`

作用：开机自动挂载磁盘

```bash
UUID=63A4-5525  /boot/efi       vfat    umask=0077      0       1
# 第一列：设备名称，可以是 UUID，也可是使用设备名称
# 第二列：挂载点
# 第三列：文件系统的类型
# 第四列：挂载参数，默认 default 即可
# 第五列：开机自检，0不自检 1自检
# 第六列：开机备份，0不备份 1备份
```

### 4.1 proc 下重要的配置文件

说明：/proc 内存的映射

#### 4.1.1 位置对应

| 路径          | 说明                                                   |
| ------------- | ------------------------------------------------------ |
| /proc/cpuinto | 查看 cpu 的信息                                        |
| /proc/meminfo | 查看内存的信息                                         |
| /proc/loadavg | 查看负载的信息                                         |
| /proc/mounts  | 查看挂载的信息，唯一需要掌握的文件，其它都通过命令代替 |

---

## 五、系统访问文件的过程

1. cat /root/1.txt
2. 查找 `/` 对应的 inode 号码
3. 根据 inode 号码找到 `/` 目录的 block
4. 从 `/`的 block 中找到 `/root` 目录的 inode
5. 根据 inode 号码找到 `/root` 目录的 block
6. 从 `/root`的 block 中找到 `/root/1.txt` 文件的 inode
7. 根据 inode 号码找到 `/root/1.txt` 的 block
8. 从 `/root/1.txt` 的 block 中读取内容

基本概念：文件名称被存储在上级目录的 block 中。

## 六、登录提示

### 6.1 开机提示文字

位置：`/etc/motd`

作用：开机提示文字

### 6.2 登录提示文字

位置：`/etc/issue` （本地登录）& `/etc/issue.net`（远程登录）

安全优化：这两个文件最好清空，防止内核信息暴漏。

