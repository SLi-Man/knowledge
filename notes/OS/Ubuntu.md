# Ubuntu 开箱指南

## 1 Theme

- [GNOME-macOS-Tahoe](https://github.com/kayozxo/GNOME-macOS-Tahoe)

## 2 Shell

- Fish

> Fish 是"the **f**riendly **i**nteractive **sh**ell"的简称，最大特点就是方便易用。很多其他 Shell 需要配置才有的功能，Fish 默认提供，不需要任何配置。

```bash
sudo apt-get -y install fish
```

fish 配置文件：~/.config/fish/config.fish

fish 的 Web 配置界面：

```bash
fish_config
```

### 2.1 Oh My Posh

docs: https://ohmyposh.dev/docs

```bash
curl -s https://ohmyposh.dev/install.sh | bash -s
```

在 `~/.config/fish/config.fish` 设置生效：

```bash
set PATH $HOME/.local/bin $PATH
oh-my-posh init fish | source
```

主题下载：https://ohmyposh.dev/docs/themes

指定主题在 Shell 的配置文件中指定主题位置：

```bash
oh-my-posh init fish --config ~/.config/posh/bubblesextra.omp.json | source
```



## 2 Terminal

- alacritty: https://github.com/alacritty/alacritty

```bash
# 安装必要工具
sudo apt install -y git curl cargo cmake pkg-config libfreetype6-dev libfontconfig1-dev libxcb-xfixes0-dev python3
# 下载 alacritty 仓库
git clone https://github.com/alacritty/alacritty.git
cd alacritty
# 安装rust编译工具
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# 确认安装成功
rustup override set stable
rustup update stable
# 编译
cargo build --release
# 将编译好的二进制文件添加到应用库
sudo cp target/release/alacritty /usr/local/bin # or anywhere else in $PATH
sudo cp extra/logo/alacritty-term.svg /usr/share/pixmaps/Alacritty.svg
sudo desktop-file-install extra/linux/Alacritty.desktop
sudo update-desktop-database

# Fish 配置
mkdir -p $fish_complete_path[1]
cp extra/completions/alacritty.fish $fish_complete_path[1]/alacritty.fish
# Bash 配置
echo "source $(pwd)/extra/completions/alacritty.bash" >> ~/.bashrc
```

## 3 Tmux

- TPM: https://github.com/tmux-plugins/tpm

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

将此内容放在 `~/.tmux.conf` 的底部（ `$XDG_CONFIG_HOME/tmux/tmux.conf` 也可以）：

```bash
# List of plugins
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'dracula/tmux' # theme
set -g @dracula-plugins "cpu-usage ram-usage"

# Initialize TMUX plugin manager (keep this line at the very bottom of tmux.conf)
run '~/.tmux/plugins/tpm/tpm'
```

打开 tmux，使用快捷键 `I` 安装TPM及相关插件。



## 99 常用调整

### 3.1 启用 root 用户

```bash
sudo passwd root
```

### 3.2 修改用户名

```bash
su # 一定要在root用户下操作
vim /etc/passwd # 找到原先的用户名，将其改为自己的用户名（一行全部都改）
vim /etc/shadow #找到原先用户名（所有的名字都要改），改为自己的用户名
vim /etc/group #你应该发现你的用户名在很多个组中，全部修改！
mv /home/<原用户名> /hom<新用户名>

```

