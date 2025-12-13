# Linux 基础命令

## 一、命令行基础与语法

### 命令结构

Linux命令遵循特定的语法结构：

```
命令 [选项] [参数]
```

- **命令**：要执行的操作或程序名称
- **选项**：修改命令行为的标志，通常以`-`或`--`开头
- **参数**：命令操作的对象，如文件名、目录名等

示例：

```bash
ls -l /home/user  # ls是命令，-l是选项，/home/user是参数
```

### 选项类型

Linux命令支持两种主要类型的选项：

1. **短选项**：单字母选项，前面加一个连字符`-`
2. **长选项**：完整的单词选项，前面加两个连字符`--`

### 获取帮助

Linux提供了多种获取命令帮助的方式：

1. **--help 选项**：大多数命令都支持此选项，提供简要用法说明

   ```bash
   ls --help
   ```

2. **man 命令**：查看命令的完整手册页（manual page）

   ```bash
   man ls  # 查看ls命令的详细手册
   ```

3. **info 命令**：某些命令提供更详细的info文档

   ```bash
   info ls
   ```

4. **whatis 命令**：显示命令的简短描述

   ```bash
   whatis ls
   ```

5. **apropos 命令**：搜索与关键词相关的命令
   ```bash
   apropos list  # 搜索包含"list"关键词的命令
   ```

---

## 二、Shell 特殊符号与元字符

### 数据流重定向

#### 标准流概念

Linux系统为每个进程提供了三个标准流：

1. **标准输入 (stdin, 文件描述符0)**：默认来自键盘的输入
2. **标准输出 (stdout, 文件描述符1)**：默认输出到终端屏幕
3. **标准错误 (stderr, 文件描述符2)**：默认输出错误信息到终端屏幕

#### 输出重定向

**重定向标准输出**

```bash
命令 > 文件        # 将标准输出重定向到文件（覆盖）
命令 >> 文件       # 将标准输出重定向到文件（追加）
```

**重定向标准错误**

```bash
命令 2> 文件        # 将标准错误重定向到文件（覆盖）
命令 2>> 文件       # 将标准错误重定向到文件（追加）
```

**同时重定向标准输出和标准错误**

```bash
命令 &> 文件        # 将标准输出和标准错误都重定向到文件（覆盖）
命令 &>> 文件       # 将标准输出和标准错误都重定向到文件（追加）
命令 > 文件 2>&1    # 同上，将标准错误重定向到标准输出，然后一起重定向到文件
```

示例：

```bash
ls existent nonexistent &> output.log  # 将所有输出保存到output.log
```

#### 输入重定向

```bash
命令 < 文件        # 从文件读取内容作为标准输入
命令 << 标记       # 从标准输入读取内容，直到遇到指定标记
命令 <<< 字符串    # 从字符串读取内容作为标准输入
```

示例：

```bash
wc -l < document.txt          # 统计文件行数
sort < unsorted.txt > sorted.txt  # 从文件读取内容并排序后输出到另一文件

# 此处文档示例
cat << EOF
这是多行文本
将会被cat命令输出
直到遇到EOF标记
EOF

# 此处字符串示例
grep "hello" <<< "hello world"  # 在字符串中搜索hello
```

#### 特殊重定向技巧

**丢弃输出**

```bash
命令 > /dev/null    # 丢弃标准输出
命令 2> /dev/null   # 丢弃标准错误
命令 &> /dev/null   # 丢弃所有输出
```

示例：

```bash
# 运行命令但不关心输出
find / -name "*.log" 2> /dev/null
```

**重定向到标准错误**

```bash
echo "错误信息" >&2  # 将消息输出到标准错误
```

**tee命令：同时输出到屏幕和文件**

```bash
命令 | tee 文件      # 将输出同时显示在屏幕和保存到文件
命令 | tee -a 文件   # 追加到文件而不是覆盖
```

示例：

```bash
ls -l | tee directory_listing.txt  # 显示并保存目录列表
```

