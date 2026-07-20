import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  srcDir: "notes",
  title: "SLiMan's Notes",
  description: "技术笔记与学习记录",
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  mermaid: {
    theme: {
      light: 'default',
      dark: 'dark'
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记', link: '/markdown-examples' },
      { text: '关于', link: '/about' }
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
        text: '硬件选购 / Hardware',
        collapsed: true,
        items: [
          { text: '硬盘选购', link: '/Hardware/Hard_Drive_Selection.md' }
        ]
      },
      {
        text: '网络知识 / Network',
        collapsed: false,
        items: [
          { text: 'DNS', link: '/Network/DNS.md' },
          { text: 'TCP/IP', link: '/Network/TCP_IP.md' }
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
                { text: '打包与压缩', link: '/System/Linux/Utilities/Archive_Compression.md' },
                { text: '正则表达式', link: '/System/Linux/Utilities/Regex.md' },
                { text: '定时任务', link: '/System/Linux/Utilities/crontab.md' },
                { text: 'Vim', link: '/System/Linux/Utilities/Vim.md' },
                { text: 'ExifTool', link: '/System/Linux/Utilities/ExifTool.md' },
              ]},
              { text: '基本命令', link: '/System/Linux/Basic_Commands.md' },
              { text: '包管理', link: '/System/Linux/Package_Management.md' },
              { text: '文件系统', link: '/System/Linux/File_System.md' },
              { text: '用户与权限', link: '/System/Linux/User_Group_Permission.md' },
              { text: '进程管理', link: '/System/Linux/Process_Management.md' },
              { text: '磁盘管理', link: '/System/Linux/Disk_Management.md' },
              { text: '网络配置', link: '/System/Linux/Network_Configuration.md' },
              { text: '脚本编程', link: '/System/Linux/Shell_Scripting.md' },
              { text: '服务管理', link: '/System/Linux/Systemd_Service.md' },
              { text: '日志管理', link: '/System/Linux/Log_Management.md' },
              { text: '系统优化', link: '/System/Linux/System_Optimization_Security.md' },
              { text: '性能监控', link: '/System/Linux/Performance_Monitoring.md' },
              { text: '远程管理', link: '/System/Linux/Remote_Access.md' },
              { text: '内核模块', link: '/System/Linux/Kernel_Modules.md' },
              { text: '面试题', link: '/System/Linux/Interview_Questions.md' }
          ]},
          { text: 'MacOS', link: '/System/MacOS.md' },
          { text: 'Windows', link: '/System/Windows.md' },
          { text: 'Ubuntu', link: '/System/Ubuntu.md' },
          { text: 'CentOS', link: '/System/CentOS.md' },
          
        ]
      },
      {
        text: '基础设施 / Infrastructure',
        collapsed: true,
        items: [
          { text: 'Rsync', link: '/Infrastructure/Rsync.md' },
          { text: 'Nginx', link: '/Infrastructure/Nginx.md' }
          
        ]
      },
      {
        text: '自动化运维 / Automation',
        collapsed: true,
        items: [
          { text: 'Git', link: '/Automation/Git.md' }
          
        ]
      },
      {
        text: '容器与云原生 / Cloud Native',
        collapsed: true,
        items: [
          
          
        ]
      },
      {
        text: '数据库 / Database',
        collapsed: true,
        items: [
          
          
        ]
      },
      {
        text: '消息队列 / MQ',
        collapsed: true,
        items: [
          
          
        ]
      },
      {
        text: '监控与可观测性 / Observability',
        collapsed: true,
        items: [
          
          
        ]
      },
      {
        text: '存储 / Storage',
        collapsed: true,
        items: [
          { text: 'NFS', link: '/Storage/NFS.md' }
          
        ]
      },
      {
        text: '安全 / Security',
        collapsed: true,
        items: [
          { text: '公钥密码学', link: '/Security/PKC.md' }
          
        ]
      },
      {
        text: '项目 / Projects',
        collapsed: true,
        items: [
          { text: 'LNMP', link: '/Projects/LNMP.md' }
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
      },
    ],
    outline: {
      level: [2, 3]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SLi-Man' }
    ]
  },
})
