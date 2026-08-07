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

## 编译安装

查看nginx默认模块：

```bash
nginx -V
```

1. 安装相关依赖：

   ```bash
   yum install -y gcc glibc gcc-c++ pcre-devel openssl-devel patch
   ```

2. 下载Nginx源码和第三方模块（如nginx_upstream_check）

   ```bash
   wget https://nginx.org/download/nginx-1.26.1.tar.gz
   wget https://github.com/yaoweibin/nginx_upstream_check_module/archive/master.zip
   ```

3. 将第三方模块加载到Nginx模块中

   ```bash
   # 解压后进入Nginx目录
   # 选择一个最接近Nginx版本的
   patch -p1 < ../nginx_upstream_check_module-master/check_1.20.1+.patch
   ```

4. 用命令把`--add-module=/root/nginx_upstream_check_module-master` 添加到`nginx -V`  的参数中

   ```bash
   ./configure --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib64/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module --add-module=/root/nginx_upstream_check_module-master --with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -fPIC' --with-ld-opt='-Wl,-z,relro -Wl,-z,now -pie'
   ```

5. 编译/安装

   ```bash
   make && make install
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

### 上传大小限制

```nginx
# Syntax:  
client_max_body_size size;
# Default:
client_max_body_size 1m;
# Context: http, server, location
# 网站上传文件的大小限制，默认是1m
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

## 反向代理

代理配置：

```nginx
proxy_pass http://www.baidu.com;
```

### 支持范围

Nginx代理服务支持的协议

- HTTP
- HTTPS
- TCP
- websocket
- GRPC
- POP/IMAP
- RTMP

反向代理常用的协议

- HTTP
- HTTPS
- websocket
- GRPC

### 携带头部信息

```nginx
# 传递Host
proxy_set_header Host $http_host;
# http版本号
proxy_http_version 1.1;
# 向服务器传递真实的$remote_addr
proxy_set_header X-Real-IP $remote_addr;
# 向服务器传递真实的$http_x_forwarded_for
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

### 代理TCP超时时间

```nginx
# 请求后端服务器连接的超时时间，默认60s
proxy_connect_timeout 60s;
# 等待后端服务器的响应时间，默认60s
proxy_send_timeout 60s;
# 后端服务器传回给Nginx代理的超时时间，默认60s
proxy_read_timeout 60s;
```

### 代理缓冲区

Nginx将**请求头部**和**请求主体**放在不同的内存缓冲区中

```nginx
# 开启缓冲区
proxy_buffering on;
# 头部缓冲区大小
proxy_buffer_size 4k;
# 主体缓冲区大小
proxy_buffers 8 4k;
```

### 常用参数

常用参数可以保存至`nginx/proxy_params`文件中，通过`include`来引用

```nginx
proxy_set_header Host $http_host;
proxy_http_version 1.1;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

proxy_connect_timeout 30;
proxy_send_timeout 60;
proxy_read_timeout 60;

proxy_buffering on;
proxy_buffer_size 32k;
proxy_buffers 4 128k;

# 让Nginx反向代理识别更多的后端错误码
proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
```

## 负载均衡

### 地址池

```nginx
upstream webs {
    server 10.0.0.7;
    server 10.0.0.8;
}

location / {
    proxy_pass http://webs;
}
```

### 调度算法{#scheduling}

| 调度算法   | 概述                                                         |
| ---------- | ------------------------------------------------------------ |
| 轮询       | 按时间顺序逐一分配到不同的后端服务器（默认）                 |
| weight     | 加权轮询，weight越大，分配到的访问几率越高                   |
| ip_hash    | 每个请求按访问IP的hash结果分配，这样来自同一IP的固定访问一个后端服务器 |
| url_hash   | 按照访问URL的hash结果来分配请求，使每个URL定向到同一个后端服务器 |
| least_conn | 最少链接数，哪个机器链接数少就分发给谁                       |

**轮询（默认）**

```nginx
upstream webs {
    server 10.0.0.7;
    server 10.0.0.8;
}
```

**weight（加权轮询）**

```nginx
upstream webs {
    server 10.0.0.7 weight=5;
    server 10.0.0.8;
}
```

**ip_hash**

```nginx
upstream webs {
    ip_hash; 
    server 10.0.0.7;
    server 10.0.0.8;
}
```

**url_hash**

```nginx
upstream webs {
    server 10.0.0.7;
    server 10.0.0.8;
    hash $request_uri;
    hash_method crc32;
}
```

### 后端服务器状态

| 状态         | 概述                                   |
| ------------ | -------------------------------------- |
| down         | 当前的server不参与调度                 |
| backup       | 其它服务器都无法连接时采用backup服务器 |
| max_fails    | 允许请求失败的次数                     |
| fail_timeout | max_fails失败后，服务暂停时间          |
| max_conns    | 限制最大的接收连接数                   |

## 四层负载

Nginx的四层负载为假四层，采用代理的方式，配置方法如下：

1. 编辑Nginx配置文件，在http模块外设置四层代理

   ```nginx
   include /etc/nginx/conf.c/*.conf;
   ```

2. 编辑四层负载配置文件

   ```nginx
   stream {
       upstream webs{
           server 10.0.0.5:80;
           server 10.0.0.6:80;
       }
       server {
           listen 80;
           proxy_pass webs;
       }
   }
   ```

## Rewrite

```nginx
rewrite 1.html a.html;
```

后缀标记Flag：

| flag      | 作用                                                         |
| --------- | ------------------------------------------------------------ |
| last      | 最后一次rewrite匹配                                          |
| break     | 直接停止向后匹配，直接返回当前的rewrite结果，不再重新发起请求 |
| redirect  | 等同于return 302，临时重定向                                 |
| permanent | 等同于return 301，永久重定向，只请求一次源站，之后浏览器缓存会将请求直接传给目标站点 |

重定向的其它写法：

```nginx
return 301 /aaa/1.html
return 302 /bbb/2.html
```

开启rewrite日志：

```nginx
http {
    rewrite_log on;
}
```

### 案例

**错误页跳转**

```nginx
error_page 403 404 500 501 502 @error_test;
location @error_test {
    rewrite ^(.*)$ /404.html break;
}
```

**在跳转后的请求行加上想要的参数&showoffline=1**

```nginx
# $args为Nginx内置的请求行参数
set $args "&showoffline=1";
```

**网站维护，只允许指定IP访问**

```nginx
set $ip 0;
if ($remote_addr = "10.0.0.1"){
    set $ip 1;
}
if ($ip = 0){
    rewrite ^(.*)$ /wh.html break;
}
```

