# MacOS 常用记录

## （黑苹果）开启HiDPi

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/xzhih/one-key-hidpi/master/hidpi.sh)"
```

## 禁用截图阴影效果

```bash
# 禁用截图阴影效果
defaults write com.apple.screencapture disable-shadow -bool TRUE
Killall SystemUIServer

# 更改截图默认生成格式
defaults write com.apple.screencapture type jpg
```

## 禁止生成`__MACOSX` 和 `.DS_Store`

```bash
# 禁止
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool TRUE

# 恢复
defaults delete com.apple.desktopservices DSDontWriteNetworkStores
```

## 允许安装第三方软件

```bash
sudo xattr -r -d com.apple.quarantine 应用路径
```

## 常用软件

### 单独设置触控板与鼠标的滚动方向

[Scroll Reverser](https://pilotmoon.com/scrollreverser/)
