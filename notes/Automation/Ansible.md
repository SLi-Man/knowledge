# Ansible

## 概述

Ansible 是一款开源的自动化运维工具，基于 SSH 协议实现配置管理、应用部署、任务自动化等功能。采用无 Agent 架构，无需在远程主机上安装客户端。

## 核心特性

| 特性 | 说明 |
|------|------|
| **Agentless** | 基于 SSH，无需安装客户端 |
| **幂等性** | 重复执行不会产生副作用 |
| **声明式** | 使用 YAML 描述期望状态 |
| **模块化** | 2000+ 内置模块 |
| **可扩展** | 支持自定义模块和插件 |

## 架构

```
控制节点 (Control Node)
  ├── Inventory (主机清单)
  ├── Playbook (剧本)
  ├── Modules (模块)
  ├── Roles (角色)
  └── SSH → 受控节点 (Managed Nodes)
```

## 安装

### 控制节点

```bash
# 需要配置epel仓库
yum install -y ansible
```

### 版本验证

```bash
ansible --version
```

## 常用参数

- `-i`：主机清单文件路径，默认/etc/ansible/hosts
- `-m`：使用的模块名称，默认使用command模块
- `-a`：使用的模块参数，模块的具体动作

## 配置文件

生效顺序：

1. $ANSIBLE_CONFIG
2. **./ansible.cfg**
3. ~/.ansible.cfg
4. **/etc/ansible.cfg**

默认路径 `/etc/ansible/ansible.cfg` 或 `~/ansible.cfg`：

```ini
[defaults]
# 主机清单配置文件
inventory = /etc/ansible/hosts
# 库文件存放目录
library = /usr/share/my_modules/
# 临时py文件存放在远程主机目录
remote_tmp = ~/.ansible/tmp
# 本机的临时执行目录
local_tmp = ~/.ansible/tmp
# 默认并发数
forks = 5
# 默认sudo用户
sudo_user = root
# 每次执行是否询问sudo的ssh密码
ask_sudo_pass = True
# 每次执行是否询问ssh密码
ask_pass = True
# 远程主机端口
remote_port = 22
# 跳过检查主机指纹
host_key_checking = False
# ansible日志
log_path = /var/log/ansible.log

# 普通用户提权操作
[privilege_escalation]
become=True
become_method=sudo
become_user=root
become_ask_pass=False
```

## Inventory（主机清单）

### INI 格式

```ini
# inventory/hosts
[webservers]
web1.example.com ansible_host=192.168.1.10
web2.example.com ansible_host=192.168.1.11

[dbservers]
db1.example.com ansible_host=192.168.1.20 ansible_port=2222

[production:children]
webservers
dbservers

[production:vars]
ansible_user=deploy
ansible_ssh_private_key_file=/path/to/key
```

### YAML 格式

```yaml
# inventory/hosts.yml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
          ansible_host: 192.168.1.10
        web2.example.com:
          ansible_host: 192.168.1.11
    dbservers:
      hosts:
        db1.example.com:
          ansible_host: 192.168.1.20
          ansible_port: 2222
  vars:
    ansible_user: deploy
```

## Ad-Hoc 命令

```bash
# 基本语法
ansible <host-pattern> -m <module> -a "<arguments>"

# Ping 测试
ansible all -m ping

# 执行 Shell 命令
ansible webservers -m shell -a "hostname && uptime"

# 复制文件
ansible all -m copy -a "src=/tmp/file.txt dest=/tmp/file.txt"
  
# 安装软件
ansible webservers -m apt -a "name=nginx state=present"
ansible webservers -m yum -a "name=httpd state=present"

# 创建用户
ansible all -m user -a "name=testuser password={{ 'password' | password_hash('sha512') }}"

# 查看磁盘
ansible all -m shell -a "df -h"

# 使用 sudo
ansible all -m ping -b --become-user=root
```

## Playbook

### 基础结构

```yaml
# playbooks/webserver.yml
- name: 配置 Web 服务器
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    server_name: example.com

  tasks:
   name: 安装 Nginx
      apt:
        name: nginx
        state: present
        update_cache: yes

    - name: 配置 Nginx
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: restart nginx
      
    - name: 检查 Nginx 配置
      command: nginx -t
      register: ng_re
      ignore_errors: yes

    - name: 启动 Nginx
      service:
        name: nginx
        state: started
        enabled: yes

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
      when: ng_re is search "0"
```

