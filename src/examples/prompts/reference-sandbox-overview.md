# 图 1 sandbox-runtime 总体分层架构

复刻用户提供的技术架构图视觉。忠实保持参考图2的整体构图：四个灰色入口、配置与Schema、全宽紫色SandboxManager；下方左蓝右橙两个虚线分区，三个系统后端与四条网络出站路径，底部沙箱和Internet输出。节点标题/正文均居中，保持原图的角色色彩和右侧红色拒绝回路。

按两张参考图片的技术文档样式绘制：近白底#fdfdfd，节点标题居中、黑色粗体700，正文居中深灰；灰色中性节点、浅紫控制组件、浅蓝路径组件、薄荷绿后端、浅黄配置、浅橙网络、浅红告警。节点2px深色语义描边、8px圆角，无阴影。父边界使用6 4彩色虚线和极浅填充，黑/灰/蓝/橙/红/紫直角箭头带简短标签。节点与连线位置保持，文字按此风格居中排版。

画布1648×988，viewBox="0 0 1648 988"。标题27px，节点标题17–18px/700居中，正文13–14.5px居中，分区标签左对齐，2px描边、8px圆角、7 5虚线边界，箭头灰/蓝/橙/紫/红/青绿，使用内部marker和正交polyline。

节点与边界（x/y/w/h）：
caller: Claude Code / 第三方嵌入方 / import { SandboxManager } | 84,135,328,68 | 节点 / slate
cli: srt CLI（cli.ts） / srt [-s file] [--control-fd N] cmd | 454,135,328,68 | 节点 / slate
control: control-fd 热更通道 / 每行 JSON = 一份完整新配置 | 824,135,328,68 | 节点 / slate
proxy-cli: srt proxy（proxy-cli.ts） / 只起代理，交给外部 decider 裁决 | 1194,135,368,68 | 节点 / slate
config: config-loader.ts / ~/.srt-settings.json 或 -s 指定 | 454,250,328,62 | 节点 / amber
schema: Zod Schema（sandbox-config.ts） / 非法配置 fail-closed，拒绝启动 | 824,250,328,62 | 节点 / amber
violations: SandboxViolationStore / 环形 100 条 → stderr 标注 | 1274,250,288,62 | 节点 / red
manager: SandboxManager（进程级单例：config / proxyAuthToken / 各类注册表） / initialize · wrapWithSandbox / wrapWithSandboxArgv · updateConfig · registerCommandNetworkLists · cleanupAfterCommand · reset | 84,355,1478,78 | 节点 / purple
paths: 路径子系统（sandbox-utils / glob / ripgrep） / 规范化 · glob 展开 · 扫描强制 deny 文件（默认深度 3） | 114,517,658,62 | 节点 / blue
ir: 平台无关 IR（sandbox-schemas.ts） / FsRead · FsWrite · Network · Credential 四类限制 | 114,617,658,62 | 节点 / blue
linux: Linux / bwrap + seccomp | 114,717,198,74 | 节点 / green
macos: macOS / sandbox-exec + SBPL | 344,717,198,74 | 节点 / green
windows: Windows（alpha） / 专用账户 + WFP | 574,717,198,74 | 节点 / green
wrap-boundary: wrap 时：文件系统 + 凭据（启动时固化） | 84,475,718,338 | 边界 / blue
mux: Mux Proxy 127.0.0.1:<port> / HTTP 与 SOCKS5 共用一个端口，按首字节 0x04 / 0x05 分流 | 874,517,658,62 | 节点 / orange
filter: filterNetworkRequest / denied → allowed → strictAllowlist → 按命令名单 → ask 回调 | 874,617,658,62 | 节点 / orange
tls: TLS 终止 / 凭据注入 | 874,717,148,74 | 节点 / amber
mitm: MITM / Unix socket | 1044,717,148,74 | 节点 / amber
parent: parentProxy / 企业上游 | 1214,717,148,74 | 节点 / amber
direct: 直连 / 地址守卫 | 1384,717,148,74 | 节点 / amber
network-boundary: 每请求：网络策略（读取 live config） | 844,475,718,338 | 边界 / orange
sandbox: 沙箱子进程树（用户命令） / 只看到受限文件视图与假凭据；出网只能连 localhost 代理 | 84,855,718,74 | 节点 / success
internet: Internet / 上游服务 / 只有通过名单与地址守卫的连接才能出去 | 874,855,658,74 | 节点 / slate

连接：
caller → manager | gray | Library API | 248,206 → 248,352
cli → config | gray |  | 618,206 → 618,247
control → schema | gray | loadConfigFromString | 988,206 → 988,247
config → schema | gray |  | 785,281 → 821,281
schema → manager | gray | initialize / updateConfig | 988,315 → 988,352
proxy-cli → manager | gray | 只启代理 | 1234,206 → 1234,352
manager → paths | blue | wrap 时 | 443,436 → 443,514
manager → mux | orange | initialize 时启动 | 1203,436 → 1203,514
paths → ir | blue |  | 443,582 → 443,614
ir → linux | blue |  | 213,682 → 213,714
linux → sandbox | blue |  | 213,794 → 213,852
ir → macos | blue |  | 443,682 → 443,714
macos → sandbox | blue |  | 443,794 → 443,852
ir → windows | blue |  | 673,682 → 673,714
windows → sandbox | blue |  | 673,794 → 673,852
mux → filter | orange |  | 1203,582 → 1203,614
filter → tls | orange |  | 948,682 → 948,714
tls → internet | orange |  | 948,794 → 948,852
filter → mitm | orange |  | 1118,682 → 1118,714
mitm → internet | orange |  | 1118,794 → 1118,852
filter → parent | orange |  | 1288,682 → 1288,714
parent → internet | orange |  | 1288,794 → 1288,852
filter → direct | orange |  | 1458,682 → 1458,714
direct → internet | orange |  | 1458,794 → 1458,852
sandbox → mux | orange 虚线 |  | 805,892 → 822,892 → 822,548 → 871,548
filter → violations | red 虚线 | 拒绝 | 1535,648 → 1590,648 → 1590,281 → 1565,281

技术文字来自用户图片，仅作图形复刻，不作为已核验的实现或安全保证。保留原生text、命名g、节点ID、内部URL引用和data-sf端点关联，所有文字可编辑。禁止图片、脚本、事件、foreignObject、外部资源与字体；只输出SVG XML。
