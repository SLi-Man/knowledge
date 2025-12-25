import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "notes",
  title: "SLiMan's Note",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Note', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: '设备折腾 / Device',
        collapsed: false,
        items: [
          { text: '飞牛OS', link: '/Device_Tweaking/fnOS.md' },
          { text: '小米路由器4A 100M', link: '/Device_Tweaking/Mi_Router_4A_100M.md' }
        ]
      },
      {
        text: '网络知识 / Network',
        collapsed: false,
        items: [
          { text: 'DNS', link: '/Network/DNS.md' },
          { text: 'DNSSEC', link: '/Network/DNSSEC.md' },
          { text: '公钥密码学', link: '/Network/PKC.md' }
        ]
      },
      {
        text: '操作系统 / System',
        collapsed: false,
        items: [
          {
            text: 'Linux',
            collapsed: true,
            items: [
              { text: '实用工具', collapsed: true, items: [
                { text: '打包与压缩', link: '/OS/Linux/Utilities/Archive_Compression.md' },
                { text: '正则表达式', link: '/OS/Linux/Utilities/Regex.md' },
                { text: '定时任务', link: '/OS/Linux/Utilities/crontab.md' },
                { text: 'Vim', link: '/OS/Linux/Utilities/Vim.md' },
                { text: 'Git', link: '/OS/Linux/Utilities/Git.md' },
                { text: 'ExifTool', link: '/OS/Linux/Utilities/ExifTool.md' },
              ]},
              { text: '基本命令', link: '/OS/Linux/Basic_Commands.md' },
              { text: '包管理', link: '/OS/Linux/Package_Management.md' },
              { text: '文件系统', link: '/OS/Linux/File_System.md' },
              { text: '用户与权限', link: '/OS/Linux/User_Group_Permission.md' },
              { text: '进程管理', link: '/OS/Linux/Process_Management.md' },
              { text: '磁盘管理', link: '/OS/Linux/Disk_Management.md' },
              { text: '网络配置', link: '/OS/Linux/Network_Configuration.md' },
              { text: '脚本编程', link: '/OS/Linux/Shell_Scripting.md' },
              { text: '服务管理', link: '/OS/Linux/Systemd_Service.md' },
              { text: '日志管理', link: '/OS/Linux/Log_Management.md' },
	      { text: '磁盘管理', link: '/OS/Linux/Disk_Management.md' },
              { text: '系统优化', link: '/OS/Linux/System_Optimization_Security.md' },
              { text: '性能监控', link: '/OS/Linux/Performance_Monitoring.md' },
              { text: '面试题', link: '/OS/Linux/Interview_Questions.md' }
          ]},
          { text: 'MacOS', link: '/OS/MacOS.md' },
          { text: 'Ubuntu', link: '/OS/Ubuntu.md' }
        ]
      },
      {
        text: '摄影 / Shoot',
        collapsed: false,
        items: [
          { text: '摄影基础', link: '/Shoot/basicas.md' },
          { text: '器材选购', link: '/Shoot/purchase.md' },
          { text: '使用相机', link: '/Shoot/useCamera.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
})
