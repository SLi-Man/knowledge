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

## 三、磁盘挂载

文件位置：`/etc/fstab`

作用：开机自动挂载磁盘

```bash
UUID=63A4-5525  /boot/efi       vfat    umask=0077      0       1
# 第一列：设备名称，可以是 UUID，也可是使用设备名称
# 第二列：挂载点
# 第三列：系统文件的类型
# 第四列：挂载参数，默认 default 即可
# 第五列：开机自检，0不自检 1自检
# 第六列：开机备份，0不备份 1备份
```

## 2 proc 下重要的配置文件

说明：/proc 内存的映射

### 2.1 位置对应

| 路径          | 说明                                                   |
| ------------- | ------------------------------------------------------ |
| /proc/cpuinto | 查看 cpu 的信息                                        |
| /proc/meminfo | 查看内存的信息                                         |
| /proc/loadavg | 查看负载的信息                                         |
| /proc/mounts  | 查看挂载的信息，唯一需要掌握的文件，其它都通过命令代替 |

