# SSH远程访问

## 一、SSH 基本概念
*   **什么是 SSH？**
    *    Secure Shell 的缩写，是一种用于安全访问远程服务器的网络协议。
    *    加密通信内容，防止信息泄露、窃听和篡改。
*   **SSH 的工作方式**：客户端/服务器模型。
*   **默认设置**：
    *    默认端口：`22`
    *    服务端进程：`sshd`
    *    客户端工具：`ssh`

## 二、安装与启动 SSH 服务
*   检查是否已安装：`rpm -qa | grep ssh` 或 `dpkg -l | grep ssh`
*   安装 SSH 服务端（以常见发行版为例）：
    *   CentOS/RHEL/Fedora: `sudo yum/dnf install openssh-server`
    *   Debian/Ubuntu: `sudo apt install openssh-server`
*   启动、停止、重启、设置开机自启：
    ```bash
    sudo systemctl start sshd    # 启动
    sudo systemctl enable sshd   # 开机自启
    sudo systemctl status sshd   # 查看状态
    ```

## 三、基础使用：连接远程服务器
*   **最基本连接命令**：`ssh username@remote_host_ip`
    *   示例：`ssh root@192.168.1.100`
*   **指定端口连接**（如果服务端端口不是22）：`ssh -p port_num username@remote_host_ip`
    *   示例：`ssh -p 2222 user@example.com`
*   **首次连接与 known_hosts 文件**：
    *   解释“The authenticity of host ... can't be established.”警告的含义。
    *   `known_hosts` 文件的作用：存储远程主机公钥，用于验证主机身份，防止中间人攻击。

## 四、SSH 认证方式：密码 vs. 密钥
*   **密码认证**：最基础的方式，但安全性较低（易受暴力破解）。
*   **密钥认证（推荐）**：更安全、更方便的免密登录方式。
    1.  **生成密钥对**：`ssh-keygen -t rsa -b 4096 -C "your_email@example.com"`
        *   解释 `-t`（类型）、`-b`（强度）、`-C`（注释）。
        *   密钥对位置：`~/.ssh/id_rsa`（私钥，绝不能泄露），`~/.ssh/id_rsa.pub`（公钥）。
    2.  **将公钥上传到服务器**：
        *   方法一：使用 `ssh-copy-id` 命令（最简单）：`ssh-copy-id -p port username@remote_host_ip`
        *   方法二：手动复制：将公钥内容追加到服务器的 `~/.ssh/authorized_keys` 文件中。
    3.  **登录测试**：`ssh -p port username@remote_host_ip` 此时应无需输入密码。
*   **权限问题**：强调 `.ssh` 目录和 `authorized_keys` 文件的权限必须正确，否则认证会失败。
    *   `chmod 700 ~/.ssh`
    *   `chmod 600 ~/.ssh/authorized_keys`

## 五、SSH 服务端配置：`/etc/ssh/sshd_config`
这是安全加固的核心，记录修改后需重启 `sshd` 服务生效。
*   **安全重要选项**：
    *   `Port 2222`：更改默认端口，减少自动化攻击。
    *   `PermitRootLogin no`：禁止 root 用户直接登录。
    *   `PasswordAuthentication no`：禁用密码认证，强制使用密钥登录（确保密钥可用后再设置！）。
    *   `PubkeyAuthentication yes`：启用公钥认证。
    *   `PermitEmptyPasswords no`：禁止空密码登录。
*   **其他常用选项**：
    *   `AllowUsers user1 user2@ip`：只允许特定用户或从特定IP来的用户登录。
    *   `ClientAliveInterval 300` 和 `ClientAliveCountMax 3`：防止连接超时断开。

## 六、高级功能与技巧
*   **在远程执行单条命令**：`ssh user@host 'command'`
    *   示例：`ssh user@web01 'df -h'` （查看web01服务器的磁盘空间）
*   **SSH 隧道（端口转发）**
    *   **本地转发 (Local Forwarding)**：`-L`
        *   语法：`ssh -L local_port:target_host:target_port user@ssh_server`
        *   应用：访问远程服务器内网的某个服务（如数据库）。
    *   **远程转发 (Remote Forwarding)**：`-R`
        *   语法：`ssh -R remote_port:local_host:local_port user@ssh_server`
        *   应用：将本地开发环境临时暴露到公网服务器上。
*   **SCP：基于 SSH 的安全文件传输**
    *   上传本地文件到远程：`scp -P port local_file user@host:remote_path`
    *   从远程下载文件：`scp -P port user@host:remote_file local_path`
    *   递归复制目录：`scp -r ...`
*   **SFTP：安全的交互式文件传输**
    *   连接：`sftp -P port user@host`
    *   交互命令：`get`（下载），`put`（上传），`ls`，`cd`，`lls`（本地ls）等。

## 七、故障排查
*   **启用详细模式 (`-v`)**：`ssh -v user@host`，`-vvv` 更详细，用于查看连接细节，定位问题。
*   **检查网络和端口**：`telnet host port` 或 `nc -zv host port` 检查端口是否开放。
*   **检查服务端日志**：`tail -f /var/log/secure` 或 `/var/log/auth.log`，查看认证失败的记录。

---

## 如何与你已有的知识关联

*   **与防火墙配置关联**：在 **`11-System_Optimization_Security.md`** 中，如果你修改了SSH端口，必须记得在防火墙（firewalld/iptables）中放行**新的端口**，而不是默认的22端口。
*   **与系统服务管理关联**：管理 `sshd` 服务（start, stop, restart, enable）是 **`07-Systemd_Service.md`** 中 `systemctl` 命令的典型应用。
*   **与文件权限关联**：SSH密钥对的权限设置是 **`02-File_System.md`** 中文件权限知识点的实战应用。

