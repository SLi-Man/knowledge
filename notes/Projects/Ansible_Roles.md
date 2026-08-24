# Ansible Roles 构建

## 零、前置工作

### SSH免密钥

```bash
ssh-keygen
ssh-copy-id -i .ssh/id_rsa.pub 10.0.0.31
```

### Inventory

```ini
[webservers]
web01 ansible_host=10.0.0.7
web02 ansible_host=10.0.0.8

[nfsservers]
nfs ansible_host=10.0.0.31
```

## 一、系统优化

```yaml
# basic/tasks/main.yml
- name: Configure Base Repo
  yum_repository:
    name: CentOS-Base
    description: Aliyun yum repo
    baseurl: http://mirrors.aliyun.com/centos/$releasever/os/$basearch/
    gpgcheck: no
    enabled: yes
    state: presnet
    
- name: Configure epel Repo
  yum_repository:
    name: epel
    description: Aliyun epel repo
    baseurl: http://mirrors.aliyun.com/epel/7/$basearch
    gpgcheck: no
    enabled: yes
    state: presnet
    
- name: Configure Nginx Repo
  yum_repository:
    name: nginx
    description: Nginx yum repo
    baseurl: https://nginx.org/packages/centos/$releasever/$basearch/
    gpgcheck: no
    enabled: yes
    state: presnet
    
- name: Install Common Tools
  yum:
    name: "{{ item }}"
  loop:
    - lrzsz
    - wget
    - tree
    - net-tools
    - ntpdate
    - bash-completion.noarch
    - bash-completion-extras.noarch
    - Mysql-python

- name: Diskble Firewalld and NetworkManager
  systemd:
    name: "{{ item }}"
    state: stopped
    enabled: no
  loop:
    - firewalld
    - NetworkManager

- name: Disable Selinux
  selinux: 
    state: disabled
    
- name: Timing Sync
  cron:
    name: "Timing Sync"
    minute: "*/5"
    job: "/usr/sbin/ntpdate ntp1.aliyun.com &>/dev/null"
    
- name: Group Create
  group:
    name: www
    gid: 666

- name: Create User www
  user:
    name: www
    uid: 666
    group: www
    shell: /sbin/nologin
    create_home: no
```

## 二、NFS

```yaml
# nfs/tasks/main.yml
- name: Install NFS Server
  yum:
    name: nfs-utils
    state: present
- name: Configure NFS Server
  copy:
    content: "/data/ 172.16.1.0/24(rw,sync,all_squash,anonuid=666,anongid=666)"
    dest: /etc/exports
- name: Create www Group
  group:
    name: www
    state: present
    gid: 666
- name: Create www User
  user:
    name: www
    state: present
    uid: 666
    group: www
    shell: /sbin/nologin
    create_home: no
- name: Create /data
  file:
    path: /data
    state: directory
    owner: www
    group: www
- name: Start NFS Server
  systemd:
    name: nfs
    state: started
    enabled: yes
```

## 三、Backup（Rsync）

```jinja2
{# backup/templates/rsync.conf.j2 #}
uid = {{ rs_user }}
gid = {{ rs_user }}
port = {{ rs_port }}
fake super = yes
use chroot = no
max connections = 200
timeout = 600
ignore errors
read only = false
list = false
auth users = rsync_backup
secrets file = /etc/rsync.passwd
log file = /var/log/rsyncd.log

[backup]
comment = welcom to backup!
path = {{ rs_dir }}
```

```jinja2
{# backup/templates/rsync.passwd.j2 #}
rsync_backup:123456
```


```yaml
# backup/vars/main.yml
rs_user: www
rs:port: 873
rs_dir: /bacup
```

```yaml
# backup/tasks/main.yml
- name: Install Rsync Server
  yum:
    name: rsync
    state: present

- name: Configure Rsync Server
  template:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
    mode: "{{ item.mode }}"
  notify: Restart Rsync Server
  loop:
    - { src: rsyncd.conf.j2, dest: /etc/rsyncd.conf, mode: "0664" }
    - { src: rsync.passwd.j2, dest: /etc/rsync.passwd, mode: "0600" }
    
- name: Create "{{ rs_dir}}"
  file:
    path: "{{ rs_dir }}"
    state: directory
    owner: "{{ rs_user }}"
    group: "{{ rs_user }}"
    
- name: Start Rsync Server
  systemd:
    name: rsyncd
    state: started
    enabled: yes
```

```yaml
# backup/handlers/main.yml
- name: Restart Rsync Server
  systemd:
    name: rsyncd
    state: restarted
```

## 三、Web 服务

```yaml
# web/tasks/main.yml
- name: Install Nginx Server
  yum:
    name: nginx
    state: present
    
- name: Configure Nginx Server
  copy:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
  notify: Restart Nginx Server
  loop:
    - { src: nginx.conf, dest: /etc/nginx/nginx.conf}
    - { src: www.conf, dest: /etc/php-fpm.d/www.conf}

- name: Check Nginx Config
  command: nginx -t
  register: ng_re
  ignore_errors: yes

- name: Unarchive PHP.tar.gz
  unarchive:
    src: php71.tar.gz
    dest: /opt/

- name: Install PHP Server
  yum:
    name: "{{ pack }}"
    state: present
    
- name: Configure PHP Server
  copy:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
  notify: Restart PHP Server
  loop:
    - { src: www.conf, dest: /etc/php-fpm.d/www.conf}
    
- name: Start Nginx and PHP Server
  systemd:
    name: "{{ item }}"
    state: started
    enabled: yes
  loop:
    - nginx
    - php-fpm
```

```yaml
# web/handlers/main.yml
- name: Restart Nginx Server
  systemd:
    name: nginx
    state: restarted
  when: ng_re is search "0"
  
- name: Restart PHP Server
  systemd:
    name: php-fpm
    state: restarted
```

## 四、DB

```yaml
# db/tasks/main.yml
- name: Install Mariadb Server
  yum:
    name: mariadb-server
    state: present

- name: Start Mariadb Server
  systemd:
    name: mariadb
    state: started
    enabled: yes

- name: Copy all.sql to DB_Server
  copy:
    src: all.sql
    dest: /root/all.sql
    
- name: Import DB
  mysql_db:
    name: all
    state: import
    target: /root/all.sql
```

## 五、业务部署

```yaml
# wordpress/tasks/main.yml
- name: Delete Nginx Default.conf
  file:
    path: /etc/nginx/conf.d/default.conf
    state: absent
    
- name: Configure Nginx Server
  unarchive:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
    creates: /code
  loop:
    - { src: wo.tar.gz, dest: /etc/nginx/conf.d/ }
    - { src: code.tar.gz, dest: / }

- name: Restart Nginx Server
  systemd:
    name: "{{ item }}"
    state: restarted
  loop:
    - nginx
    - php-fpm
```

## 六、site

```yaml
# site.yml
- hosts: backup
  roles:
    - role: basic
    - role: nfs
      when: ansible_hostname == "nfs"
    - role: backup
      when: ansible_hostname == "backup"
    - role: web
      when: ansible_hostname is search "web"
    - role: db
      when: ansible_hostname == "db01"
    - role: wordpress
      when: ansible_hostname is search "web"
```