#### 文件描述符操作

**复制文件描述符**

```bash
命令 M>&N    # 将文件描述符M复制到N
命令 M<&N    # 将文件描述符N复制到M（用于输入）
```

示例：

```bash
# 将标准错误重定向到标准输出，然后一起重定向到文件
命令 > output.log 2>&1

# 创建一个可读写的文件描述符
exec 3<> file.txt
```

**创建自定义文件描述符**

```bash
exec 3> file.txt    # 创建文件描述符3并重定向到文件
echo "测试" >&3     # 使用文件描述符3写入
exec 3>&-           # 关闭文件描述符3
```

#### 重定向与管道的结合使用

重定向和管道可以结合使用，创建强大的命令组合：

```bash
# 将命令输出保存到文件的同时进行进一步处理
ls -l | tee filelist.txt | grep "\.txt$"

# 将标准错误重定向到标准输出，然后通过管道传递
命令 2>&1 | 过滤命令

# 将标准输出和标准错误分别重定向到不同文件
(命令 | 处理命令 > output.log) 2> error.log

# 复杂的重定向示例：将标准输出和标准错误分别重定向到不同进程
命令 > >(处理标准输出) 2> >(处理标准错误)
```

示例：

```bash
# 统计成功和失败的操作
(ls existent && ls nonexistent) > success.log 2> failure.log

# 分别处理标准输出和标准错误
ls existent nonexistent > >(grep "existent" > found.log) 2> >(grep "nonexistent" > notfound.log)
```

---

### 管道（Pipe）

`|` 将一个命令的标准输出作为另一个命令的标准输入。

示例：

```bash
ps aux | grep nginx  # 查找 nginx 的进程
```

### 命令连接符（Command Operators）

- `&&`：逻辑与。
- `||`：逻辑或。
- `;`：顺序执行。

### 后台执行（Background Execution）

`&`：将命令放入后台执行，立即释放当前终端。

示例：

```bash
python3 app.py &
```

进程管理相关移步[->](Process_Management.md)

## 三、文件与目录管理

### ls - 列出目录内容

```bash
ls [选项] [目录名]
```

选项：

- `-l`：详细信息（长格式显示）
- `-a`：显示所有文件，包括隐藏文件
- `-d`：查看目录本身的权限和大小信息
- `-i`：显示inode号码
- `-r`：反向排序（降序）
- `-t`：按修改时间排序
- `-h`：人性化显示文件大小（与-l一起使用）

示例：

```bash
ls -laht  # 显示所有文件的详细信息，按时间排序，人性化显示大小
```

### cd - 切换目录

```bash
cd [目录路径]
```

特殊路径：

- `cd ~` 或 `cd`：返回用户家目录
- `cd -`：返回上一个工作目录
- `cd ..`：返回上级目录

###  pwd - 显示当前工作目录

```bash
pwd  # 显示当前所在目录的绝对路径
```

### mkdir - 创建目录

```bash
mkdir [选项] 目录名
```

选项：

- `-p`：创建多级目录（父目录不存在时一并创建）

示例：

```bash
mkdir -p project/src/main  # 创建多级目录
```

### rmdir - 删除空目录

```bash
rmdir 目录名  # 只能删除空目录
```

### cp - 复制文件和目录

```bash
cp [选项] 源文件 目标文件
```

选项：

- `-r`：递归复制（用于目录）
- `-i`：交互模式（覆盖前提示）
- `-v`：显示复制过程

### mv - 移动/重命名文件和目录

`mv` 默认是 `mv -i` 的别名。

```bash
mv [选项] 源文件 目标文件
```

选项：

- `-i`：交互模式（覆盖前提示）
- `-v`：显示移动过程

### rm - 删除文件和目录

`rm` 默认是 `rm -i` 的别名。

```bash
rm [选项] 文件或目录
```

选项：

- `-r`：递归删除（用于目录）
- `-f`：强制删除（不提示）
- `-i`：交互模式（删除前提示）

