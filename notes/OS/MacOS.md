# MacOS 个人向习惯整理

## 1. 系统功能设置

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

#### 安装（8.4.5）

安装参考[这篇文章](https://developer.aliyun.com/article/1578889)

官网：https://dev.mysql.com/downloads/mysql/

然后手动配置环境变量：

```bash
export PATH=${PATH}:/usr/local/mysql/bin
```

#### 修改root密码

```mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
```



## 终端

### 终端工具 - Ghostty

```bash
brew install --cask ghostty
```

**常用命令速查**

- 查看所有内置主题：`ghostty +list-themes`
- 查看默认配置：`ghostty +show-config --default`
- 列出可用字体：`ghostty +list-fonts`
- 重载配置（无需重启）：`Cmd + Shift + ,`

| 快捷键                | 功能                   |
| --------------------- | ---------------------- |
| `Cmd + T`             | 新建标签页             |
| `Cmd + D`             | 垂直分屏               |
| `Cmd + Shift + D`     | 水平分屏               |
| `Cmd + W`             | 关闭当前标签 / 分屏    |
| `Cmd + [ / ]`         | 切换上 / 下一个标签页  |
| `Cmd + F`             | 终端内搜索（实时高亮） |
| `Cmd + + / - / 0`     | 增大 / 减小 / 重置字号 |
| `Cmd + Shift + ,`     | 重载配置               |
| `Cmd + Shift + Enter` | 切换分屏全屏 / 还原    |
| `Cmd + Alt + 方向键`  | 分屏间跳转             |
| `Cmd + Ctrl + 方向键` | 调整分屏大小           |

配置文件：https://github.com/BruceLanLan/bruceblue-ghostty-config/blob/main/config 

```bash
# 窗口左右内边距（单位：像素）
window-padding-x = 15

# 窗口上下内边距（单位：像素）
window-padding-y = 15

# Shell 集成功能：禁用光标位置同步（避免光标样式被 shell 覆盖）
shell-integration-features = no-cursor

# 光标样式：
cursor-style = bar

# 光标闪烁
cursor-style-blink = true

# 主题
theme = GitLab light

# 字体
font-family = "Maple Mono NF CN"

# macOS 标题栏样式：透明
macos-titlebar-style = transparent

# 允许点击鼠标移动光标位置
cursor-click-to-move = true

# 打字时隐藏鼠标指针
mouse-hide-while-typing = true

# 隐藏标题栏的代理图标（文件图标）
macos-titlebar-proxy-icon = hidden

# 背景的透明度和模糊程度，制造毛玻璃效果
background-opacity = 0.90
background-blur = 250

# pin 窗口的快捷键
keybind = opt+t=toggle_window_float_on_top

```

### 终端字体 - Maple Mono NF CN

```bash
brew install --cask font-maple-mono-nf-cn
```

https://font.subf.dev/zh-cn/download/

### 命令行工具 - Oh My Zsh

```bash
sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

### 可视化目录 - yazi

```bash
brew install yazi ffmpeg-full sevenzip jq poppler fd ripgrep fzf zoxide resvg imagemagick-full font-symbols-only-nerd-font
brew link ffmpeg-full imagemagick-full -f --overwrite
```

### 编辑器 - neovim

```bash
brew install neovim
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
