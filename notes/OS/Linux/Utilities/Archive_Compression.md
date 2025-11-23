# 打包与压缩

## tar 命令

语法：

```bash
tar [选项] 目标文件
```

选项：

- `c [保存的文件名] [欲压缩的文件]`：create，创建
- `z`：zip，使用 zip 压缩
- `v`：verbose，显示压缩过程
- `f`：file，文件
- `tf`：查看压缩包里的内容
- `xf`：解压缩
- `P`：强制保留根目录`\`
- `-C` ：指定解压的位置
- `--exclude=`：压缩时排除指定文件
- `--exclude-from`：从文件中指定需要排除的文件

```bash
# 压缩文件
tar czvf all.tar.gz 1.txt 2.txt
# 解压缩
tar xf all.tar.gz
# 查看压缩包里的文件列表
tar tf all.tar.gz
# 压缩时排除指定文件
tar czvf all.tar.gz *.txt --exclude=1.txt
# 压缩时排除指定的多个文件列表
tar czvf all.tar.gz *.txt --exclude-from=ex.txt
```

## zip 命令

需要提前安装好 zip 命令。

语法：

```bash
zip 包名 待压缩文件  # 压缩
unzip 包名         # 解压缩
```

选项：

`-d`：指定解压的位置