### 变量管理

```yaml
# 定义变量
vars:
  app_name: myapp
  app_version: "1.0.0"
  db_host: "{{ groups['dbservers'][0] }}"

# 引用变量
- name: 部署应用
  template:
    src: config.j2
    dest: "/opt/{{ app_name }}/config.ini"

# 引用变量文件 
  vars_files: 
    - a.yml
```

官方推荐的变量位置：

- host_vars
- group_vars

### 变量注册

将部分模块的输出结果报错到变量中去，如command模块

```yaml
- hosts: web01
  tasks: 
    - name: test
      command: 'nginx -t'
      register: result_nginx
      
    - name: print result_nginx
      debug:
        msg: "{{ result_nginx }}"
```

### 条件判断

```yaml
# 判断操作系统
- host: web01
  tasks:
    - name: Install wget
      yum:
        name: wget
        state: present
      when: ansible_distribution == "CentOS"
```

```yaml
# 判断Nginx状态
- host: web01
  task:
  - name: Get Nginx Status
    command: "nginx -t"
    register: result_nginx
    # 忽略错误继续执行
    ignore_errors: yes
    
  - name: Restart Nginx Server
    systemd:
      name: nginx
      state: restarted
    when: result_nginx.stderr_lines is match "ok"
      
```

### 循环

```yaml
tasks:
  - name: 安装多个包
    apt:
      name: "{{ item }}"
      state: present
    loop:
      - nginx
      - redis-server
      - mysql-server

  - name: 创建多个文件
    file:
      name: /data/{{ item.name }}
      owner: "{{ item.owner }}"
      gourp: "{{ item.group }}"
      state: touch
    loop:
      - { name: 1.txt, owner: root, group: root}
      - { name: 2.txt, owner: www, group: www}
```

### 标签

```yaml
tasks:
  - name: 安装 Nginx
    apt:
      name: nginx
    tags:
      - install
      - nginx

  - name: 配置 Nginx
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    tags:
      - config
```

```bash
# 只运行特定标签
ansible-playbook playbook.yml -t install

# 排除特定标签
ansible-playbook playbook.yml --skip-tags config
```

## Jinja2 模板

### 基础语法

```jinja2
{# 注释 #}
{{ variable }}
{{ variable | default('value') }}
{% for item in list %}{{ item }}{% endfor %}
{% if condition %}...{% endif %}
```

### Nginx 配置模板示例

```jinja2
# templates/nginx.conf.j2
server {
    listen {{ http_port }};
    server_name {{ server_name }};

    location / {
        proxy_pass http://{{ backend_host }}:{{ backend_port }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 内置过滤器

```jinja2
{{ 'password' | password_hash('sha512') }}
{{ 100 | random }}
{{ ['a', 'b', 'c'] | join(', ') }}
{{ 'hello' | upper }}
```

## Roles

### 目录结构

```
roles/
└── nginx/
    ├── tasks/
    │   └── main.yml
    ├── templates/
    │   └── nginx.conf.j2
    ├── files/
    ├── handlers/
    │   └── main.yml
    ├── vars/
    │   └── main.yml
    ├── defaults/
    │   └── main.yml
    ├── meta/
    │   └── main.yml
    └── tests/
        └── test.yml
```

### Role 使用

```yaml
# playbook.yml
- hosts: webservers
  roles:
    - role: nginx
      vars:
        http_port: 8080
    - role: database
      tags: db
