## 一、基础配置

Git 的配置文件根据作用域划分，分别在`/etc/gitconfig`(全局)、`~/.gitconfig`(用户)、`.git/config`（仓库）三个地方，使用 git 命令设置默认放在用户目录下。

设置用户签名：（用户签名与 Github 或其它托管中心的账号无关）

```bash
git config --global user.name 用户名
git config --global user.email 邮箱
```

## 二、Git 命令

基本操作：

```bash
git init  # 初始化本地库
git status  # 查看本地库状态
git add 文件名  # 添加暂存区
git rm --cached 文件名  # 删除暂存区
git commit -m "日志信息" 文件名  # 提交本地库

git reflog  # 查看版本信息
git log  # 查看版本详细信息
```

版本穿梭：

```bash
git reset --hard 版本号
```

## 三、Git 分支

Git 分支可以将不同程序员开发的不同功能与主线分离，并进行不同功能的并行开发，以提高开发效率。

分支的操作：

```bash
git branch 分支名  # 创建分支
git branch -v  # 查看分支
git checkout 分支名  # 切换分支
git merga 分支名  # 把指定的分支合并到当前分支上
```

### 合并冲突

在实际开发中会遇到不同的分支对同一个文件的同一个地方做了不同的修改，在合并时就会遇到冲突。

解决步骤：先进行正常合并，然后会提示合并冲突，再手动打开冲突文件，将里面冲突的内容修改，最后进行 commit，这次的 commit 中不要指定文件名。

## 四、Github

远程仓库操作：

```bash
git remote -v  # 查看当前所有远程地址别名
git remote add 别名 远程地址  # 起别名
git push 别名 分支  # 推送本地分支上的内容到远程仓库
git clone 远程地址  # 将远程仓库的内容克隆到本地
git pull 别名 分支  # 将远程仓库对于分支最新内容拉下里后与当前本地分支直接合并
```

### SSH 免密登录

需要先生成RSA密钥对：

```bash
ssh-keygen -t rsa -C 描述
```

然后去代码托管平台的账户设置中添加公钥即可。

## 五、IDE 配置

### 忽略文件

部分IDE生成的文件不需要上传至仓库，可以通过创建`xxx.ignore`文件实现忽略，并将`xxx.ignore`写到 Git 配置文件 `.gitconfig` 中去。
