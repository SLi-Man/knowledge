# Linux

## 网卡配置和 `resolv.conf` 的关联

1. 如果网卡中配置了 DNS，重启系统网卡会覆盖 resolv.conf
2. 如果网卡中不配置 DNS，则不会覆盖 resolv.conf