```

### 安装 Galaxy Role

```bash
ansible-galaxy install geerlingguy.nginx
ansible-galaxy install -r requirements.yml
```

## 常用模块

| 模块 | 用途 |
|------|------|
| `ping` | 连通性测试 |
| `shell`/`command` | 执行命令 |
| `copy` | 复制文件 |
| `template` | 模板渲染 |
| `apt`/`yum` | 包管理 |
| `service`/`systemd` | 服务管理 |
| `user`/`group` | 用户/组管理 |
| `file` | 文件属性管理 |
| `lineinfile` | 行替换 |
| `cron` | 定时任务 |
| `mount` | 挂载 |
| `setup` | 获取系统信息 |
| `debug` | 调试输出 |
| `git` | Git 操作 |
| `docker_container` | Docker 容器管理 |

**yum 模块**

- name：指定包的名称
- state：动作[present|absent|latest]

**copy 模块**

- src：源文件，默认使用控制端本地的位置
- dest：目标位置
- owner：属主
- group：属组
- mode：权限
- content：直接使用字符串写入 [dest]

**group 模块**

- name：组名
- gid：小组编号
- state：动作 [present|absent]

**user 模块**

- name：用户名
- state：动作 [present|absent]
- uid：用户ID
- group：指定组ID
- shell：指定Shell
- create_home：是否创建家目录[yes|no]

**file 模块**

- path：目标位置
- state：[touch|directory|absent]
- owner：属主
- group：属组
- recurse: 递归授权 [yes|no]
- mode：权限

**systemd 模块**

- name：目标服务
- state：[started|stopped|restarted|reloaded]
- enabled：开机启动 [yes|no]

**mount 模块**

默认会自动写入开机自动挂载

- path：欲挂载到的位置
- src：挂载的设备位置
- fstype：磁盘 类型
- state：[present|absent]

**cron 模块**

- name：任务描述
- minute: 分钟
- job: 执行命令
- state: [present|absent]

**unarchive 模块**

- src：压缩包位置，默认使用控制端本地位置
- dest：解压位置
- remote_src: 是否使用远端位置 [yes|no]
- creates：如果目标文件或目录已存在，则跳过步骤

**mysql_db 模块**

- name：数据库名 [all]
- state：动作 [import|dump]
- target：欲导入的文件位置

## 常用命令

```bash
# 查看 inventory
ansible-inventory --list
ansible-inventory --graph

# 语法检查
ansible-playbook playbook.yml --syntax-check

# 干跑（不实际执行）
ansible-playbook playbook.yml --check

# 详细输出
ansible-playbook playbook.yml -vvv

# 指定 inventory
ansible-playbook -i inventory/hosts playbook.yml

# 使用加密密码
ansible-playbook playbook.yml --ask-vault-pass
```

## Ansible Vault

```bash
# 创建加密文件
ansible-vault create secrets.yml

# 加密现有文件
ansible-vault encrypt plaintext.yml

# 编辑加密文件
ansible-vault edit secrets.yml

# 查看加密文件
ansible-vault view secrets.yml

# 解密文件
ansible-vault decrypt secrets.yml

# 变更密码
ansible-vault rekey secrets.yml
```

### Playbook 中使用

```yaml
vars:
  db_password: "{{ vault_db_password }}"
```

```yaml
# secrets.yml (vault 加密)
vault_db_password: "super_secret_password"
```

```bash
ansible-playbook playbook.yml --ask-vault-pass
```

## 最佳实践

### 目录结构

```
project/
├── ansible.cfg
├── inventory/
│   ├── hosts
│   └── group_vars/
│       ├── webservers.yml
│       └── dbservers.yml
├── playbooks/
│   ├── webserver.yml
│   └── database.yml
├── roles/
│   ├── nginx/
│   └── mysql/
├── group_vars/
├── host_vars/
└── vault_pass
```

### 命名规范

- Playbook 使用小写字母和连字符：`web-server.yml`
- Role 名称清晰：`nginx`, `mysql`, `redis`
- 任务描述清晰：`name: 安装 Nginx`
- 变量名使用下划线：`http_port`, `server_name`

### 安全性

```ini
# ansible.cfg
[defaults]
host_key_checking = True
roles_path = ./roles

[privilege_escalation]
become = True
become_method = sudo
become_user = root

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
```

## 常见问题

### Q: 如何处理 SSH 连接超时？
```bash
ansible all -m ping -o ConnectTimeout=10
```

### Q: 如何处理 sudo 密码？
```bash
ansible all -m ping -b --ask-become-pass
```

### Q: 如何并行执行？
```bash
ansible-playbook playbook.yml -f 20
```

### Q: 如何限制执行范围？
```bash
# 只在特定主机执行
ansible-playbook playbook.yml -l web1.example.com

# 跳过已失败的主机
ansible-playbook playbook.yml --limit webservers
```

## 参考资料

- [Ansible 官方文档](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/)
- [Ansible 最佳实践](https://docs.ansible.com/ansible/latest/user_guide/best_practices.html)