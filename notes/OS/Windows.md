# Windows 常用设置

## 命令行配置
### 终端 - Windows Terminal
**Windows Store 安装**


### 包管理器 - Winget
**Windows Store 安装**

**Winget 替换源**
```powershell
winget source remove winget
winget source add winget https://mirrors.ustc.edu.cn/winget-source
```

### Shell - PowerShell 7
**PowerShell 7 安装**
```powershell
winget install --id Microsoft.PowerShell --source winget
```

### 美化
**Oh My Posh**
```powershell
winget install JanDeDobbeleer.OhMyPosh --source winget
```

**Nerd Font**
```powershell
Install-PSResource -Name NerdFonts
Import-Module -Name NerdFonts

Install-NerdFont -Name JetBrainsMono
```

然后在终端设置中选择字体为 JetBrainsMono Nerd Font Mono

**激活 Oh My Posh**
创建空配置文件
```powershell
New-Item -Path $PROFILE -Type File -Force
```

然后编辑配置文件
```powershell
notepad $PROFILE
```

在文件中添加以下内容
```powershell
oh-my-posh init pwsh | Invoke-Expression
# 或者
oh-my-posh init pwsh --config ~/tokyonight_storm.omp.json | Invoke-Expression


```

Oh My Posh 主题列表：
https://ohmyposh.dev/docs/themes

**安装 Winfetch**
```powershell
Install-Script winfetch
```

**Git-Posh**
```powershell
Install-Module -Name posh-git -Scope CurrentUser
```


### 配置文件
::: details Microsoft.PowerShell_profile.ps1
```powershell
oh-my-posh init pwsh --config ~/tokyonight_storm.omp.json | Invoke-Expression

# ps-read-line
Import-Module PSReadLine

# posh-git
Import-Module posh-git

# 设置预测文本来源为历史记录
Set-PSReadLineOption -PredictionSource History

# 每次回溯输入历史，光标定位于输入内容末尾
Set-PSReadLineOption -HistorySearchCursorMovesToEnd

# 设置 Tab 为菜单补全和 Intellisense
Set-PSReadLineKeyHandler -Key "Tab" -Function MenuComplete

# 设置 Ctrl+d 为退出 PowerShell
Set-PSReadlineKeyHandler -Key "Ctrl+d" -Function ViExit

# 设置 Ctrl+z 为撤销
Set-PSReadLineKeyHandler -Key "Ctrl+z" -Function Undo

# 使用 ll 查看目录
function ll {
    Get-ChildItem
}

# 设置向上键为后向搜索历史记录
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward

# 设置向下键为前向搜索历史纪录
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward

# rm -rf alias
function rmrf ($dir_path){
  Remove-Item -Recurse -Force $dir_path
}

# mv alias
function mv($file_path, $des_name) {
  Move-Item -Path $file_path -Destination $des_name
}
```
:::