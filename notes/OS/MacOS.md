# MacOS 个人向习惯整理

## 1 系统功能设置

### 1.1 （黑苹果）开启HiDPi

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xzhih/one-key-hidpi/master/hidpi.sh)"
```

### 1.2 禁用截图阴影效果

```bash
# 禁用截图阴影效果
defaults write com.apple.screencapture disable-shadow -bool TRUE
Killall SystemUIServer

# 更改截图默认生成格式
defaults write com.apple.screencapture type jpg
```

### 1.3 禁止生成`__MACOSX` 和 `.DS_Store`

```bash
# 禁止
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool TRUE

# 恢复
defaults delete com.apple.desktopservices DSDontWriteNetworkStores
```

### 1.4 允许安装第三方软件

```bash
sudo xattr -r -d com.apple.quarantine 应用路径
```

### 1.5 MacOS 和 Windows 双系统蓝牙配对

前置工作：先在 WIndows 下正常配对蓝牙设备，然后切到 MacOS 进行配对，连接成功后将蓝牙设备关闭。

打开黑苹果瑞士军刀：Hackintool，选择**工具 -> 生成 Windows 蓝牙注册表文件** ，将生成的 reg 文件放在 Windows 系统可读取的盘中。

切换到 Windows 系统，打开注册表路径：`\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\BTHPORT\Parameters\Keys\蓝牙驱动id`，这里是 Windows 上连接的设备列表。

用文本工具打开MacOS 导出的 reg 文件，寻找与设备列表中设备 ID 相同的项，手动将 Windows 注册表中蓝牙设备列表对应项的值替换为 reg 文件里的 hex 值，大功告成！

## 2 三方软件

| **名称**                                                 | **功能**                       |
| -------------------------------------------------------- | ------------------------------ |
| [Scroll Reverser](https://pilotmoon.com/scrollreverser/) | 单独设置触控板与鼠标的滚动方向 |
|                                                          |                                |

## 3 软件装配

### 3.1 Mysql

#### 3.1.1 安装（8.4.5）

安装参考[这篇文章](https://developer.aliyun.com/article/1578889)

官网：https://dev.mysql.com/downloads/mysql/

然后手动配置环境变量：

```bash
export PATH=${PATH}:/usr/local/mysql/bin
```

#### 3.1.2 修改root密码

```mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
```

## OpenCore 参数设置
### Booter -> Quirks -> ResizeAppleGpuBars 
> OpenCore 0.7.5 正式版新增了两个 Quirks，分别是 ResizeAppleGpuBars 和 ResizeGpuBars，前者位于 Booter → Quirks，后者位于 UEFI → Quirks，下面讲讲这两个选项的作用和区别。
简单来说，ResizeAppleGpuBars 只针对 macOS 生效，而 ResizeGpuBars 则影响所有通过 OpenCore 引导的操作系统，而较新版本的 Windows 和 Linux 自己可以处理 ResizebleBars 特性，所以我们的思路就是调整前者，关闭后者。
OpenCore 更新到 0.7.6 时，明确限定了值只能是 0 或 -1
对于 RX6000 系显卡，ResizeAppleGpuBars 建议值如下：
-1：关闭
0：1MB（保险值）
8：256MB（传统值）
10：1GB（macOS 支持最大值）
如何选择？如果你有 RX6000 系显卡，可优先尝试 10，这么设置的目的是尝试使用 macOS 最大值看看能不能一定程度提升性能；如果遇到休眠问题（表现类似睡了即醒），则修改为 8；如果问题依旧，可改成 0 ，这也是 OpenCore 团队的推荐值，即 1MB，设置为 1MB 的意义在于保留 BIOS 中对应选项开启，但不影响 macOS 启动和运行；如果运行还有问题，改为 -1 关闭该功能。
ResizeGpuBars 直接设置为 -1 即可。没有 RX6000 系显卡的同学，建议两个都设置为 -1。
来自：flytutu https://bbs.pcbeta.com/viewthread-1997130-1-1.html
