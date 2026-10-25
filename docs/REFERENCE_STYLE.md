# 基础·技术文档：用户参考风格

这套视觉规则来自用户提供的两张技术图：sandbox-runtime 总体分层架构，以及 Linux 进程与命名空间拓扑和挂载层。两张图共享同一风格，因此注册为「基础·技术文档」，而不是按内容拆成两种风格。

## 已交付内容

| 内容                   | 示例 ID                                | 原生画布  | 节点 / 关联线 |
| ---------------------- | -------------------------------------- | --------- | ------------- |
| 总体分层架构复刻       | `reference-sandbox-overview`           | 1648×988  | 21 / 26       |
| Linux 拓扑复刻         | `reference-linux-topology`             | 1648×1048 | 23 / 17       |
| 同图风格：高密度 SaaS  | `base-reference-dense-platform`        | 1600×1100 | 38 / 30       |
| 同图风格：三层系统     | `base-reference-layered-platform`      | 1200×800  | 9 / 8         |
| 同图风格：发布流程     | `base-reference-release-flow`          | 1400×900  | 10 / 10       |
| 同图风格：请求可观测性 | `base-reference-request-observability` | 1400×900  | 12 / 5        |

Example 页面通过推荐入口「基础·技术文档」打开两张复刻图，下拉选择其他内容。四套公共内容均可使用「同图风格」在标准、黑白线框、分区白卡、深色工程、技术文档间比较；文字内容、节点几何与连接关系相同，文字按各自风格排版。两张参考图有独立内容，不虚构同图配对。

每份图都有完整、可复制的 Prompt 和可编辑源码。点击「在编辑器中打开」新增图稿，或直接下载标准 SVG；不会覆盖现有工作区和本地示例版本。

## 提取的视觉规则

配色采样自参考图内部的平坦区域，边界抗锯齿和 JPEG 压缩不作为精确颜色依据。

| 角色            | 填充      | 深色边线  |
| --------------- | --------- | --------- |
| 纸面            | `#fdfdfd` | —         |
| 中性节点        | `#f0f1f3` | `#6b7178` |
| 管理 / 控制     | `#edeafd` | `#6d28d9` |
| 路径 / 平台 IR  | `#e5ecfc` | `#2451c4` |
| 后端 / 挂载     | `#d2f5ee` | `#14786b` |
| 配置 / 初始化   | `#fbead0` | `#80600c` |
| 代理 / 网络     | `#fce8dd` | `#984d0b` |
| 告警 / 受限命令 | `#fde8e5` | `#b60029` |
| 沙箱输出        | `#def4dd` | `#26721c` |

标题和节点标题采用深灰黑色、700 字重；节点标题与正文居中，分区标题左对齐。节点通常为 2px 边线和 8px 圆角，不加阴影或装饰纹理。嵌套范围使用极浅底色和彩色虚线；复刻图边界为 7/5 虚线，同内容样式稿为 6/4 虚线。箭头使用内部 marker、原生 polyline 和短标签，保留参考图的层级与路径。

Linux 图中的单个初始化路径保留参考图的轻微斜线；其他连接以水平、垂直段为主。整张图不是位图描摹贴图，所有矩形、文字、边界和箭头都是原生 SVG。

## 源码和维护

- 规则：`scripts/base-style-themes.mjs` 的 `reference`。
- 复刻生成：`scripts/generate-reference-diagrams.mjs`。
- 同内容生成：`scripts/generate-base-variations.mjs`。
- 复刻注册：`src/examples/reference-examples.ts`。
- 同图配对：`src/examples/base-variations.ts` 的 `sourceId`。
- SVG / Prompt：`src/examples/assets/` 与 `src/examples/prompts/` 的同名文件。
- 用户原图留作本地复核依据：`.impeccable/references/`；应用运行和导出不引用这些图片。

```sh
node scripts/generate-reference-diagrams.mjs
node scripts/generate-base-variations.mjs
```

手动修改生成稿时须同步修改生成器，否则再次生成会覆盖稿件。节点语义组、唯一 ID、端点绑定和内部引用均保留；移动节点后，编辑器可能重新计算连线路由，不保证维持原稿通道或自动避障。

## 适用范围

用户提供的是图像参考，没有可用的原始 SVG 或字体文件。因此交付是按图重建的原生 SVG，字体使用 Arial / PingFang SC / Noto Sans SC / sans-serif 回退；不同设备的字形、宽度与基线可能有差异，不承诺像素级一致。

技术文字依据用户图像转录，仅用于图形和风格复刻，不代表对 sandbox-runtime、平台实现或安全策略的独立核验。完整 Prompt 和 SVG desc 均记录这一点。

对应测试覆盖原生安全结构、文字/节点边界、连线与文字和节点相交、下载、移动联动、文字撤销、导出解析和实际重导入继续编辑；公共内容还覆盖编辑后重导入继续编辑、同图切换与视口保持。详见 [验证记录](VALIDATION.md)。
