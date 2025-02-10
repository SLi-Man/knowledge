## Git 笔记

### 一、基础配置

Git 的配置文件根据作用域划分，分别在`/etc/gitconfig`(全局)、`~/.gitconfig`(用户)、`.git/config`（仓库）三个地方，使用 git 命令设置默认放在用户目录下。

设置用户签名：（用户签名与Github或其它托管中心的账号无关）

```bash
git config --global user.name 用户名
git config --global user.email 邮箱
```

### 二、Git 命令

初始化本地库：

```bash
git init  # 初始化本地库
git status  # 查看本地库状态
git add 文件名  # 添加暂存区
git rm --cached 文件名  # 删除暂存区
git commit -m "日志信息" 文件名  # 提交本地库

git reflog  # 查看引用日志信息
git log  # 查看日志
```
