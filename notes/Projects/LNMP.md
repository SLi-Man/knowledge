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

