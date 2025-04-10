const { Plugin, Setting, Notice, PluginSettingTab } = require('obsidian');

class SidebarEnhancerPlugin extends Plugin {
    settings = {
        sidebarWidth: 180,
        buttonNames: {},
        showButtonLabels: true,
        detectedButtons: []
    };

    async onload() {
        console.log('加载侧边栏增强插件');
        
        await this.loadSettings();

        // 添加设置选项卡
        this.addSettingTab(new SidebarEnhancerSettingTab(this.app, this));

        // 应用侧边栏宽度
        this.applySidebarWidth();

        // 监听布局变化，确保在界面变化时重新应用设置
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                if (this.settings.showButtonLabels) {
                    setTimeout(() => {
                        this.detectAllButtons();
                        this.applyButtonNames();
                    }, 500);
                }
            })
        );

        // 添加侧边栏宽度调整器
        this.app.workspace.onLayoutReady(() => {
            this.addSidebarResizer();
            this.detectAllButtons();
            
            if (this.settings.showButtonLabels) {
                this.applyButtonNames();
            }
        });

        // 添加命令
        this.addCommand({
            id: 'toggle-sidebar-labels',
            name: '切换侧边栏标签显示',
            callback: () => {
                this.settings.showButtonLabels = !this.settings.showButtonLabels;
                this.saveSettings();
                
                if (this.settings.showButtonLabels) {
                    this.applyButtonNames();
                    new Notice('侧边栏标签已显示');
                } else {
                    this.removeButtonNames();
                    new Notice('侧边栏标签已隐藏');
                }
            }
        });

        this.addCommand({
            id: 'increase-sidebar-width',
            name: '增加侧边栏宽度',
            callback: () => {
                if (this.settings.sidebarWidth < 300) {
                    this.settings.sidebarWidth += 10;
                    this.applySidebarWidth();
                    this.saveSettings();
                }
            }
        });

        this.addCommand({
            id: 'decrease-sidebar-width',
            name: '减小侧边栏宽度',
            callback: () => {
                if (this.settings.sidebarWidth > 80) {
                    this.settings.sidebarWidth -= 10;
                    this.applySidebarWidth();
                    this.saveSettings();
                }
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, {
            sidebarWidth: 180,
            showButtonLabels: true,
            buttonNames: {
                'file-explorer': '文件',
                'search': '搜索',
                'starred': '收藏',
                'graph-view': '图谱',
                'calendar': '日历',
                'templates': '模板',
                'command-palette': '命令',
                'backlink': '反链',
                'tag-pane': '标签',
                'outline': '大纲',
                'bookmarks': '书签'
            },
            detectedButtons: []
        }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    applySidebarWidth() {
        document.documentElement.style.setProperty('--sidebar-width', this.settings.sidebarWidth + 'px');
    }

    // 检测所有现有按钮
    detectAllButtons() {
        // 获取左侧边栏所有按钮
        const buttons = document.querySelectorAll('.workspace-ribbon.mod-left .side-dock-ribbon-action, .workspace-ribbon.mod-left .side-dock-ribbon-tab, .workspace-ribbon.mod-left [data-type]');
        let detectedButtons = [];
        
        buttons.forEach(button => {
            // 尝试从按钮的data-type属性获取按钮标识符
            const buttonType = button.getAttribute('data-type');
            // 获取按钮的aria-label或tooltip
            let ariaLabel = button.getAttribute('aria-label') || button.getAttribute('data-tooltip') || '';
            // 尝试从class名称中获取标识符
            let classNames = Array.from(button.classList);
            let iconClass = classNames.find(cls => cls.startsWith('plugin-') || cls.startsWith('mod-') || cls.startsWith('sidebar-'));
            
            // 如果找到有效标识符
            if (buttonType || ariaLabel || iconClass) {
                // 格式化显示名称
                let displayName = this.formatButtonLabel(ariaLabel);
                
                // 检查是否已存在这个按钮
                const existingButton = detectedButtons.find(btn => 
                    (buttonType && btn.id === buttonType) || 
                    (ariaLabel && btn.ariaLabel === ariaLabel) ||
                    (iconClass && btn.iconClass === iconClass)
                );
                
                if (!existingButton) {
                    detectedButtons.push({
                        id: buttonType || '',
                        ariaLabel: ariaLabel,
                        iconClass: iconClass || '',
                        originalName: displayName,
                        element: button
                    });
                }
            }
        });
        
        // 更新设置中的检测到的按钮列表
        let hasNewButtons = false;
        detectedButtons.forEach(newBtn => {
            const existing = this.settings.detectedButtons.find(btn => 
                (newBtn.id && btn.id === newBtn.id) || 
                (newBtn.ariaLabel && btn.ariaLabel === newBtn.ariaLabel) ||
                (newBtn.iconClass && btn.iconClass === newBtn.iconClass)
            );
            
            if (!existing) {
                this.settings.detectedButtons.push(newBtn);
                hasNewButtons = true;
            }
        });
        
        if (hasNewButtons) {
            this.saveSettings();
        }
        
        return detectedButtons;
    }
    
    // 格式化按钮标签
    formatButtonLabel(label) {
        if (!label) return '';
        
        // 移除常见前缀
        const prefixes = ['Open ', 'Toggle ', 'Show ', '打开', '切换', '显示'];
        for (const prefix of prefixes) {
            if (label.startsWith(prefix)) {
                label = label.substring(prefix.length);
                break;
            }
        }
        
        // 处理包含冒号的标签
        if (label.indexOf(':') > 0) {
            label = label.split(':')[0].trim();
        }
        
        return label;
    }

    removeButtonNames() {
        const buttons = document.querySelectorAll('.workspace-ribbon.mod-left .side-dock-ribbon-action, .workspace-ribbon.mod-left .side-dock-ribbon-tab');
        
        buttons.forEach(button => {
            const textElement = button.querySelector('.custom-sidebar-button-text');
            if (textElement) {
                textElement.remove();
            }
        });
    }

    applyButtonNames() {
        // 先清除所有自定义文本
        this.removeButtonNames();
        
        if (!this.settings.showButtonLabels) {
            return;
        }
        
        // 获取左侧边栏所有按钮
        const buttons = document.querySelectorAll('.workspace-ribbon.mod-left .side-dock-ribbon-action, .workspace-ribbon.mod-left .side-dock-ribbon-tab, .workspace-ribbon.mod-left [data-type]');
        
        buttons.forEach(button => {
            // 获取按钮标识符
            const buttonType = button.getAttribute('data-type');
            const ariaLabel = button.getAttribute('aria-label') || button.getAttribute('data-tooltip') || '';
            let classNames = Array.from(button.classList);
            let iconClass = classNames.find(cls => cls.startsWith('plugin-') || cls.startsWith('mod-') || cls.startsWith('sidebar-'));
            
            // 尝试查找这个按钮的自定义名称
            let customName = null;
            
            // 1. 先从buttonNames中查找
            if (buttonType && this.settings.buttonNames[buttonType]) {
                customName = this.settings.buttonNames[buttonType];
            }
            
            // 2. 如果没找到，从detectedButtons中查找
            if (!customName) {
                const detectedButton = this.settings.detectedButtons.find(btn => 
                    (buttonType && btn.id === buttonType) || 
                    (ariaLabel && btn.ariaLabel === ariaLabel) ||
                    (iconClass && btn.iconClass === iconClass)
                );
                
                if (detectedButton && detectedButton.customName) {
                    customName = detectedButton.customName;
                } else if (detectedButton) {
                    customName = detectedButton.originalName;
                }
            }
            
            // 3. 如果仍没找到，使用aria-label
            if (!customName && ariaLabel) {
                customName = this.formatButtonLabel(ariaLabel);
            }
            
            // 添加自定义文本
            if (customName) {
                this.addButtonText(button, customName);
            }
        });
    }
    
    // 为按钮添加文本标签
    addButtonText(button, text) {
        // 创建文本元素
        const textElement = document.createElement('span');
        textElement.className = 'custom-sidebar-button-text';
        textElement.textContent = text;
        
        // 添加到按钮
        button.appendChild(textElement);
    }

    addSidebarResizer() {
        const sidebar = document.querySelector('.workspace-ribbon.mod-left');
        if (sidebar) {
            // 创建调整器元素
            const resizer = document.createElement('div');
            resizer.className = 'sidebar-width-adjuster';
            sidebar.appendChild(resizer);
            
            let startX, startWidth;
            
            // 鼠标按下事件
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startX = e.clientX;
                startWidth = this.settings.sidebarWidth;
                
                // 添加鼠标移动和鼠标松开事件监听器
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                
                // 添加拖动时的视觉指示
                document.body.classList.add('sidebar-resizing');
            });
            
            // 调整大小函数
            const resize = (e) => {
                const width = startWidth + (e.clientX - startX);
                if (width >= 80 && width <= 300) {
                    this.settings.sidebarWidth = width;
                    this.applySidebarWidth();
                }
            };
            
            // 停止调整大小函数
            const stopResize = () => {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
                document.body.classList.remove('sidebar-resizing');
                
                // 保存设置
                this.saveSettings();
            };
        }
    }

    onunload() {
        console.log('卸载侧边栏增强插件');
        
        // 清理插件资源
        document.documentElement.style.removeProperty('--sidebar-width');
        const resizer = document.querySelector('.sidebar-width-adjuster');
        if (resizer) resizer.remove();
        
        // 移除所有自定义文本
        this.removeButtonNames();
    }
}

class SidebarEnhancerSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        
        containerEl.addClass('sidebar-enhancer-settings');

        // 标题和描述
        containerEl.createEl('h1', { text: '侧边栏增强设置' });
        containerEl.createEl('p', { text: '自定义Obsidian侧边栏的外观和行为，让您的工作区更符合个人习惯。' });

        // 创建主设置区块
        this.createGeneralSettings(containerEl);
        this.createButtonSettings(containerEl);
        this.createAdvancedSettings(containerEl);
    }
    
    createGeneralSettings(containerEl) {
        const generalSection = containerEl.createEl('div', { cls: 'setting-section' });
        
        generalSection.createEl('h2', { text: '常规设置' });
        
        // 显示按钮标签开关
        new Setting(generalSection)
            .setName('显示按钮标签')
            .setDesc('在侧边栏图标旁边显示文本标签')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showButtonLabels)
                .onChange(async (value) => {
                    this.plugin.settings.showButtonLabels = value;
                    
                    if (value) {
                        this.plugin.applyButtonNames();
                    } else {
                        this.plugin.removeButtonNames();
                    }
                    
                    await this.plugin.saveSettings();
                })
            );

        // 侧边栏宽度设置
        new Setting(generalSection)
            .setName('侧边栏宽度')
            .setDesc('调整左侧边栏的宽度（像素）')
            .addSlider(slider => slider
                .setLimits(80, 300, 1)
                .setValue(this.plugin.settings.sidebarWidth)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.sidebarWidth = value;
                    this.plugin.applySidebarWidth();
                    await this.plugin.saveSettings();
                })
            )
            .addExtraButton(button => button
                .setIcon('reset')
                .setTooltip('重置为默认值 (180px)')
                .onClick(async () => {
                    this.plugin.settings.sidebarWidth = 180;
                    this.plugin.applySidebarWidth();
                    await this.plugin.saveSettings();
                    this.display(); // 刷新设置界面
                })
            );
            
        // 宽度快捷按钮
        const widthButtons = generalSection.createEl('div', { cls: 'sidebar-width-presets' });
        widthButtons.createEl('span', { text: '宽度预设：' });
        
        const presets = [
            { width: 60, label: '窄' },
            { width: 80, label: '默认' },
            { width: 100, label: '宽' },
            { width: 150, label: '超宽' }
        ];
        
        presets.forEach(preset => {
            const btn = widthButtons.createEl('button', { 
                text: preset.label,
                cls: 'sidebar-width-preset-button'
            });
            
            if (preset.width === this.plugin.settings.sidebarWidth) {
                btn.addClass('active');
            }
            
            btn.addEventListener('click', async () => {
                this.plugin.settings.sidebarWidth = preset.width;
                this.plugin.applySidebarWidth();
                await this.plugin.saveSettings();
                this.display(); // 刷新设置界面
            });
        });
    }
    
    createButtonSettings(containerEl) {
        // 重新检测按钮
        this.plugin.detectAllButtons();
        
        const buttonSection = containerEl.createEl('div', { cls: 'setting-section' });
        
        buttonSection.createEl('h2', { text: '按钮名称设置' });
        buttonSection.createEl('p', { text: '自定义侧边栏按钮的显示名称。' });
        
        // 刷新按钮
        const refreshBar = buttonSection.createEl('div', { cls: 'refresh-buttons-bar' });
        const refreshButton = refreshBar.createEl('button', { 
            text: '重新检测按钮',
            cls: 'refresh-buttons'
        });
        refreshButton.addEventListener('click', () => {
            this.plugin.detectAllButtons();
            new Notice('已重新检测侧边栏按钮');
            this.display(); // 刷新设置界面
        });
        
        // 按钮列表
        const buttonContainer = buttonSection.createEl('div', { cls: 'button-list' });
        
        // 表头
        const headerRow = buttonContainer.createEl('div', { cls: 'button-row header' });
        headerRow.createEl('div', { text: '原始名称', cls: 'button-original-name' });
        headerRow.createEl('div', { text: '自定义名称', cls: 'button-custom-name' });
        
        // 按钮列表
        const allButtons = [];
        
        // 添加检测到的按钮
        this.plugin.settings.detectedButtons.forEach(button => {
            if (!allButtons.some(b => 
                (button.id && b.id === button.id) || 
                (button.ariaLabel && b.ariaLabel === button.ariaLabel)
            )) {
                allButtons.push(button);
            }
        });
        
        // 添加按钮设置到UI
        allButtons.forEach(button => {
            // 创建按钮行
            const buttonRow = buttonContainer.createEl('div', { cls: 'button-row' });
            
            // 原始名称
            const originalNameEl = buttonRow.createEl('div', { cls: 'button-original-name' });
            originalNameEl.createEl('span', { text: button.originalName || button.ariaLabel || button.id || '未知按钮' });
            
            // 显示ID或标识符(小字)
            if (button.id) {
                originalNameEl.createEl('span', { text: button.id, cls: 'button-id' });
            }
            
            // 自定义名称输入框
            const customNameEl = buttonRow.createEl('div', { cls: 'button-custom-name' });
            const input = customNameEl.createEl('input', {
                type: 'text',
                cls: 'button-custom-name-input',
                placeholder: '输入自定义名称'
            });
            
            // 设置初始值
            if (button.id && this.plugin.settings.buttonNames[button.id]) {
                input.value = this.plugin.settings.buttonNames[button.id];
            } else if (button.customName) {
                input.value = button.customName;
            }
            
            // 输入事件
            input.addEventListener('change', async () => {
                const customName = input.value.trim();
                
                // 根据按钮ID存储自定义名称
                if (button.id) {
                    if (customName) {
                        this.plugin.settings.buttonNames[button.id] = customName;
                    } else {
                        delete this.plugin.settings.buttonNames[button.id];
                    }
                }
                
                // 同时在detectedButtons中更新
                const detectedButton = this.plugin.settings.detectedButtons.find(btn => 
                    (button.id && btn.id === button.id) || 
                    (button.ariaLabel && btn.ariaLabel === button.ariaLabel) ||
                    (button.iconClass && btn.iconClass === button.iconClass)
                );
                
                if (detectedButton) {
                    if (customName) {
                        detectedButton.customName = customName;
                    } else {
                        delete detectedButton.customName;
                    }
                }
                
                // 保存设置并应用更改
                await this.plugin.saveSettings();
                this.plugin.applyButtonNames();
                
                new Notice('按钮名称已更新');
            });
            
            // 重置按钮
            const resetBtn = customNameEl.createEl('button', {
                cls: 'button-reset',
                attr: { 'aria-label': '重置为原始名称' }
            });
            resetBtn.innerHTML = '↺';
            resetBtn.addEventListener('click', async () => {
                input.value = '';
                
                // 删除自定义名称
                if (button.id) {
                    delete this.plugin.settings.buttonNames[button.id];
                }
                
                // 更新detectedButtons
                const detectedButton = this.plugin.settings.detectedButtons.find(btn => 
                    (button.id && btn.id === button.id) || 
                    (button.ariaLabel && btn.ariaLabel === button.ariaLabel) ||
                    (button.iconClass && btn.iconClass === button.iconClass)
                );
                
                if (detectedButton) {
                    delete detectedButton.customName;
                }
                
                // 保存设置并应用更改
                await this.plugin.saveSettings();
                this.plugin.applyButtonNames();
                
                new Notice('已重置为原始名称');
            });
        });
        
        // 如果没有检测到按钮
        if (allButtons.length === 0) {
            buttonContainer.createEl('div', { 
                text: '未检测到侧边栏按钮。请先打开Obsidian主界面，然后点击"重新检测按钮"。',
                cls: 'no-buttons-message'
            });
        }
    }
    
    createAdvancedSettings(containerEl) {
        const advancedSection = containerEl.createEl('div', { cls: 'setting-section' });
        
        advancedSection.createEl('h2', { text: '高级设置' });
        
        // 导出设置
        new Setting(advancedSection)
            .setName('导出设置')
            .setDesc('将当前所有设置导出为JSON文件')
            .addButton(button => button
                .setButtonText('导出')
                .onClick(() => {
                    const dataStr = JSON.stringify(this.plugin.settings, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    
                    // 创建下载链接
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(dataBlob);
                    downloadLink.download = 'obsidian-sidebar-enhancer-settings.json';
                    
                    // 点击链接启动下载
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    new Notice('设置已导出');
                })
            );
            
        // 导入设置
        const importSetting = new Setting(advancedSection)
            .setName('导入设置')
            .setDesc('从JSON文件导入设置');
            
        // 创建文件输入控件
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        // 添加选择文件按钮
        importSetting.addButton(button => button
            .setButtonText('选择文件')
            .onClick(() => {
                fileInput.click();
            })
        );
        
        // 文件选择事件处理
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    
                    // 验证导入的数据
                    if (!importedSettings.buttonNames || typeof importedSettings.sidebarWidth !== 'number') {
                        new Notice('导入的文件格式无效');
                        return;
                    }
                    
                    // 应用导入的设置
                    this.plugin.settings = importedSettings;
                    this.plugin.applySidebarWidth();
                    this.plugin.applyButtonNames();
                    await this.plugin.saveSettings();
                    
                    // 刷新设置界面
                    this.display();
                    
                    new Notice('设置已导入');
                } catch(err) {
                    console.error('导入设置失败:', err);
                    new Notice('导入设置失败: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
        
        importSetting.settingEl.appendChild(fileInput);
        
        // 重置所有设置
        new Setting(advancedSection)
            .setName('重置所有设置')
            .setDesc('将所有设置恢复为默认值')
            .addButton(button => button
                .setButtonText('重置')
                .setWarning()
                .onClick(async () => {
                    // 确认对话框
                    if (confirm('确定要重置所有设置吗？此操作无法撤销。')) {
                        // 重置为默认设置
                        this.plugin.settings = {
                            sidebarWidth: 180,
                            showButtonLabels: true,
                            buttonNames: {
                                'file-explorer': '文件',
                                'search': '搜索',
                                'starred': '收藏',
                                'graph-view': '图谱',
                                'calendar': '日历',
                                'templates': '模板',
                                'command-palette': '命令'
                            },
                            detectedButtons: []
                        };
                        
                        // 应用新设置
                        this.plugin.applySidebarWidth();
                        this.plugin.applyButtonNames();
                        await this.plugin.saveSettings();
                        
                        // 刷新设置界面
                        this.display();
                        
                        new Notice('所有设置已重置为默认值');
                    }
                })
            );
            
        // 添加关于信息
        const aboutDiv = advancedSection.createEl('div', { cls: 'about-section' });
        aboutDiv.createEl('h3', { text: '关于插件' });
        aboutDiv.createEl('p', { text: '侧边栏增强插件 v1.1.0' });
        aboutDiv.createEl('p', { text: '自动检测侧边栏按钮并允许自定义显示名称' });
    }
}

module.exports = SidebarEnhancerPlugin;