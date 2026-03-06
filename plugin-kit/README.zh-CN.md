# Plugin Kit

[English](README.md) | [简体中文](README.zh-CN.md)

这个 starter kit 现在已经是一个跨 IDE + CLI 的分发包。

## 支持的适配层

- `core/`：共享本地桥接服务
- `vscode/`：发布为 `.vsix` 的 VS Code 兼容适配器
- `jetbrains/`：发布为插件 zip 的 JetBrains 适配器
- `cli/`：通过 npm 分发的通用命令行适配器

## 可直接下载渠道

- VS Code Marketplace
- Open VSX
- JetBrains Marketplace
- npm 注册表（CLI 用户）
- GitHub Releases（直接下载产物）

## CI 构建

上传到 GitHub 后，运行 `.github/workflows/build-plugins.yml` 可以构建编辑器产物。
CLI 适配器单独通过 npm 发布。

## 建议继续阅读

- `distribution.md`
- `distribution.zh-CN.md`
- `protocol.md`