### find - 查找文件

```bash
find [查找的起始位置] [选项] [目标参数]
```

选项：

- `-type [文件类型]` ：按分类查找
- `-name [文件名]`：按文件名查找
- `-iname [文件名]`：忽略大小写按文件名查找
- `-mtime [+/-天数]`：modify，按修改时间查找，+[n] n 天前，-[n] n 天内
- `-size [+/-大小]`：按文件大小查询
- `-and`：选项之间的默认关系，省略
- `-or`：或
- `-maxdepth`：最大深度

示例：

```bash
find ./ -mtime +7   # 查找七天前创建的文件，场景：备份
find ./ -mtime -7   # 查找七天内创建的文件，场景：系统中毒
find ./ -size +5M   # 查找大于5M的文件
find ./ -size -5M   # 查找小于5M的文件
find ./ -type f -size +5M -size -15M  # 查找大于5M且小于15M的普通文件（选项默认是and关系，被省略）
find ./ -size -5M -or -size +15M      # 查找小于5M或大于15M的文件
find ./ -maxdepth 1 -name "*.txt"     # 查找当前目录下的 txt 文件
```

**find 命令的后续处理**

**方法 1** - xargs 参数传递：

常规单参数命令通过 xargs 直接传递（xargs 后的别名命令将失效）

```bash
find ./ -type f -name "*.txt"|xargs rm -r # 将 find 的结果用 xargs 传递给 rm 进行删除
```

find 命令结果交给 mv、cp 处理：

```bash
find ./ -name "all.txt"|xargs -i cp {} /opt/ # 通过`xargs`的`-i`参数将结果插入到指定的`{}`位置。
```

**方法 2** - exec 执行命令：

```bash
find ./ -name "all.txt" -exec rm {} \;    # 用-exec参数转交find结果给其他命令
```

**方法 3** - 反引号或`$()`

```bash
rm -f `find ./ -name "all.txt"`
cp -f $(find ./ -name "all.txt")
```

###  stat - 文件状态信息{#stat}

```bash
stat 文件名
```

```bash
  File: ‘1.txt’
  Size: 65              Blocks: 8          IO Block: 4096   regular file
Device: 803h/2051d      Inode: 33574989    Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2025-09-17 01:03:14.929000000 +0800  # 访问时间
Modify: 2025-09-03 22:46:22.994000000 +0800  # 修改内容时间
Change: 2025-09-03 22:46:22.994000000 +0800  # 修改属性时间，内容被更改，属性也会变
 Birth: -
```

---

## 三、文件内容查看与操作

###  cat - 查看文件内容

```bash
cat [选项] 文件名
```

选项：

- `-n`：显示行号
- `-A`：显示所有字符（包括特殊字符）

### less - 分页查看文件内容

```bash
less [选项] 文件名
```

选项：

- `-N`：显示行号

常用快捷键：

- 空格/f：下一页
- b：上一页
- /：搜索内容
- n：下一个匹配项
- N：上一个匹配项
- g：跳到文件开头
- G：跳到文件末尾
- q：退出

### head - 显示文件开头部分

```bash
head [选项] 文件名
```

选项：

- `-n 数字`：显示前n行（可简写为`-数字`）

### tail - 显示文件末尾部分

```bash
tail [选项] 文件名
```

选项：

- `-n 数字`：显示后n行（可简写为`-数字`）
- `-f`：实时追踪文件变化（常用于查看日志）
- `-F`：类似于`-f`，但会在文件被移动或重命名后继续追踪

### diff - 比较文件差异

```bash
diff 文件1 文件2  # 比较两个文件的差异
```

### 4.6 tr - 替换单个字符

```bash
cat testfile.txt | tr 待替换字符 欲替换字符
tr 待替换字符 欲替换字符 < testfile.txt
```

---

## 四、文本处理

### grep - 文本过滤{#grep}

```bash
grep [选项] '模式' 文件
```

