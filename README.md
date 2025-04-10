# Obsidian 侧边栏增强插件 (Sidebar Enhancer)

![Obsidian侧边栏增强插件](https://img.shields.io/github/v/release/q442333521/obsidian-sidebar-enhancer?style=for-the-badge)
![Obsidian下载量](https://img.shields.io/badge/动态-GitHub-blue?style=for-the-badge)
![协议](https://img.shields.io/github/license/q442333521/obsidian-sidebar-enhancer?style=for-the-badge)

这个Obsidian插件通过以下功能增强了侧边栏:

- **名称显示在图标右侧**: 在侧边栏中以水平布局显示图标和名称
- **自定义按钮名称**: 可以为每个侧边栏按钮指定自定义显示名称
- **调整侧边栏宽度**: 通过拖拽或滑块调整侧边栏的宽度
- **自动检测按钮**: 自动识别所有侧边栏按钮，包括插件添加的按钮

![截图预览](https://raw.githubusercontent.com/q442333521/obsidian-sidebar-enhancer/master/screenshots/settings.png)

## 功能

### 1. 名称显示在图标右侧
插件自动将侧边栏的图标和文本转为水平布局，文本显示在图标右侧，使侧边栏更直观、更易于使用。

### 2. 自定义按钮名称
可以为侧边栏中的每个按钮设置自定义的显示名称，包括:
- 核心功能按钮 (文件、搜索、收藏等)
- 第三方插件添加的按钮
- 自动检测新添加的按钮

### 3. 侧边栏宽度调整
提供多种方式调整侧边栏宽度:
- 通过设置页面的滑块精确调整
- 通过鼠标拖拽侧边栏右侧边缘
- 使用预设宽度按钮(窄、默认、宽、超宽)
- 通过命令面板调整

## 安装

### 从Obsidian插件市场安装
1. 打开Obsidian设置
2. 转到"第三方插件"
3. 禁用"安全模式"
4. 点击"浏览"
5. 搜索"Sidebar Enhancer"
6. 点击安装
7. 安装完成后，启用插件

### 手动安装
1. 下载最新版本的发布包 ([GitHub Releases](https://github.com/q442333521/obsidian-sidebar-enhancer/releases))
2. 解压到您的Obsidian库的 `.obsidian/plugins` 目录
3. 重新启动Obsidian
4. 在Obsidian设置中启用插件

### BRAT安装
1. 安装 [BRAT插件](https://github.com/TfTHacker/obsidian42-brat)
2. 添加beta插件: `q442333521/obsidian-sidebar-enhancer`
3. 启用"侧边栏增强"插件

## 使用指南

### 设置侧边栏宽度
1. 转到插件设置
2. 使用"侧边栏宽度"滑块调整宽度
3. 或者直接用鼠标拖拽侧边栏右侧边缘
4. 使用"宽度预设"快速设置常用宽度

### 自定义按钮名称
1. 转到插件设置
2. 在"按钮名称设置"部分找到想要修改的按钮
3. 在"自定义名称"栏中输入新的名称
4. 名称会自动保存并实时应用
5. 随时可以点击重置按钮恢复原始名称

### 管理按钮
- 使用"重新检测按钮"功能可以刷新侧边栏按钮列表
- 当安装新插件或调整布局后，可以使用此功能更新按钮列表

## 高级功能

### 命令面板集成
插件添加了以下命令:
- `切换侧边栏标签显示`: 快速开启/关闭所有标签
- `增加侧边栏宽度`: 增加10px宽度
- `减小侧边栏宽度`: 减少10px宽度

### 导入/导出设置
- 在设置页面中可以导出当前配置为JSON文件
- 可以导入之前保存的设置或从其他设备同步设置

## 开发

### 构建
```bash
# 克隆仓库
git clone https://github.com/q442333521/obsidian-sidebar-enhancer.git

# 安装依赖
cd obsidian-sidebar-enhancer
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 反馈与贡献

- 如有问题或建议，请[提交Issue](https://github.com/q442333521/obsidian-sidebar-enhancer/issues)
- 欢迎提交Pull Request贡献代码

## 更新日志

### 1.1.0 (2025-04-10)
- 添加自动检测按钮功能
- 改进设置界面，更直观易用
- 添加原始名称显示
- 添加按钮重置功能
- 添加宽度预设

### 1.0.0 (2025-04-09)
- 初始版本发布
- 实现基本的侧边栏名称自定义
- 添加侧边栏宽度调整

## 许可证
[MIT](LICENSE)
