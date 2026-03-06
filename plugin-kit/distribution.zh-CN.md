# 发布设计

## 适配器家族

### 1. VS Code 兼容家族

发布一套支持 VS Code 扩展模型的适配器。
典型分发方式：

- VS Code Marketplace
- Open VSX
- GitHub Releases 直接下载 `.vsix`

### 2. JetBrains 家族

发布一套 IntelliJ Platform 插件。
典型分发方式：

- JetBrains Marketplace
- GitHub Releases 直接下载插件 zip

### 3. CLI 家族

发布一套基于 Node 的命令行适配器，供任何能执行本地命令的环境使用。
典型分发方式：

- npm 注册表
- GitHub Releases 直接下载 tarball

这才是广泛支持 CLI 的现实方案，而不是给每个 shell 单独造插件。

## 支持直接下载的策略

1. 每个家族一个独立目录
2. 每个家族维护自己的包元数据
3. 每个家族单独产出安装包
4. 同时发布到官方市场和 GitHub Releases

## 打包命令

### VS Code 兼容适配器

```bash
cd plugin-kit/vscode
npm install
npm run package
```

### JetBrains 适配器

```bash
cd plugin-kit/jetbrains
gradle buildPlugin
```

### CLI 适配器

```bash
cd plugin-kit/cli
npm pack
npm publish
```