选项：

- `-r`：递归搜索目录中的文件（常用）
- `-v`：反向选择（常用，显示不匹配的行）
- `-i`：忽略大小写
- `-n`：显示行号
- `-w`：全字匹配
- `-c`：统计单词出现的个数
- `-o`：只显示匹配的具体内容
- `-E`：使用扩展正则，或者使用`egrep`命令
- `-A`：显示过滤到内容的后n行（包含过滤行）
- `-B`：显示过滤到内容的前n行
- `-C`：显示过滤到内容的前后各n行

wc - 统计文本

```bash
wc [选项] 文件
```

选项：

- `-l`：统计行数
- `-w`：统计单词数
- `-c`：统计字节数
- `-L`：显示最长行的长度

###  sort - 排序文本

```bash
sort [选项] 文件
```

选项：

- `-r`：反向排序（降序）
- `-n`：按数值排序
- `-k`：指定排序的列
- `-u`：去重（只输出唯一的行）

### uniq - 去除重复行

```bash
uniq [选项] 文件
```

选项：

- `-c`：统计每行重复次数
- `-d`：只显示重复的行
- `-u`：只显示不重复的行

注意：uniq只能去除相邻的重复行，通常与sort配合使用

示例：

```bash
# 统计 passwd 文件中单词出现的次数取前10
cat /etc/passwd|tr ":/0-9x" " "|xargs -n 1|sort|uniq -c|sort -rn|head
```

### xargs - 参数传递

```bash
命令 | xargs [选项] 目标命令  # 目标命令的别名将失效
```

选项：

- `-n 数字`：每次传递指定数量的参数
- `-I {}`：指定替换字符串

示例：

```bash
find . -name "*.txt" | xargs rm  # 删除所有txt文件
```

###  tac - 按行倒序

```bash
tac test.txt
```

示例：

```bash
cat test.txt| tac
```

### sed - 流编辑器{#sed}

```bash
sed [选项] '/过滤内容/' 文件
sed '模式 动作'  文件
```

选项：

- `-n`：取消默认输出
- `-i`：直接对源文件操作，不输出到标准输出
- `-r`：扩展正则支持

模式（找谁）：

- n：指定数字，表示过滤指定第 n 行
- n,m：区间过滤，过滤第 n 行至第 m 行
- `$`：末尾行
- `/Regex/`：模糊过滤，找到指定内容的**行**
- /Regex1/,/Regex2/：区间过滤，过滤表达式1至表达式2之间的内容

动作：

- `p`：print，打印，一般结合`-n`使用
- `d`：delete，删除
- `i`：在某一行的上一行插入新内容
- `a`：在某一行的下一行插入新内容
- `c`：替换某一行内容
- `w`：找到的行保存到文件
- `s#Regex1#Regex2#g`：全局替换，分隔符还可以用`/`

示例：

```bash
sed -n '2,$p' test.txt     # 打印到行尾
ifconfig eth0| sed -n '2p' # sed 连接管道符
sed '2,4d' test.txt        # 删除2-4行
sed 's/a/b/g' test.txt     # 将文件中的 a 替换为 b
sed '3i aaa' test.txt      # 在第3行的上一行插入 aaa
sed '3a aaa' test.txt      # 在第3行的下一行插入 aaa
sed '3c aaa' test.txt      # 将第3行替换为 aaa
sed '3w new.txt' test.txt  # 将第3行保存到 new.txt
# 后向引用
sed -r 's#(.*)#touch \1.txt#g'|bash test.txt
# 取出网卡中的ip
ifconfig eth0 | sed -n '2p' | sed -r 's#^.*inet (.*) netm.*$#\1#g'
```

### awk - 编程{#awk}

```bash
awk [选项] 动作 文件名
```

**选项：**

- `-F`：指定分隔符

**内置变量**：

