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
