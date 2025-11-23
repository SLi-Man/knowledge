# Shell 脚本编程

## 一、Shell 脚本基础
*   **什么是 Shell 脚本？**：解释其概念——为了自动执行一系列命令而编写的文本文件。
*   **选择正确的 Shell**：通常默认为 Bash (`#!/bin/bash`)，介绍为什么 Bash 是首选。
*   **创建与执行脚本的步骤**：
    1.  `vim hello-world.sh` （创建文件）
    2.  编写代码 (例如：`echo "Hello, World!"`)
    3.  `chmod +x hello-world.sh` （赋予可执行权限）
    4.  `./hello-world.sh` （执行）
    *   替代执行方式：`bash hello-world.sh` 或 `source hello-world.sh`（在当前Shell执行）
*   **Shebang**：`#!` 符号的含义和作用（指定解释器，如 `#!/bin/bash`）。

## 二、变量与参数
*   **定义变量**：`variable_name="value"`（等号两边不能有空格）。
*   **使用变量**：`$variable_name` 或 `${variable_name}`（推荐后者，避免歧义）。
*   **变量类型**：
    *   字符串、整数（实际上Bash中所有变量都是字符串，但可通过特定操作进行算术运算）。
    *   **环境变量** (`env` 命令查看)：如 `$HOME`, `$PATH`, `$USER`。
    *   **只读变量**：`readonly variable_name`。
    *   **局部变量与全局变量**：在函数中使用 `local` 关键字。
*   **特殊变量**（用于处理参数）：
    *   `$0`：脚本名称本身。
    *   `$1`, `$2`, `$3...`：第1、2、3...个参数。
    *   `$#`：传递给脚本的参数个数。
    *   `$*` 和 `$@`：所有参数（略有区别）。
    *   `$?`：上一个命令的退出状态（0表示成功，非0表示失败）。
    *   `$$`：当前Shell的进程ID（PID）。

## 三、字符串与数组操作
*   **字符串操作**：
    *   拼接：`str3="$str1$str2"`
    *   长度：`${#string}`
    *   截取：`${string:position:length}`
    *   替换：`${string/substring/replacement}`
*   **数组**：
    *   定义：`array=("value1" "value2" "value3")`
    *   访问：`${array[0]}` （索引从0开始）
    *   访问所有元素：`${array[@]}`
    *   获取数组长度：`${#array[@]}`

## 四、运算符
*   **算术运算符**：`+`, `-`, `*`, `/`, `%` (取余)
    *   运算方式：`$(( expression ))` （例如：`result=$(( a + b ))`）
*   **关系运算符**（用于数字）：`-eq` (等于), `-ne` (不等于), `-gt` (大于), `-lt` (小于), `-ge` (大于等于), `-le` (小于等于)。
*   **布尔与字符串运算符**：
    *   `!` (非), `-o` (或), `-a` (与)
    *   `=` 或 `==` (字符串相等), `!=` (字符串不相等), `-z` (字符串长度为0), `-n` (字符串长度不为0)。
*   **文件测试运算符**（非常有用）：
    *   `-e file`：文件/目录是否存在。
    *   `-f file`：是否是普通文件。
    *   `-d file`：是否是目录。
    *   `-r file`：是否可读。
    *   `-w file`：是否可写。
    *   `-x file`：是否可执行。
    *   `-s file`：文件大小是否大于零（是否为空）。

## 五、流程控制
*   **条件判断：if语句**
    ```bash
    if [ condition ]; then
      # commands
    elif [ another_condition ]; then
      # commands
    else
      # commands
    fi
    ```
    *   **重点**：`[ ]` 两边必须有空格。现代脚本推荐使用 `[[ ]]`，功能更强大且更安全（支持 `&&`, `||` 和正则匹配 `=~`）。
*   **多分支选择：case语句**
    ```bash
    case $variable in
      pattern1)
        command1
        ;;
      pattern2|pattern3)
        command2
        ;;
      *)
        default_command
        ;;
    esac
    ```
*   **循环：for, while, until**
    *   `for` 循环：
        ```bash
        for var in list; do
          commands
        done
        
        # C语言风格
        for (( i=0; i<10; i++ )); do
          commands
        done
        ```
    *   `while` 循环：当条件为真时执行。
        ```bash
        while [ condition ]; do
          commands
        done
        ```
    *   `until` 循环：直到条件为真时停止（与 `while` 相反）。
        ```bash
        until [ condition ]; do
          commands
        done
        ```
    *   **循环控制**：`break`（跳出循环），`continue`（跳过本次循环）。

## 六、输入与输出
*   **读取用户输入**：`read -p "Enter your name: " name`
*   **Here Document**：一种内联输入重定向。
    ```bash
    command << EOF
    input line 1
    input line 2
    EOF
    ```

## 七、函数
*   **定义函数**：
    ```bash
    function_name() {
      local local_var=$1 # 局部变量
      commands
      return $? # 返回值（通常是0或1）
    }
    ```
*   **调用函数**：`function_name arg1 arg2`
*   **函数返回值**：使用 `return` 返回一个**退出状态码**（0-255）。要返回**数据**，通常使用 `echo` 并在调用时用 `$(function_name)` 捕获输出。

## 八、高级主题与最佳实践
*   **调试脚本**：
    *   `bash -x script.sh` （跟踪执行，显示每一行命令及其参数）
    *   在脚本中启用调试：`set -x`（开启），`set +x`（关闭）。
*   **错误处理**：
    *   `set -e`：脚本中任何一行命令执行失败（返回值非0）则立即退出。
    *   `set -u`：遇到未定义的变量则报错并退出。
    *   `set -o pipefail`：确保管道命令中任何一个失败，整个管道都视为失败。
*   **信号捕获**：使用 `trap` 命令在脚本收到中断信号（如 `Ctrl+C`）时执行清理操作。
    ```bash
    trap 'rm -f /tmp/temp_file; exit 1' INT TERM
    ```
*   **常用命令**：
    *   `sed` 和 `awk`：更强大的文本处理（可以单独开文件，这里做简介和链接）。
    *   `grep`：文本搜索。
*   **样式与最佳实践**：
    *   使用双引号引用变量，防止单词拆分。
    *   对代码进行注释。
    *   使用有意义的变量名和函数名。

## 九、实战脚本示例
*   系统信息收集脚本。
*   日志分析/过滤脚本。
*   备份目录的脚本。
*   监控进程是否存在并重启的脚本。
*   批量创建用户或处理文件的脚本。

