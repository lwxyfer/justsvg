<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/justsvg-wordmark-inverse.svg" />
    <img src="public/brand/justsvg-wordmark.svg" alt="JustSVG" width="285" height="86" />
  </picture>
</p>

<h1 align="center">JustSVG</h1>

<p align="center">
  <strong>Just diagrams. Just SVG.</strong><br />
  以原生 SVG 为核心的 draw.io 开源替代方案。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2855ee" alt="MIT 许可" /></a>
  <img src="https://img.shields.io/badge/status-beta-53627b" alt="Beta 版本" />
</p>

<p align="center">
  <a href="https://justsvg.vercel.app/">在线体验</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#svg-diagram-skill">SVG Skill</a> ·
  <a href="#风格与示例">风格与示例</a> ·
  <a href="#参与贡献">参与贡献</a> ·
  <a href="README.md">English</a>
</p>

JustSVG 由浏览器中的 SVG 编辑器和 SVG Diagram Skill 组成。用自己的 AI 工具生成架构图、流程图和信息图，或从可编辑的示例开始，再用编辑器修改细节，导出保留文字、图形和分组的标准 SVG。

![JustSVG 编辑器：可编辑架构图、插入素材库与属性面板](docs/images/editor.png)

## SVG Skill + 编辑器

| 组件                  | 用途                                                                | 入口                             |
| --------------------- | ------------------------------------------------------------------- | -------------------------------- |
| **SVG Diagram Skill** | 把画图任务和视觉参照交给 AI，得到原生 SVG、完整生成指令和检查记录。 | [使用 Skill](#svg-diagram-skill) |
| **SVG 编辑器**        | 打开 SVG，改文字、拖节点、调样式和连线，保存后可以继续编辑。        | [打开编辑器](https://justsvg.vercel.app/editor) |

Skill 可以脱离编辑器独立使用。网页负责准备指令与编辑文件，图稿生成在你的 AI 工具中完成。

## 核心能力

- **原生 SVG 编辑**：保留文字、图形、分组、渐变与内部引用，也可以查看和修改 SVG 源码。
- **节点与连线联动**：已关联的直线和箭头跟随节点移动、缩放与对齐；导入的图稿可在编辑器中建立关联。
- **从风格开始**：169 份可编辑示例、66 种风格，其中包含 39 个品牌灵感研究。每份示例都有可复用的生成指令。
- **按岗位选示例**：产品、财务、运营与项目协作入口涵盖 12 个业务主题，每个主题提供两种风格。利润瀑布图与预算对比图支持修改数据、同步更新图形和合计，并可撤销。详见[岗位业务示例](docs/BUSINESS_EXAMPLES.md)。
- **复用图形与组件**：插入 24 个组合模板、常用 Diagram 图形、内置 Lucide 图标，或自己的 SVG 组件。
- **本地优先**：无需账号或后端。编辑器保存浏览器内的恢复副本，长期保存与分享使用导出的 SVG 文件。
- **原生 SVG 动效**：为连线添加流动效果，为对象配置透明度动效；可导出动态或静态 SVG。

## 快速开始

本地启动步骤见[开发指南](development.md#local-development)。

编辑第一张图：

1. 打开一个示例，拖入 `.svg` 文件，或粘贴 SVG 源码。
2. 双击文字修改内容，拖动或缩放节点，调整颜色与布局。
3. 导出 SVG，在浏览器中打开，或重新导入继续编辑。

快捷键、分组、连线关联、动效和文件恢复见 [编辑器使用指南](docs/EDITOR_GUIDE.zh-CN.md)。

## SVG Diagram Skill

在支持读取本地文件的 AI 工具中，从当前仓库给出任务：

```text
请读取 skills/svg-diagram/SKILL.md。

绘制一张可编辑的 SVG 架构图：
- 客户端 → API → 队列 → Worker
- API → 数据库

采用清晰的技术文档风格，保留可编辑的文字和分组。
输出 SVG、完整生成指令和检查记录。
```

需要长期使用时，将整个 `skills/svg-diagram/` 目录安装到 AI 工具支持的技能目录中，保留全部参考、脚本、示例与许可文件。具体步骤见 [安装与使用说明](skills/svg-diagram/README.md)。

Skill 包含生成指令模板、SVG 约定、结构检查、浏览器检查，以及架构图和流程图试用示例。验证脚本有独立的依赖要求，见 [验证指南](skills/svg-diagram/references/validation.md)。

## 风格与示例

对比同一张 RAG 架构图的不同品牌构图，再打开示例编辑，或复用对应的生成指令。

![横向拨动品牌 SVG 图稿封套，对比不同风格](docs/images/brand-style-flip.gif)

示例库还覆盖系统架构、部署架构、泳道图、时序图、实体关系图、信息图、数据流图和路线图。五种基础呈现可以对比同一内容的不同视觉风格。

品牌研究是 JustSVG 根据公开视觉参照制作的原创示例，并非品牌官方模板。生成指令记录了来源与适配说明，见 [品牌研究](docs/BRAND_EXAMPLES.md)。

<details>
<summary>查看示例库界面</summary>

![JustSVG 示例库：可搜索的 SVG 图稿预览](docs/images/examples.png)

</details>

## 当前状态与边界

当前版本：**1.0.0-beta.1**。

- 已支持 SVG 导入、编辑、导出与重新导入，暂不读取 `.drawio` 工程文件。
- 首页、编辑器和示例库支持中英切换，默认英文。
- 编辑器面向桌面浏览器。
- 当前未提供连线避障、全图自动布局、钢笔与复杂路径节点绘制、云端协作。
- 浏览器恢复会保留图稿与视图，刷新后不恢复撤销历史。请导出文件用于长期保存。
- SVG 导入会进行安全清理，脚本、外部资源及不支持的特性可能被移除；复杂第三方 SVG 存在兼容边界。

完整说明见 [编辑器兼容性](docs/EDITOR_GUIDE.zh-CN.md#安全与兼容性)。

## 文档

| 指南                                              | 内容                                |
| ------------------------------------------------- | ----------------------------------- |
| [编辑器使用指南](docs/EDITOR_GUIDE.zh-CN.md)      | 编辑、快捷键、文件恢复与 SVG 兼容性 |
| [SVG Diagram Skill](skills/svg-diagram/README.md) | 安装、生成指令、示例与验证          |
| [组合模板](docs/COMPOSITE_TEMPLATES.md)           | 架构、流程与组件的复用              |
| [品牌研究](docs/BRAND_EXAMPLES.md)                | 视觉参照、构图与来源说明            |
| [工作图形](docs/WORKPLACE_EXAMPLES.md)            | 八类图形与基础风格变体              |

## 参与贡献

欢迎提交缺陷报告、SVG 兼容案例、图稿示例与文档改进。

[报告问题](https://github.com/lwxyfer/justsvg/issues/new) · [开发与贡献指南](development.md)

## 许可

JustSVG 源代码采用 [MIT](LICENSE)。图标、字体和其他依赖保留各自许可，详见 [第三方许可](docs/THIRD_PARTY.md)。
