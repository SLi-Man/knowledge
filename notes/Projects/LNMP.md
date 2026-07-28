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

## 数据库扩展

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

## Web 服务扩展

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

## 存储扩展（NFS）

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

   
