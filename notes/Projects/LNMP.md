# LNMP集群搭建

## 基础环境搭建

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

搭建网站略~

## 架构拆分

### 数据库扩展

1. 准备单独的数据库服务器 db01

   ```bash
   # 部署Mariadb服务
   # 启动Mariadb，开机启动
   ```

2. 将web01上的数据库导出

   ```bash
   mysqldump -uroot -p'passwd' -A > all.sql
   ```

3. 将数据库文件拷贝到db01

   ```bash
   scp all.sql root@10.0.0.51:/root
   ```

4. 导入数据库文件

   ```bash
   mysql -uroot < all.sql   # 刚安装完没有密码
   systemctl restart mariadb  # 重启数据库后密码生效
   ```

5. 授权远程数据库连接

   ```mysql
   grant all on *.* to jingway@'%' identified by 'jingway.com';
   ```

6. 修改web01服务指向db01

   ```bash
   # web01 停止并禁止开机运行
   systemctl stop mariadb
   systemctl disable mariadb
   
   # 修改网站数据库配置文件
   ```

### Web 服务扩展

1. 准备一台web02 10.0.0.8

2. 创建虚拟用户www

   ```bash
   groupadd -g666 www
   useradd -u666 -g666 -M -s /sbin/nologin www
   ```

3. 部署nginx

4. 部署php

5. nginx无差别同步

   ```bash
   rsync -avz --delete 172.16.1.7:/etc/nginx/ /etc/nginx
   ```

6. php无差别同步

   ```bash
   rsync -avz --delete 172.16.1.7:/etc/php-fpm.d/www.conf /etc/php-fpm.d/www.conf
   ```

7. web01代码同步到web02

   ```bash
   # web01
   tar czvf code.tar.gz /code
   scp code.tar.gz 172.16.1.8:/
   
   # web02
   tar xf code.tar.gz
   ```

8. 启动服务

   ```bash
   systemctl start nginx php-fpm
   systemctl enable nginx php-fpm
   ```

9. 测试服务

### 存储扩展（NFS）

**NFS Server:**

1. 准备一台nfs 10.0.0.31

2. 安装nfs服务

3. 配置nfs服务

   ```bash
   # /etc/exports
   /code/wp 172.16.1.0/24(rw,sync,all_squash,anonuid=666,anongid=666)
   ```

   ```bash
   groupadd -g666 www
   useradd -u666 -g666 -M -s /sbin/nologin www
   mkdir -p /code/wp
   chown www.www /code/wp
   ```

4. 启动nfs服务

   ```bash
   systemctl start nfs
   systemctl enable nfs
   ```

5. 检查nfs服务

   ```bash
   cat /var/lib/nfs/etab
   ```

**NFS Client:**

1. 所有客户端安装nfs

   ```bash
   yum -y install nfs-utils
   ```

2. 将web服务器上的图片推送到nfs服务器

   ```bash
   scp -r /code/wordpress/wp-content/uploads/ 172.16.1.31:/code/wordpress/
   ```

3. 挂载nfs

   ```bash
   mount -t nfs 172.16.1.31:/code/wordpress/uploads /code/wordpress/wp-content/uploads/
   ```

## 配置优化

### 修改上传大小限制

**Nginx:** 修改`/etc/nginx/nginx.conf`

```nginx
client_max_body_size 20m;
```

**PHP:** 修改`/etc/php.ini`

```ini
;POST数据最大尺寸
post_max_size = 20M
;允许上传文件的最大尺寸
upload_max_filesize = 20M
```

## 负载均衡

1. 反向代理服务器 lb01 10.0.0.5

2. 部署Nginx

3. 配置反向代理 

   proxy_params:

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
   
   proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
   ```

   default.conf:
   
   ```nginx
   upstream webs {
       server 10.0.0.7;
       server 10.0.0.8;
   }
   
   server {
       listen 80;
       server_name wp.jingway.com;
   
       location / {
           proxy_pass http://webs;
           include proxy_params;
       }
   }
   ```
   

## 会话保持

### 部署Redis

1. 安装

   ```bash
   # 配置在db01 172.16.1.51
   yum install -y redis
   ```

2. 编辑配置文件：`/etc/redis.conf`

   ```ini
   bind 127.0.0.1
   # 改为，配置允许通过172.16.1.51连接redis
   bind 127.0.0.1 172.16.1.51
   ```

3. 启动

   ```bash
   systemctl start redis
   systemctl enable redis
   ```

4. 检查端口

   ```bash
   netstat -tunlp | grep 6379
   ```

### 修改PHP会话配置

1. web服务器上安装php-pecl-redis扩展

   ```bash
   yum install -y php-pecl-redis
   ```

2. 编辑web服务器配置文件`/etc/php.ini`

   ```ini
   session.save_handler = files
   
   ;session.save_path = "/tmp"
   ```

   改为：

   ```ini
   session.save_handler = redis
   
   session.save_path = "tcp://172.16.1.51:6379"
   ```

3. 注释掉php-fpm配置文件`/etc/php-fpm.d/www.conf`

   ```ini
   ;php_value[session.save_handler] = files
   ;php_value[session.save_path]     = /var/lib/php/session
   ```

   



## 动静分离

1. [部署Tomcat](../Infrastructure/Tomcat.md#install)

2. Nginx反向代理Tomcat

   ```nginx
   upstream tom {
       server 172.16.1.8:8080;
   }
   server {
       listen 80;
       server_name tomcat.jingway.com;
       
       location / {
           proxy_pass http://tom;
       }
       
       location ~* \.(png|jpg|svg|mp4|mp3)$ {
           root /code/images;
       }
   }
   ```

   

   
