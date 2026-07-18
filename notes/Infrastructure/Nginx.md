# Nginx

## 简介

**Nginx和Apache优劣**

Nginx:

- 轻量级
- 抗并发
- 静态处理性能比apache高三倍以上
- 设计高度模块化
- 配置简洁
- 支持7层负载均衡
- 优秀的反向代理服务器
- 易启动
- 社区活跃

Apache:

- rewrite强大
- 模块多
- bug少，稳定
- 对php支持简单
- 处理动态请求时有优势

## 安装

### 安装方式

1. 编译安装：版本随意、安装复杂、升级繁琐、规范、便于管理
2. epel安装：版本较低、安装简单、配置不易读
3. 官方仓库：版本较新、安装简单、配置易读

### 配置官方yum源

```bash
[nginx-stable]
name=nginx stable repo
baseurl=https://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```



## 启动方式

1. 通过systemctl启动

2. 使用绝对路径运行

   ```bash
   nginx           # 启动
   nginx -s stop   # 停止
   nginx -s reload # 重载
   ```

   


## 配置文件

`/etc/nginx/nginx.conf`

```nginx
# 核心模块
user  nginx;                 # 启动nginx虚拟用户
worker_processes  auto;      # 启动子进程的数量，auto以cpu内核数为准

error_log  /var/log/nginx/error.log notice; # 错误日志
pid        /var/run/nginx.pid;              # 进程PID存放的位置

# 事件模块
events {
    worker_connections  1024;              # TCP连接的最大连接数
}

# http 模块
http {
    include       /etc/nginx/mime.types;    # 支持的媒体类型列表
    default_type  application/octet-stream; # 如果媒体类型不存在，则自动下载

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"'; # 日志格式

    access_log  /var/log/nginx/access.log  main; # nginx访问日志

    sendfile        on;     # 文件高效传输
    #tcp_nopush     on;

    keepalive_timeout  65;  # 长连接的超时时间

    #gzip  on;              # 是否开启压缩
    charset utf-8,gbk       # 中文支持

    include /etc/nginx/conf.d/*.conf;   # 业务配置文件
}
```

业务配置文件：

```nginx
server {
    listen 80;
    server_name www.sliman.com;
    location / {
        root /code/;
        index index.html index.htm;
    }
}
```

使用`nginx -t`检查语法

## 常用模块

```nginx
charset utf-8,gbk;  # 中文支持
```

### 目录索引

- `autoindex`: off|on 列出目录索引
- `autoindex_localtime`: off|on 使用本地时间而不是GMT
- `autoindex_exact_size`: on|off 使用精确的文件大小

```nginx
autoindex on;              # 列出目录索引
autoindex_localtime on;    # 使用本地时间而不是GMT
autoindex_exact_size off;  # 人性化大小单位
```

### 用户认证

```nginx
auth_basic test;                 # string|off 开启用户认证，string是一个描述
auth_basic_user_file auth_pass;  # 指定用户和密码文件
```

生成密码文件：

```bash
yum -y install httpd-tools # 安装依赖
htpasswd -b -c /etc/nginx/auth_pass sliman sliman # 生成密码
```

### IP限制

```nginx
allow 10.11.10.0/24;  # address|CIDR|all 白名单
deny 10.11.10.0/24;   # address|CIDR|all 黑名单
```

### 状态模块

```nginx
stub_status;  # [location] 访问路径显示nginx连接状态
```

```bash
Active connections: 2               # 当前活动连接数
server accepts handled requests 
 2 2 1
# 已接收连接数量 已处理连接数量 当前http请求数
Reading: 0 Writing: 1 Waiting: 1 
# 当前读取请求头数量 当前响应的请求头数量 等待的请求数，开启了keepalive
```

### 连接限制

```nginx
# [http] 区域名conn_zone，区域大小10m
limit_conn_zone $remote_addr zone=conn_zone:10m;
# [http][server][location] 同时连接数1
limit_conn conn_zone 1;                          
```

### 请求限制

```nginx
# [http] 每秒限制请求数
limit_req_zone $binary_remote_addr zone=req_zone:10m rate=1r/s;
# [http][server][location] burst: 超过连接数则延迟加载
limit_req zone=req_zone burst=3 nodelay;
# 重定向错误状态码，默认503
limit_req_status 478;
# 重定向错误页
error_page 478 /www/error/478.html;
```

## location语法优先级{#location}



| 匹配符 | 匹配规则                     | 优先级 |
| ------ | ---------------------------- | ------ |
| =      | 精确匹配                     | 1      |
| ^~     | 以某个字符串开头             | 2      |
| ~      | 区分大小写的正则匹配         | 3      |
| ~*     | 不区分大小写的正则匹配       | 4      |
| /      | 通用匹配，任何请求都会匹配到 | 5      |

Example:

```nginx
location = / {
    [ configuration A ]
}

location / {
    [ configuration B ]
}

location /documents/ {
    [ configuration C ]
}

location ^~ /images/ {
    [ configuration D ]
}

location ~* \.(gif|jpg|jpeg)$ {
    [ configuration E ]
}
```

## LNMP

LNMP下，数据路径 `user -> http -> nginx -> fastcgi -> php-fpm -> php -> mysql`

1. 部署Nginx，修改Nginx用户

   ```bash
   groupadd www -g666
   useradd www -u666 -g666 -s /sbin/nologin -M
   sed -i '/^user/c user www;' /etc/nginx/nginx.conf
   ```

2. 安装PHP服务

   ```bash
   # 1.仓库安装
   sudo yum install epel-release yum-utils -y
   sudo yum install http://rpms.remirepo.net/enterprise/remi-release-7.rpm -y
   sudo yum-config-manager --enable remi-php74
   sudo yum install php php-cli php-fpm php-mysqlnd php-gd php-xml php-mbstring php-opcache php-pdo -y
   
   
   # 2.通过rpm包本地安装
   ## 2.1上传rpm包
   ## 2.2本地安装
   yum -y localinstall *.rpm
   ## 2.3检查安装
   rpm -qa|grep php|wc -l
   
   # 3.配置php-fpm用户与nginx保持一致
   sed -i '/^user/c user = www' /etc/php-fpm.d/www.conf
   sed -i '/^group/c group = www' /etc/php-fpm.d/www.conf
   
   # 4.启动PHP服务
   systemctl start php-fpm
   systemctl enable php-fpm
   
   # 5.查看端口
   netstat -tunlp|grep 9000
   ```

3. 安装数据库

   ```bash
   # 安装
   yum -y install mariadb-server
   # 开机启动
   systemctl start mariadb
   systemctl enable mariadb
   # 验证端口
   netstat -tunlp|grep 3306
   
   # 修改数据库密码
   mysqladmin password 'sliman'
   # 验证登录
   mysql -uroot -psliman
   ```


4. Nginx连接PHP

   创建文件`index.php`：

   ```php
   <?php phpinfo() ?>
   ```

   编辑nginx配置文件：

   ```nginx
   server {
       listen 80;
       server_name php.jingway.com;
       root /php;
   
       location / {
           index index.php index.html;
       }
   
       location ~ \.php$ {
           fastcgi_pass 127.0.0.1:9000;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
       }
   }
   
   ```

5. PHP测试数据库连接：

   ```php
   <?php
       $servername = "localhost";
       $username = "root";
       $password = "123456";
   
       // 创建连接
       $conn = mysqli_connect($servername, $username, $password);
   
       // 检测连接
       if (!$conn) {
           die("Connection faild: " . mysqli_connect_error());
       }
       echo "MySQL数据库连接成功！";
   ?>
   ```

   
