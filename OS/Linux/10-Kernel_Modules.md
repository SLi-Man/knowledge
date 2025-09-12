# 内核与模块

## 一、核心概念：什么是内核模块？
*   ** monolithic Kernel（宏内核）**：Linux 内核是宏内核，意味着核心功能都在一个大的内核空间中运行，效率高。
*   **内核模块 (Kernel Module)** 的意义：为了解决宏内核“庞大、难以扩展、需要频繁重新编译”的问题而诞生。
    *   允许在**内核运行时**动态地向内核添加或移除功能。
    *   本质是**目标文件**（`.ko` 文件），一旦加载，其代码就成为内核的一部分，享有内核的高权限。
*   **模块 vs 内置功能**：某些功能可以直接编译进内核（built-in），而不是作为模块。内置的功能无法卸载。
*   **模块的典型用途**：
    *   设备驱动程序（最常见，如显卡、网卡、USB驱动）。
    *   文件系统支持（如 `ext4`, `nfs`, `vfat`）。
    *   系统调用。
    *   网络功能。

## 二、管理内核模块：核心命令
*   **`lsmod`**：**列出当前已加载的所有模块**。输出三列：`Module`（模块名）、`Size`（大小）、`Used by`（被谁使用，显示依赖关系）。
    ```bash
    $ lsmod
    ```
*   **`insmod`**：**最基础的模块插入命令**。需要指定模块文件的**完整路径**，且**不自动解决依赖**。
    ```bash
    $ sudo insmod /path/to/module.ko
    ```
*   **`rmmod`**：**卸载模块**。要求模块当前是**空闲的**（没有被使用，且没有依赖它的模块）。
    ```bash
    $ sudo rmmod module_name
    ```
*   **`modprobe`**：**智能版 insmod/rmmod**。**首选工具**。
    *   只需指定模块名，会自动在标准模块路径（`/lib/modules/$(uname -r)/`）下查找 `.ko` 文件。
    *   **自动处理依赖关系**：加载时自动加载其依赖的模块；卸载时自动卸载依赖它的模块。
    *   用法：
        ```bash
        $ sudo modprobe module_name  # 加载模块（及其依赖）
        $ sudo modprobe -r module_name # 卸载模块（及依赖它的模块）
        ```
*   **`depmod`**：**生成模块依赖关系文件**。通常在安装新模块后运行，以便 `modprobe` 能正确工作。`-a` 选项为所有模块生成依赖。
    ```bash
    $ sudo depmod -a
    ```
*   **`modinfo`**：**显示模块的详细信息**。非常有用，可以查看模块的描述、参数、作者、许可证等。
    ```bash
    $ modinfo module_name
    ```

## 三、模块的配置与黑名单
*   **模块参数**：有些模块可以在加载时传递参数来配置其行为。
    *   查看参数：`modinfo module_name`
    *   加载时传递参数：
        ```bash
        $ sudo insmod module.ko parameter=value
        # 或者使用 modprobe（更推荐）
        $ sudo modprobe module_name parameter=value
        ```
    *   参数文件：在 `/sys/module/<module_name>/parameters/` 目录下，有时可以动态查看或修改某些参数。
*   **模块黑名单：`/etc/modprobe.d/` 目录**
    *   **目的**：防止系统在启动时自动加载某个模块，或覆盖模块的默认参数。
    *   **方法**：在此目录下创建任何以 `.conf` 结尾的文件（如 `blacklist.conf`）。
    *   **示例：屏蔽不需要的声卡驱动**
        ```
        # /etc/modprobe.d/blacklist.conf
        blacklist snd_hda_intel # 阻止模块被自动加载
        alias snd_hda_intel off # 另一种方法
        ```
    *   **示例：为模块设置默认参数**
        ```
        # /etc/modprobe.d/iwlwifi.conf
        options iwlwifi power_save=0 # 为英特尔无线网卡禁用省电模式
        ```
*   **系统启动时加载模块：`/etc/modules-load.d/` 目录**
    *   **目的**：让系统在启动早期就加载某些模块。
    *   **方法**：在此目录下创建 `.conf` 文件，里面直接写入需要加载的模块名（每行一个）。
        ```
        # /etc/modules-load.d/my-modules.conf
        vboxguest
        vboxsf
        vboxvideo
        ```

#### 四、实战：从代码到模块（可选，但非常有价值）
*   演示一个最简单的 `Hello World` 内核模块的编写、编译和测试过程。
*   **编写代码 `hello.c`**：
    ```c
    #include <linux/init.h>
    #include <linux/module.h>
    
    MODULE_LICENSE("GPL");
    MODULE_AUTHOR("Your Name");
    
    static int __init hello_init(void) {
        printk(KERN_INFO "Hello, Kernel World!\n");
        return 0;
    }
    
    static void __exit hello_exit(void) {
        printk(KERN_INFO "Goodbye, Kernel World.\n");
    }
    
    module_init(hello_init);
    module_exit(hello_exit);
    ```
*   **编写 `Makefile`**：
    ```makefile
    obj-m += hello.o
    all:
        make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules
    clean:
        make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean
    ```
*   **编译与测试**：
    ```bash
    $ make            # 生成 hello.ko
    $ sudo insmod hello.ko   # 加载
    $ dmesg | tail -n 2      # 查看内核日志，确认打印了Hello消息
    $ sudo rmmod hello       # 卸载
    $ dmesg | tail -n 2      # 查看Goodbye消息
    ```

## 五、故障排查与常用技巧
*   **内核日志 (`dmesg`)**：模块的 `printk` 输出不会到终端，必须使用 `dmesg` 命令查看。这是调试模块的**最重要工具**。
*   **模块导致系统不稳定怎么办？**
    *   如果刚加载的模块导致系统卡死，重启后进入**恢复模式**或**单用户模式**。
    *   在 `/etc/modprobe.d/blacklist.conf` 中将该模块加入黑名单。
*   **查看模块依赖关系文件**：`/lib/modules/$(uname -r)/modules.dep`。

---

## 如何与你已有的笔记关联

*   当在 **`02-File_System.md`** 中讲到 `ext4`、`vfat` 等文件系统时，可以提到它们是以内核模块的形式实现的。
*   当在 **`05-Network_Configuration.md`** 中配置网卡时，可以链接回本章，讲解如何查看和加载对应的网卡驱动模块（如 `e1000`, `igb`, `iwlwifi`）。
*   当在 **`11-System_Optimization_Security.md`** 中讨论系统安全和稳定性时，可以提到禁用不必要的内核模块也是一种安全加固措施。
