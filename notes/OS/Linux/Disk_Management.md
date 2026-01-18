# 磁盘管理

## 磁盘结构

### 磁盘外部结构

- 磁盘主轴转速：(rpm, round per minute) 10k、15k、7200、5400
- 磁盘盘片
- 磁头
- 磁盘接口

**磁盘接口类型**：

- IDE（淘汰）
- SCSI（淘汰）
- SATA（消费级）
- SAS（企业级/高端）
- PCI-e（企业级/高端）

### 磁盘内部组成

- 磁盘-硬盘（Disk）
- 磁头（Head）
- 磁道（Track）
- 扇区（Sector）
- 柱面（Cylinder）
- 单元块（Units）

## RAID

| RAID级别 | 最小磁盘数 | 容错能力 | 磁盘空间开销 | 读取速度 | 写入速度 | 硬件成本 |
| :------- | :--------- | :------- | :----------- | :------- | :------- | :------- |
| RAID 0   | 2          | 无       | 0%           | 高       | 高       | 低       |
| RAID 1   | 2          | 单个磁盘 | 50%          | 高       | 低       | 中       |
| RAID 5   | 3          | 单个磁盘 | 1 / N        | 中       | 低       | 中       |
| RAID 6   | 4          | 两个磁盘 | 2 / N        | 中       | 低       | 高       |
| RAID 10  | 4          | 多个磁盘 | 50%          | 高       | 中       | 高       |
| RAID 50  | 6          | 单个磁盘 | 1 / N        | 高       | 中       | 高       |
| RAID 60  | 8          | 多个磁盘 | 50%          | 高       | 中       | 高       |

## 分区格式

- **MBR 格式** - 最大支持4个主分区，包含扩展分区、逻辑分区的概念
- **GPT 格式** - 最大支持128个主分区

## 分区工具

### 格式化分区 - mkfs

例如：分区格式化为xfs格式

```bash
mkfs.xfs /dev/sdb1
```

### 针对MBR分区 - fdisk

**查看磁盘列表：**

```bash
fdisk -l
```

**操作某块磁盘：**

```bash
# 对磁盘sdb进行操作
fdisk /dev/sdb
```

**常用操作：**

- d：删除一个分区
- n：创建一个新分区
- p：打印分区表
- l：列出已知分区类型表
- w：保存并退出
- q：不保存退出

### 针对GPT分区 - parted

::: warning

parted 执行的操作会立即生效。

parted 也支持非交互式输入。

:::

**常用操作：**

- help：帮助信息
- mklabel：制作新的标签
- mkpart：创建分区
- print：打印分区表
- rm $NUMBER：删除分区

mkpart 支持交互式和非交互式创建分区：

```bash
# 交互式
(parted) mkpart
Partition name?  []? primary
File system type?  [ext2]? xfs
Start? 0
End? 200M
Warning: The resulting partition is not properly aligned for best performance.
Ignore/Cancel? I

# 非交互式
mkpart primary xfs 200M 400M

# 删除第2个分区
rm 2
```

## 添加磁盘步骤

1. 插入磁盘
2. 分区：使用分区工具对磁盘进行初始化分区（可选）
3. 格式化：使用mkfs对分区进行格式化
4. 临时挂载：`mount /dev/sdb1 /mnt`
5. 开机自动挂载：配置文件 `/etc/fstab`

开机自动挂载文件：`/etc/fstab`

```bash
UUID=1d0c589a-20cc-44a6-bd28-4f935a13819f /              ext4  errors=remount-ro     0  1
/dev/sr0                                  /media/cdrom0  udf,iso9660 user,noauto     0  0
/www/swap                                 swap           swap        defaults        0 0
```

查看UUID命令：`blkid`

```bash
/dev/sr0: BLOCK_SIZE="2048" UUID="2025-09-20-18-33-59-00" LABEL="config-2" TYPE="iso9660"
/dev/vda1: UUID="1d0c589a-20cc-44a6-bd28-4f935a13819f" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="b1444d03-01"
```

## 参考引用

- [完全图解RAID存储技术：RAID 0、1、5、6、10、50、60](https://cloud.tencent.com/developer/article/2304179)
