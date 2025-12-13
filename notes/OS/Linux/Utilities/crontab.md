# 定时任务 - crontab

## 定时任务分类

- crond（crontab），定时任务软件，软件包 cronie :white_check_mark:

- atd，运行一次

- anacron，非7*24服务器

    

## CROND 分类

### 系统定时任务

- `/etc/cron.hourly` ：系统定时**每个小时**运行目录里的内容
- `/etc/cron.daily` ：系统定时**每天**运行目录里的内容
- `/etc/cron.weekly` ：系统定时**每周**运行目录里的内容
- `/etc/cron.monthly` ：系统定时**每个月**运行目录里的内容
- `/etc/cron.deny` ：拒绝某个用户使用定时任务（用不到）
- `/etc/crontab` ：系统定时任务配置之一

### 用户定时任务

- `crontab -l` ：查看用户的定时任务 cron table
- `crontab -e` ：编辑用户的定时任务
- `/var/spool/cron/root` ：用户定时任务文件



## 配置定时任务

**方法一：修改系统的配置文件**

```bash
vim /etc/crontab
```

**方法二：用户的定时任务**

```bash
crontab -e
```

- `/var/spool/cron/root`
- `/var/spool/cron/sliman` （用的少，容易产生权限问题）



## 查看定时任务

````bash
crontab -l
````

或者

```bash
cat /var/spool/cron/root
```



## 相关的文件

- Crontab 日志： `/var/log/cron` 
- 系统邮件：`/var/spool/mail/root`（详细）



## **语法格式**

### 基本语法

![cron语法格式](assets/cron.png)

定时任务中不要同时使用 **day** 和 **week** 。

### 特殊符号

- `*` ： 每
- `*/n` ： 间隔，`*/5 * * * *` 每5分钟执行
- `n-m` ：区间，`* 1-8 * * *` 1点到8点的每分钟执行
- `,` ：多个时间

::: warning

- Crontab 中不识别`%`，需要节加斜杠`/` 进行转义。
- 系统邮件关闭的情况下（生产环境通常关闭），若没有将输出重定向到黑洞，会在 `/var/spool/postfix/maildrop/` 中生成大量小文件，极易造成 **inode** 占满。
- 定时任务默认环境变量只包含 `/bin` 和 `/usr/bin` ，使用其他命令注意添加环境变量或者使用绝对路径。
- 多条命令使用脚本。
- 避免不必要的程序输出。

:::

**环境变量导致的问题**

- 方法一：手动指定环境变量

  ```bash
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin
  ```

- 方法二：执行一次系统配置文件

  ```bash
  ./etc/profile
  ```


- 方法三：使用绝对路径



::: tip 面试题：什么情况下系统 inode 号会占满中产生？ {#interviewQuestion01}

1. 定时任务没有开启系统邮件，会在 `/var/spool/postfix/maildrop/` 中产生大量临时小文件
2. 服务运行过程中，开发问题产生小文件
3. 误操作脚本

:::

::: tip 笔试题：每天凌晨执行命令 `echo 'hello world! '` 到 `a.txt` 中{#interviewQuestion02}

```bash
00 00 * * * root echo 'hello world!' > a.txt
```

:::

---

## 参考资料

- [定时任务 - crontab](https://dunwu.github.io/linux-tutorial/linux/ops/crontab.html)