- `NR`：存放着文件中每行的行号
- `NF`：最后一列的列号
- `FILENAME`：当前文件名
- `FS`：字段分隔符，默认是空格和制表符
- `RS`：行分隔符，用于分割每一行，默认是换行符
- `OFS`：输出字段的分隔符，用于打印时分割字段，默认为空格
- `OFMT`：数字输出的格式，默认为 `%.6g`
- `BEGIN{}`：**读取文件**之前执行的动作
- `END{}`：**读取文件**之前执行的动作

示例：

```bash
# 输出第3行
awk 'NR==3' file
# 输出 2-5 行
awk 'NR>=2&&NR<=5' file
# 模糊过滤
awk '/内容/' file
# 取列
awk '{print $0}' file
# 输出第1列和第2列
awk '{print $1"\t"$2}' file
# 输出每行最后一列的列号
awk '{print NF}' file
# 输出每行最后一列的内容
awk '{print $NF}' file
# 指定分隔符为:或者/
awk -F "[:/]+" '{print $1}' file
# 匹配符，对某一列使用正则
awk '$2 ~ /y$/' file
# 算术
> echo 10 20 | awk '{print $1+$2}'
30

```

---

## 五、系统信息与监控

### df - 磁盘空间查看

```bash
df [选项]
```

选项：

- `-h`：人性化显示大小（KB, MB, GB）
- `-i`：显示inode使用情况

### du - 文件/目录大小查看

```bash
du [选项] 文件或目录
```

选项：

- `-h`：人性化显示大小
- `-s`：只显示总大小（不显示子目录）
- `--max-depth=N`：指定显示深度

示例：

```bash
du -sh /etc   # 显示 /etc 目录的大小
```

### free - 内存使用情况

```bash
free [选项]
```

选项：

- `-h`：人性化显示大小
- `-s 秒数`：持续监控（指定间隔秒数）

### uptime - 系统运行时间{#uptime}

```bash
uptime  # 显示系统运行时间、用户数和平均负载
```

### w - 在线用户信息

```bash
w  # 显示当前登录用户及其活动
```

### whoami - 当前用户名

```bash
whoami  # 显示当前登录用户名
```

### lscpu - CPU信息

```bash
lscpu  # 显示CPU架构信息
```

### type - 命令类型检查

```bash
type 命令名  # 显示命令的类型（内置命令或外部命令）
```

### last - 登录日志（按次）

```bash
> last
root     pts/1        123.117.178.119  Wed Nov 12 20:10 - 20:10  (00:00)
root     pts/0        123.117.178.119  Wed Nov 12 19:59   still logged in
reboot   system boot  3.10.0-1160.119. Thu Nov 13 03:58 - 22:41  (-5:-17)
root     pts/2        123.117.178.119  Mon Nov 10 00:23 - crash (3+03:35)
root     pts/1        123.117.178.119  Sun Nov  9 23:09 - crash (3+04:48)
```

### lastlog - 登录日志（按用户）

```bash
> lastlog
Username         Port     From             Latest
root             pts/1    123.117.178.119  Wed Nov 12 20:10:29 +0800 2025
bin                                        **Never logged in**
daemon                                     **Never logged in**
adm                                        **Never logged in**
lp                                         **Never logged in**
```

---

## 七、其他实用命令

### which - 命令路径查找

```bash
which 命令名  # 显示命令的完整路径
```

### dd - 数据转换与拷贝

```bash
dd if=输入文件 of=输出文件 [选项]
```

选项：

- `bs=大小`：设置块大小
- `count=数量`：设置拷贝块数

示例：

```bash
dd if=/dev/zero of=test.img bs=1M count=100  # 创建100MB的空文件
```

---

## 八、命令组合与管道

示例：

```bash
# 统计当前目录下文件数量
ls -l | wc -l

# 查找包含"error"的日志行，按时间排序，显示最后10个
grep 'error' /var/log/syslog | sort | tail -10

# 查找最大的5个文件
find . -type f -exec du -h {} \; | sort -rh | head -5
```
