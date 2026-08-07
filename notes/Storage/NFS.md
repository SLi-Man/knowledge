# NFS (Network File System)

## 服务端

### 架构

- rpc.nfsd: 管理读写
- rpc.mount: 管理挂载
- portmap: 管理客户端连接的端口分配

### 配置流程

1. 安装服务

   ```bash
   yum -y install nfs-utils
   ```

2. 配置服务

   配置文件：`/etc/exports`

   ```bash
   /data/ 172.16.1.0/24(rw,sync,all_squash)
   # /data/          共享的目录
   # 172.16.1.0/24   允许的网段
   # rw/ro           挂载后的权限（读写/只读）
   # sync            同时将数据写入到磁盘中
   # all_squash      将所有的来源用户全部压缩为本地虚拟用户
   ```

3. 根据配置文件创建必要数据

   ```bash
   mkdir /data
   chown nfsnobody.nfsnobody /data
   ```

   

4. 启动服务/开机自启

   ```bash
   systemctl start nfs
   systemctl enable nfs
   ```

5. 检查服务

   ```bash
   netstat -tunlp|grep rpc
   cat /var/lib/nfs/etab
   ```


### NFS配置参数

| NFS共享参数    | 参数作用                                                     |
| -------------- | ------------------------------------------------------------ |
| rw*            | 读写权限                                                     |
| ro             | 只读权限                                                     |
| root_squash    | 当NFS客户端以root管理员访问时，映射为NFS服务器的匿名用户（不常用） |
| no_root_squash | 当NFS客户端以root管理员访问时，映射为NFS服务器的root管理员用户（不常用） |
| all_squash*    | 无论NFS客户端使用什么账户访问，均映射为服务器的匿名用户（常用） |
| no_all_squash  | 无论NFS客户端使用什么账户访问，都不进行压缩                  |
| sync*          | 同时将数据写入到内存与硬盘中，保证不丢失数据                 |
| async          | 优先将数据保存到内存，然后再写入硬盘；这样效率更高，但可能会丢失数据 |
| anonuid*       | 配置all_squash使用，指定NFS的用户UID，必须存在系统           |
| anongid*       | 配置all_squash使用，指定NFS的用户GID，必须存在系统           |



## 客户端

查看服务端共享的目录：

```bash
showmount -e 172.16.0.1
```

安装/挂载：

```bash
yum install -y nfs-utils
mount -t nfs 172.16.0.31:/data /root/images
```

开机自动挂载：

```bash
172.16.1.31:/data                         /mnt                    nfs     defaults        0 0
```

## 优缺点

优点：

1. 简单易用
2. 所有数据都是在文件系统之上，都能看得见

缺点：

1. 存在单点故障，若构建高可用又比较难维护
2. 数据明文传输，且没有校验
3. 没有密码校验，安全性一般

应用建议：

1. 生产场景应尽可能将静态数据往前端推送，减少后端存储压力
2. 必须将存储里的静态资源通过CDN缓存
3. 如果没有缓存或架构本身历史遗留问题太大，再多存储也没用

## 注意事项

**开机时在网络未就绪的情况下挂载，导致网络挂载失败？**

CentOS 7.x 中，对于没有依赖关系的服务之间的启动顺序是并行的，尽管系统在检查到网络挂载时，会自动添加类似依赖`After=network.target`，但这只表示在网卡启动后再挂载，而仅仅网卡启动不表示已经获取到IP和正常上网。

解决的办法是添加挂载参数：

- `_netdev`: 表示网络设备，必须等待网络相关目标完成后再挂载
- `x-systemd.automount`: 开机不立刻挂载，等待第一次访问目录时再进行挂载（针对NAS使用场景比较合适）

```
172.16.1.31:/code/wordpress/uploads /code/wordpress/wp-content/uploads nfs _netdev       0 0
```

