# 飞牛 OS

## 应用商城 HomeAssistant 手动更新

1. 打开docker的compose找到docker-home-assistantan点击停止
2. 在容器中删除assistantan（放心你的数据还在）
3. 在compose的yaml配置中把image改为 "ghcr.nju.edu.cn/home-assistant/home-assistant:stable"
4. 重新运行，将自动下载镜像并启动

## 相关链接

[官方应用商店里的HomeAssistant无法运行米家HA插件怎么办？如何更新](https://club.fnnas.com/forum.php?mod=viewthread&tid=8470)
