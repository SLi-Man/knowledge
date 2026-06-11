# ExifTool 工具

读取和写入文件元素信息

```bash
exiftool [options] [tags] file
```

## Install

```bash
# macOS
brew exiftool
```

## Options

- `-overwrite_original`：直接修改文件不备份
- `-n`：模拟运行
- `-ext`：指定文件类型

## Tags

- `-DateTimeOriginal`：照片原始拍摄时间（常用相册 App 的拍摄时间）
- `-ModifyDate`：照片修改时间
- `-ProfileDateTime`：规范日期时间
- `-MediaCreateDate`：媒体创建时间

## Examples

```bash
# 将照片的拍摄日期设置为照片的修改日期
exiftool "-DateTimeOriginal<ModifyDate" photo.jpg
```

