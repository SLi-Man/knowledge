## Git 笔记

### 基础配置

Git 的配置文件根据作用域划分，分别在`/etc/gitconfig`(全局)、`~/.gitconfig`(用户)、`.git/config`（仓库）三个地方，使用 git 命令设置默认放在用户目录下。

```bash
git config --global user.name 用户名
git config --global user.email 邮箱
```
