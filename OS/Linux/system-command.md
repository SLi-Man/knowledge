# 系统命令

## 1 帮助信息

### 1.1 which

查找并显示给定命令的绝对路径。

示例：

```bash
which pwd
```





## 2 系统信息

### 2.1 whoami

查看当前登录用户名。



### 2.2 lscpu

查看 cpu 的信息。



### 2.3 free

查看内存的信息，常用 -h 参数。



### 2.4 df

查看磁盘信息。



### 2.5 uptime

查看系统负载

```bash
 15:44:16 up  1:06,  1 user,  load average: 0.00, 0.04, 0.17
# 系统时间   运行时间    连接用户    平均负载     1分钟  5分钟 10分钟
# 平均负载：数值接近或者超过系统核心数，则表示非常繁忙
```



### 2.6 w

查看系统负载和用户信息

```bash
 15:54:25 up  1:16,  1 user,  load average: 0.00, 0.01, 0.09
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    193.168.3.200    14:39    2.00s  0.31s  0.05s w
```





## 3 文本处理

### 3.1 cat

```bash
cat    # 查看文件内容
    -n # 显示行号
    -A # 以$符号显示在行末尾，可用于查看是否存在多余空格
```



### 3.2 tail

```bash
tail      # 显示文件的最后 10 行
    -n 数字  # 显示文件末尾的第 n 行，可简写为 -数字
    -f      # 实时显示文件内容
    tailf == tail -f

# exp: 通过管道符将命令结果输出给 tail 命令
ip addr | tail -2
```



### 3.3 grep

```bash
grep '过滤的内容' file  # 过滤文件中的单词，默认是模糊匹配（匹配行），可接收管道符
    -w    # 精准匹配
```



### 3.4 head

```bash
head    # 显示文件的前 10 行，基本语法与 tail 一致
```



### 3.5 less

```bash
less       # 按页查看文件内容，适合大文件
    -N     # 显示行号
快捷键
    空格/f  # 下一页
    b      # 上一页
    /      # 搜索内容
    n      # 往下查找
    N      # 往上查找
    q      # 退出 less 命令
    g      # 快速到文件首行
    G      # 快速到文件的末尾
    g100   # 快速到第100行
    v      # 进入 vim 模式
```



### 3.6 more 

不支持快捷键，到文件末尾会自动退出，了解即可。



### 3.7 wc

```bash
wc      # 统计，可以接收管道符
    -l <filename>    # 统计文件的行数
    -L <filename>    # 统计文件中最长行的字符长度
    cat <filename>|wc -l
    ip addr|wc -l

  20   38  938  passwd
# 行数 字数 字节数 文件名
```



### 3.8 sort

```bash
sort    # 排序，默认按照第一列升序排序
    -r  # 降序排序
    -n  # 按数字大小进行排序
    -k # 指定列排序
```



### 3.9 uniq

```bash
uniq    # 去重，只去除相邻行，通常结合 sort 使用
    -c  # 统计重复数量
    
# exp1: 去重统计 test.txt 文件，并降序排序取前三名
cat test.txt | sort | uniq -c | sort -rn | head -3
# exp2: 统计 passwd 文件中单词的数量，取 top10
cat passwd | sed 's#[:/0-9x]# #g' | xargs -n1 | sort | uniq -c | sort -rn | head
```



### 3.10 xargs

```bash
xargs       # 将文本转化成n列输出
    -n<num> # 指定列数
```

