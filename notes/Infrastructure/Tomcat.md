# Tomcat

## 概述

Apache Tomcat 是由 Apache 基金会开发的 Servlet 容器（Servlet Container），实现了 Java Servlet 和 JavaServer Pages (JSP) 规范，是一个开源的 Web 应用服务器。

## 版本与规范对应

| Tomcat 版本 | Servlet 规范 | JSP 规范 | JDK 版本 |
|-------------|-------------|----------|----------|
| Tomcat 10.1 | 6.0 | 3.1 | >= 21 |
| Tomcat 10.0 | 6.0 | 3.1 | >= 17 |
| Tomcat 9.x | 4.0 | 2.3 | >= 8 |
| Tomcat 8.5 | 3.1 | 2.3 | >= 7 |

## 核心组件

```
Tomcat
  ├── Server          顶层容器，代表整个 Tomcat 实例
  │   └── Service     服务，包含一个或多个 Connector 和一个 Engine
  │       ├── Connector   连接器，处理特定协议的请求（HTTP/AJP）
  │       └── Engine      引擎，处理来自 Connector 的请求
  │           └── Host   虚拟主机
  │               └── Context    Web 应用上下文
  │                   └── Wrapper    Servlet 包装器
```

## 目录结构

```
$CATALINA_HOME/
├── bin/           启动/关闭脚本
├── conf/          配置文件
│   ├── server.xml       主配置文件
│   ├── web.xml          Web 应用默认配置
│   ├── tomcat-users.xml 用户配置
│   └── catalina.policy 安全策略
├── lib/           依赖库
├── logs/          日志目录
├── temp/          临时文件
├── webapps/       部署目录
└── work/          编译缓存（JSP → Servlet）
```

## 安装与配置{#install}

### Linux 安装

```bash
# 下载
wget https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.104/bin/apache-tomcat-9.0.104.tar.gz

# 解压
tar -xzf apache-tomcat-9.0.104.tar.gz -C /opt/

# 设置环境变量
export CATALINA_HOME=/opt/apache-tomcat-9.0.104
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk
```

### systemd 服务配置

创建 `/etc/systemd/system/tomcat.service`：

```ini
[Unit]
Description=Apache Tomcat
After=network.target

[Service]
Type=forking
Environment=JAVA_HOME=/usr/lib/jvm/java-8-openjdk
Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable tomcat
systemctl start tomcat
```

## 常用配置

### 修改端口

编辑 `conf/server.xml`：

```xml
<!-- HTTP 连接器 -->
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />

<!-- AJP 连接器（与 Nginx/IIS 集成时使用） -->
<Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
```

### 虚拟主机配置

```xml
<Host name="www.example.com" appBase="webapps"
      unpackWARs="true" autoDeploy="true">
  <Context path="/app" docBase="/data/app" />
</Host>
```

### 线程池配置

```xml
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
          maxThreads="200" minSpareThreads="25" maxQueueSize="100" />

<Connector port="8080" protocol="HTTP/1.1"
           executor="tomcatThreadPool"
           acceptCount="100"
           maxConnections="10000" />
```

## 部署方式

### 1. 自动部署

将 WAR 文件放入 `webapps/` 目录，Tomcat 自动解压部署。

### 2. 手动部署

```bash
# 使用 manager 应用
curl -u admin:password http://localhost:8080/manager/text/deploy?path=/myapp&war=file:/path/to/app.war

# 热部署（Tomcat 7+）
# 监控 /path/to/ 目录下的 app.war
```

### 3. 配置文件部署

在 `conf/Catalina/localhost/` 下创建 XML 文件：

```xml
<!-- conf/Catalina/localhost/myapp.xml -->
<Context docBase="/data/app" path="/myapp" reloadable="true" />
```

## 与 Nginx 集成

### 方式一：反向代理（HTTP）

```nginx
server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 方式二：AJP 协议（性能更优）

```nginx
# Nginx 需编译时启用 --with-http_ajp_module
location / {
    proxy_pass ajp://127.0.0.1:8009;
}
```

## 性能调优

### JVM 参数

```bash
# catalina.sh 中设置
JAVA_OPTS="-server -Xms2g -Xmx2g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/heapdump.hprof"
```

### Tomcat 调优

```xml
<!-- server.xml -->
<Connector port="8080"
           protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="500"
           minSpareThreads="50"
           maxConnections="10000"
           acceptCount="200"
           connectionTimeout="20000"
           keepAliveTimeout="65000"
           maxKeepAliveRequests="100"
           compression="on"
           compressionMinSize="2048"
           compressibleMimeType="text/html,text/css,text/xml,text/javascript,application/json" />
```

### Linux 内核调优

```bash
# /etc/sysctl.conf
net.ipv4.tcp_max_syn_backlog = 65535
net.core.somaxconn = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535

# 文件描述符
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
```

## 安全加固

### 禁用管理应用

```bash
rm -rf $CATALINA_HOME/webapps/docs
rm -rf $CATALINA_HOME/webapps/examples
rm -rf $CATALINA_HOME/webapps/host-manager
rm -rf $CATALINA_HOME/webapps/manager
```

### 配置安全角色

编辑 `conf/tomcat-users.xml`：

```xml
<tomcat-users>
  <role rolename="manager-gui"/>
  <role rolename="admin-gui"/>
  <user username="admin" password="strong_password" roles="manager-gui,admin-gui"/>
</tomcat-users>
```

### 禁用危险方法

编辑 `conf/web.xml`：

```xml
<security-constraint>
  <web-resource-collection>
    <web-resource-name>Restricted Methods</web-resource-name>
    <url-pattern>/*</url-pattern>
    <http-method>PUT</http-method>
    <http-method>DELETE</http-method>
    <http-method>OPTIONS</http-method>
    <http-method>TRACE</http-method>
  </web-resource-collection>
  <auth-constraint />
</security-constraint>
```

## 常见问题

### Q: 启动时端口被占用？
```bash
# 查看端口占用
netstat -tlnp | grep 8080
lsof -i :8080

# 杀掉占用进程
kill -9 <PID>
```

### Q: 中文乱码如何解决？
```xml
<!-- Connector 配置中添加 URIEncoding -->
<Connector port="8080" URIEncoding="UTF-8" />
```

### Q: 如何查看实时日志？
```bash
tail -f $CATALINA_HOME/logs/catalina.out
tail -f $CATALINA_HOME/logs/localhost_access_log.*.txt
```

### Q: OOM 如何排查？
```bash
# 添加 JVM 参数
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/tmp/heapdump.hprof

# 使用 MAT 或 VisualVM 分析 dump 文件
```

## 参考资料

- [Tomcat 官方网站](https://tomcat.apache.org/)
- [Tomcat 文档](https://tomcat.apache.org/tomcat-9.0-doc/index.html)
- [Apache Tomcat 维基百科](https://zh.wikipedia.org/wiki/Apache_Tomcat)
