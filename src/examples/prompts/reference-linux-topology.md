# 图 3 Linux 后端：进程与命名空间拓扑 + 挂载层

复刻用户提供的技术架构图视觉。忠实保持参考图1的宿主框、蓝色bwrap命名空间、内层紫色命名空间和右侧挂载堆栈。进程中性灰、socat与挂载层薄荷绿、manager浅紫、seccomp stub浅黄、用户命令/违规监视浅红。右侧七步挂载自上而下，底部独立宿主前提说明。保留指定实线/虚线路径、进程与监听器标签，边界标题贴左或贴底排版。

按两张参考图片的技术文档样式绘制：近白底#fdfdfd，节点标题居中、黑色粗体700，正文居中深灰；灰色中性节点、浅紫控制组件、浅蓝路径组件、薄荷绿后端、浅黄配置、浅橙网络、浅红告警。节点2px深色语义描边、8px圆角，无阴影。父边界使用6 4彩色虚线和极浅填充，黑/灰/蓝/橙/红/紫直角箭头带简短标签。节点与连线位置保持，文字按此风格居中排版。

画布1648×1048，viewBox="0 0 1648 1048"。标题27px，节点标题17–18px/700居中，正文13–14.5px居中，分区标签左对齐，2px描边、8px圆角、7 5虚线边界，箭头灰/蓝/橙/紫/红/青绿，使用内部marker和正交polyline。

节点与边界（x/y/w/h）：
mux: mux proxy 127.0.0.1:<port> /  | 684,205,408,48 | 节点 / orange
monitor: seccomp 违规监视（unix sock 收 JSON） /  | 684,270,408,48 | 节点 / red
manager: node · SandboxManager | 664,160,448,174 | 边界 / purple
command: PID2 用户命令（及其子进程树） / NO_NEW_PRIVS + 3 个 seccomp 过滤器 · DUMPABLE=0；唯一出口：lo:3128 / lo:1080 | 154,730,478,84 | 节点 / red
apply-init: PID1 apply-seccomp init / 新 /proc · max_user_namespaces=0 | 738,740,328,58 | 节点 / amber
observe: 过滤器 ① observe / USER_NOTIF 上报违规 | 154,847,292,62 | 节点 / white
namespaces: 过滤器 ② namespaces / unshare / setns / mount… → EPERM | 464,847,292,62 | 节点 / white
unix: 过滤器 ③ unix / AF_UNIX / AF_VSOCK socket → EPERM | 774,847,292,62 | 节点 / white
nested-boundary:  | 124,690,960,272 | 边界 / purple
init: PID1 bwrap init / 无 seccomp | 124,445,198,55 | 节点 / slate
bash: PID2 bash 包装脚本 / 无 seccomp | 384,445,248,55 | 节点 / slate
stub: apply-seccomp 外层 stub / 加载 namespaces 过滤器 · supervise | 724,445,328,55 | 节点 / amber
http-relay: socat relay lo:3128 / → /tmp/claude-http-*.sock | 384,535,248,48 | 节点 / green
socks-relay: socat relay lo:1080 / → /tmp/claude-socks-*.sock | 384,597,248,48 | 节点 / green
pid-boundary:  | 94,395,1020,595 | 边界 / blue
socat: host socat / UNIX-LISTEN → mux 端口 | 94,170,259,55 | 节点 / green
host-bwrap: bwrap（宿主侧父进程） / 参数过多时走 --args 9 | 94,265,259,55 | 节点 / slate
shell: /bin/sh -c / 执行包装后的命令串 | 394,265,228,55 | 节点 / slate
host-boundary: 宿主（init 命名空间） | 54,125,1090,883 | 边界 / slate
root: --ro-bind / / / 整个根先只读 | 1204,165,359,56 | 节点 / green
write: --bind allowWrite / 开放可写根 | 1204,243,359,56 | 节点 / green
pin: 祖先目录 pin（--ro-bind d d） / mv / rmdir 父目录得到 EBUSY | 1204,321,359,56 | 节点 / green
tmpfs: --tmpfs 盖住 denyRead 目录 / 再回填 allowRead 子路径 | 1204,399,359,56 | 节点 / green
deny-file: /dev/null 覆盖 denyRead 文件 / 单文件级屏蔽 | 1204,477,359,56 | 节点 / green
mask: 凭据 mask: --ro-bind 假文件 / 内容为等长 sentinel | 1204,555,359,56 | 节点 / green
deny-write: --ro-bind denyWrite / 含强制 deny: .git/hooks · .bashrc … | 1204,633,359,56 | 节点 / green
mount-boundary: 挂载层（自上而下，后者覆盖前者） | 1174,125,420,598 | 边界 / green
host-limits: 宿主前提与限制 / 依赖非特权 userns；Ubuntu 24.04 需放开；apparmor_restrict_unprivileged_userns；Docker 内可用 enableWeakerNestedSandbox；（改 --bind /proc，README：明显变弱）；bwrap ≤ 9000 参数（约 3000 个挂载）；缺 bwrap / socat 报错，缺 helper 告警 | 1174,755,420,238 | 节点 / slate

连接：
socat → mux | teal | TCP keepalive | 356,197.5 → 524,197.5 → 524,229 → 681,229
shell → host-bwrap | gray | exec | 391,292.5 → 356,292.5
manager → shell | gray | spawn | 661,292.5 → 625,292.5
host-bwrap → init | gray | clone(NEWUSER | NEWPID | NEWNS | NEWNET) | 223.5,323 → 223,442
init → bash | gray |  | 325,472.5 → 381,472.5
bash → stub | gray | exec | 635,472.5 → 721,472.5
bash → http-relay | gray | & 后台 ×2 | 508,503 → 508,532
stub → apply-init | gray | unshare(NEWPID|NEWNS) + fork | 888,503 → 902,737
apply-init → command | gray | execvp | 735,772 → 635,772
stub → monitor | red 虚线 | 违规 JSON（bind-mount 的 unix sock） | 903,442 → 903,321
command → stub | purple 虚线 | USER_NOTIF 监听 fd（SCM_RIGHTS 回传） | 323,727 → 323,674 → 813,674 → 813,503
root → write | teal |  | 1383.5,224 → 1383.5,240
write → pin | teal |  | 1383.5,302 → 1383.5,318
pin → tmpfs | teal |  | 1383.5,380 → 1383.5,396
tmpfs → deny-file | teal |  | 1383.5,458 → 1383.5,474
deny-file → mask | teal |  | 1383.5,536 → 1383.5,552
mask → deny-write | teal |  | 1383.5,614 → 1383.5,630

技术文字来自用户图片，仅作图形复刻，不作为已核验的实现或安全保证。保留原生text、命名g、节点ID、内部URL引用和data-sf端点关联，所有文字可编辑。禁止图片、脚本、事件、foreignObject、外部资源与字体；只输出SVG XML。
