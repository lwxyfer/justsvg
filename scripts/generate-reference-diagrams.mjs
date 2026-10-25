import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseStyleThemes } from './base-style-themes.mjs';

// Reconstructed from the two user-supplied diagrams. Technical labels are transcription,
// not independently verified implementation/security guidance. Output is entirely native SVG.
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../src/examples');
const theme = baseStyleThemes.reference;
const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const tag = (name, attrs, body = null) =>
  `<${name}${Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('')}${body === null ? '/>' : `>${body}</${name}>`}`;
const text = (s, x, y, size = 14, fill = '#45484d', weight = 400, anchor = 'middle') =>
  tag(
    'text',
    { x, y, 'font-size': size, fill, 'font-weight': weight, 'text-anchor': anchor },
    esc(s),
  );
const rect = (x, y, width, height, fill, stroke, sw = 2, dashed = false) =>
  tag('rect', {
    x,
    y,
    width,
    height,
    rx: 8,
    fill,
    stroke,
    'stroke-width': sw,
    ...(dashed ? { 'stroke-dasharray': '7 5' } : {}),
  });
const colors = {
  gray: '#6b7178',
  blue: '#2451c4',
  purple: '#6d28d9',
  teal: '#14786b',
  orange: '#984d0b',
  red: '#b60029',
};
function figure(slug, title, subtitle, width, height) {
  const objects = new Map(),
    lines = [],
    descriptions = [];
  const id = (key) => `${slug}-${key}`;
  const node = (key, title, body, x, y, w, h, tone = 'slate', options = {}) => {
    const p = theme.nodes[tone] || ['#fdfdfd', '#969da5', '#292b2f'];
    const opts = {
      titleSize: 17,
      bodySize: 14,
      titleOffset: 24,
      bodyOffset: 45,
      step: 20,
      ...options,
    };
    objects.set(key, { id: id(key), title, body, x, y, w, h, node: true, tone });
    return tag(
      'g',
      { id: id(key), 'data-node': 'true', 'data-label': title },
      rect(x, y, w, h, p[0], p[1]) +
        text(title, x + w / 2, y + opts.titleOffset, opts.titleSize, p[2], 700) +
        body
          .map((s, i) => text(s, x + w / 2, y + opts.bodyOffset + i * opts.step, opts.bodySize))
          .join(''),
    );
  };
  const scope = (
    key,
    title,
    x,
    y,
    w,
    h,
    body = '',
    tone = 'blue',
    solid = false,
    center = false,
  ) => {
    const fill =
      (solid ? theme.nodes[tone]?.[0] : theme.groups[tone]) || theme.nodes[tone]?.[0] || '#f5f6f7';
    const line = theme.nodes[tone]?.[1] || colors.gray;
    objects.set(key, { id: id(key), title, x, y, w, h, node: false, tone });
    return tag(
      'g',
      {
        id: id(key),
        'data-label': title || (key === 'pid-boundary' ? 'bwrap 命名空间' : '嵌套命名空间'),
        'data-boundary': solid ? 'solid' : 'dashed',
      },
      rect(x, y, w, h, fill, line, 2, !solid) +
        text(
          title,
          center ? x + w / 2 : x + 13,
          y + 23,
          center ? 17 : 15.5,
          center ? '#292b2f' : line,
          700,
          center ? 'middle' : 'start',
        ) +
        body,
    );
  };
  const port = (key, side, offset = 3) => {
    const n = objects.get(key);
    return side === 'top'
      ? [n.x + n.w / 2, n.y - offset]
      : side === 'bottom'
        ? [n.x + n.w / 2, n.y + n.h + offset]
        : side === 'left'
          ? [n.x - offset, n.y + n.h / 2]
          : [n.x + n.w + offset, n.y + n.h / 2];
  };
  const edge = (
    key,
    a,
    b,
    points,
    color = 'gray',
    dash = false,
    label = '',
    labelAt = null,
    anchor = 'middle',
  ) => {
    const anchorOf = (key, p) => {
      const n = objects.get(key),
        u = Math.max(0, Math.min(1, (p[0] - n.x) / n.w)),
        v = Math.max(0, Math.min(1, (p[1] - n.y) / n.h));
      return `${u.toFixed(6)} ${v.toFixed(6)} ${(p[0] - n.x - u * n.w).toFixed(2)} ${(p[1] - n.y - v * n.h).toFixed(2)}`;
    };
    const edgeId = id(`edge-${key}`);
    lines.push(
      tag(
        'g',
        { 'data-label': label || `${a} → ${b}` },
        tag('polyline', {
          id: edgeId,
          points: points.map((p) => p.join(',')).join(' '),
          fill: 'none',
          stroke: colors[color],
          'stroke-width': 1.8,
          'marker-end': `url(#${id(`arrow-${color}`)})`,
          ...(dash ? { 'stroke-dasharray': '6 4' } : {}),
          'data-sf-start-node': `#${id(a)}`,
          'data-sf-end-node': `#${id(b)}`,
          'data-sf-start-anchor': anchorOf(a, points[0]),
          'data-sf-end-anchor': anchorOf(b, points.at(-1)),
        }) +
          (label
            ? tag(
                'g',
                { 'data-sf-label-for': `#${edgeId}` },
                text(label, labelAt[0], labelAt[1], 13, colors[color], 400, anchor),
              )
            : ''),
      ),
    );
    descriptions.push(
      `${a} → ${b} | ${color}${dash ? ' 虚线' : ''} | ${label} | ${points.map((p) => p.join(',')).join(' → ')}`,
    );
  };
  const finish = (body, prompt) => {
    const defs = Object.entries(colors)
      .map(([key, color]) =>
        tag(
          'marker',
          {
            id: id(`arrow-${key}`),
            viewBox: '0 0 10 10',
            refX: 9,
            refY: 5,
            markerWidth: 7,
            markerHeight: 7,
            orient: 'auto-start-reverse',
          },
          tag('path', { d: 'M0 0L10 5L0 10Z', fill: color }),
        ),
      )
      .join('');
    const svg = tag(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        'font-family': 'Arial, PingFang SC, Noto Sans SC, sans-serif',
        'data-visual-style': 'reference',
      },
      tag('title', {}, esc(title)) +
        tag('desc', {}, '依据用户提供图片复刻视觉与文字，技术细节未作独立版本核验。') +
        tag('defs', {}, defs) +
        tag('rect', { x: 0, y: 0, width, height, fill: '#fdfdfd' }) +
        text(title, 64, 74, 27, '#292b2f', 700, 'start') +
        text(subtitle, 64, 101, 14.5, '#6b7178', 400, 'start') +
        body +
        lines.join(''),
    );
    writeFileSync(resolve(output, `assets/${slug}.svg`), svg + '\n');
    writeFileSync(
      resolve(output, `prompts/${slug}.md`),
      `# ${title}\n\n复刻用户提供的技术架构图视觉。${prompt}\n\n${theme.rules}\n\n画布${width}×${height}，viewBox="0 0 ${width} ${height}"。标题27px，节点标题17–18px/700居中，正文13–14.5px居中，分区标签左对齐，2px描边、8px圆角、7 5虚线边界，箭头灰/蓝/橙/紫/红/青绿，使用内部marker和正交polyline。\n\n节点与边界（x/y/w/h）：\n${[...objects].map(([key, n]) => `${key}: ${n.title}${n.body ? ' / ' + n.body.join('；') : ''} | ${n.x},${n.y},${n.w},${n.h} | ${n.node ? '节点' : '边界'} / ${n.tone}`).join('\n')}\n\n连接：\n${descriptions.join('\n')}\n\n技术文字来自用户图片，仅作图形复刻，不作为已核验的实现或安全保证。保留原生text、命名g、节点ID、内部URL引用和data-sf端点关联，所有文字可编辑。禁止图片、脚本、事件、foreignObject、外部资源与字体；只输出SVG XML。\n`,
    );
    console.log(
      `${slug}: ${[...objects.values()].filter((n) => n.node).length} nodes, ${lines.length} links`,
    );
  };
  return { node, scope, port, edge, finish, text };
}

function overview() {
  const d = figure(
    'reference-sandbox-overview',
    '图 1 sandbox-runtime 总体分层架构',
    '蓝色路径：wrap 时一次性固化（文件系统 / 凭据）  橙色路径：每个网络请求实时判定（读取 live config，热更新即时生效）',
    1648,
    988,
  );
  const top =
    d.node(
      'caller',
      'Claude Code / 第三方嵌入方',
      ['import { SandboxManager }'],
      84,
      135,
      328,
      68,
      'slate',
      { titleSize: 18, titleOffset: 29, bodyOffset: 52 },
    ) +
    d.node(
      'cli',
      'srt CLI（cli.ts）',
      ['srt [-s file] [--control-fd N] cmd'],
      454,
      135,
      328,
      68,
      'slate',
      { titleSize: 18, titleOffset: 29, bodyOffset: 52 },
    ) +
    d.node(
      'control',
      'control-fd 热更通道',
      ['每行 JSON = 一份完整新配置'],
      824,
      135,
      328,
      68,
      'slate',
      { titleSize: 18, titleOffset: 29, bodyOffset: 52 },
    ) +
    d.node(
      'proxy-cli',
      'srt proxy（proxy-cli.ts）',
      ['只起代理，交给外部 decider 裁决'],
      1194,
      135,
      368,
      68,
      'slate',
      { titleSize: 18, titleOffset: 29, bodyOffset: 52 },
    ) +
    d.node(
      'config',
      'config-loader.ts',
      ['~/.srt-settings.json 或 -s 指定'],
      454,
      250,
      328,
      62,
      'amber',
      { titleSize: 18, titleOffset: 26, bodyOffset: 48 },
    ) +
    d.node(
      'schema',
      'Zod Schema（sandbox-config.ts）',
      ['非法配置 fail-closed，拒绝启动'],
      824,
      250,
      328,
      62,
      'amber',
      { titleSize: 17.5, titleOffset: 26, bodyOffset: 48 },
    ) +
    d.node(
      'violations',
      'SandboxViolationStore',
      ['环形 100 条 → stderr 标注'],
      1274,
      250,
      288,
      62,
      'red',
      { titleSize: 17.5, titleOffset: 26, bodyOffset: 48 },
    ) +
    d.node(
      'manager',
      'SandboxManager（进程级单例：config / proxyAuthToken / 各类注册表）',
      [
        'initialize · wrapWithSandbox / wrapWithSandboxArgv · updateConfig · registerCommandNetworkLists · cleanupAfterCommand · reset',
      ],
      84,
      355,
      1478,
      78,
      'purple',
      { titleSize: 18, titleOffset: 33, bodyOffset: 59, bodySize: 14.5 },
    );
  const left = d.scope(
    'wrap-boundary',
    'wrap 时：文件系统 + 凭据（启动时固化）',
    84,
    475,
    718,
    338,
    d.node(
      'paths',
      '路径子系统（sandbox-utils / glob / ripgrep）',
      ['规范化 · glob 展开 · 扫描强制 deny 文件（默认深度 3）'],
      114,
      517,
      658,
      62,
      'blue',
      { titleSize: 18, titleOffset: 26, bodyOffset: 49 },
    ) +
      d.node(
        'ir',
        '平台无关 IR（sandbox-schemas.ts）',
        ['FsRead · FsWrite · Network · Credential 四类限制'],
        114,
        617,
        658,
        62,
        'blue',
        { titleSize: 18, titleOffset: 26, bodyOffset: 49 },
      ) +
      d.node('linux', 'Linux', ['bwrap + seccomp'], 114, 717, 198, 74, 'green', {
        titleSize: 18,
        titleOffset: 32,
        bodyOffset: 56,
      }) +
      d.node('macos', 'macOS', ['sandbox-exec + SBPL'], 344, 717, 198, 74, 'green', {
        titleSize: 18,
        titleOffset: 32,
        bodyOffset: 56,
      }) +
      d.node('windows', 'Windows（alpha）', ['专用账户 + WFP'], 574, 717, 198, 74, 'green', {
        titleSize: 17.5,
        titleOffset: 32,
        bodyOffset: 56,
      }),
  );
  const right = d.scope(
    'network-boundary',
    '每请求：网络策略（读取 live config）',
    844,
    475,
    718,
    338,
    d.node(
      'mux',
      'Mux Proxy 127.0.0.1:<port>',
      ['HTTP 与 SOCKS5 共用一个端口，按首字节 0x04 / 0x05 分流'],
      874,
      517,
      658,
      62,
      'orange',
      { titleSize: 18, titleOffset: 26, bodyOffset: 49 },
    ) +
      d.node(
        'filter',
        'filterNetworkRequest',
        ['denied → allowed → strictAllowlist → 按命令名单 → ask 回调'],
        874,
        617,
        658,
        62,
        'orange',
        { titleSize: 18, titleOffset: 26, bodyOffset: 49 },
      ) +
      [
        ['tls', 'TLS 终止', '凭据注入'],
        ['mitm', 'MITM', 'Unix socket'],
        ['parent', 'parentProxy', '企业上游'],
        ['direct', '直连', '地址守卫'],
      ]
        .map(([id, title, sub], i) =>
          d.node(id, title, [sub], 874 + i * 170, 717, 148, 74, 'amber', {
            titleSize: 17.5,
            titleOffset: 32,
            bodyOffset: 56,
          }),
        )
        .join(''),
    'orange',
  );
  const bottom =
    d.node(
      'sandbox',
      '沙箱子进程树（用户命令）',
      ['只看到受限文件视图与假凭据；出网只能连 localhost 代理'],
      84,
      855,
      718,
      74,
      'success',
      { titleSize: 18, titleOffset: 32, bodyOffset: 56 },
    ) +
    d.node(
      'internet',
      'Internet / 上游服务',
      ['只有通过名单与地址守卫的连接才能出去'],
      874,
      855,
      658,
      74,
      'slate',
      { titleSize: 18, titleOffset: 32, bodyOffset: 56 },
    );
  d.edge(
    'caller',
    'caller',
    'manager',
    [d.port('caller', 'bottom'), [248, 352]],
    'gray',
    false,
    'Library API',
    [256, 284],
    'start',
  );
  d.edge('cli-config', 'cli', 'config', [d.port('cli', 'bottom'), d.port('config', 'top')]);
  d.edge(
    'control-schema',
    'control',
    'schema',
    [d.port('control', 'bottom'), d.port('schema', 'top')],
    'gray',
    false,
    'loadConfigFromString',
    [996, 232],
    'start',
  );
  d.edge('config-schema', 'config', 'schema', [
    d.port('config', 'right'),
    d.port('schema', 'left'),
  ]);
  d.edge(
    'schema-manager',
    'schema',
    'manager',
    [d.port('schema', 'bottom'), [988, 352]],
    'gray',
    false,
    'initialize / updateConfig',
    [997, 339],
    'start',
  );
  d.edge(
    'proxy-manager',
    'proxy-cli',
    'manager',
    [
      [1234, 206],
      [1234, 352],
    ],
    'gray',
    false,
    '只启代理',
    [1226, 337],
    'end',
  );
  d.edge(
    'wrap',
    'manager',
    'paths',
    [[443, 436], d.port('paths', 'top')],
    'blue',
    false,
    'wrap 时',
    [451, 460],
    'start',
  );
  d.edge(
    'initialize-proxy',
    'manager',
    'mux',
    [[1203, 436], d.port('mux', 'top')],
    'orange',
    false,
    'initialize 时启动',
    [1211, 460],
    'start',
  );
  d.edge('paths-ir', 'paths', 'ir', [d.port('paths', 'bottom'), d.port('ir', 'top')], 'blue');
  for (const id of ['linux', 'macos', 'windows']) {
    const x = { linux: 213, macos: 443, windows: 673 }[id];
    d.edge(`ir-${id}`, 'ir', id, [[x, 682], d.port(id, 'top')], 'blue');
    d.edge(`${id}-process`, id, 'sandbox', [d.port(id, 'bottom'), [x, 852]], 'blue');
  }
  d.edge(
    'mux-filter',
    'mux',
    'filter',
    [d.port('mux', 'bottom'), d.port('filter', 'top')],
    'orange',
  );
  for (const [i, id] of ['tls', 'mitm', 'parent', 'direct'].entries()) {
    const x = 948 + i * 170;
    d.edge(`filter-${id}`, 'filter', id, [[x, 682], d.port(id, 'top')], 'orange');
    d.edge(`${id}-internet`, id, 'internet', [d.port(id, 'bottom'), [x, 852]], 'orange');
  }
  d.edge(
    'sandbox-proxy',
    'sandbox',
    'mux',
    [d.port('sandbox', 'right'), [822, 892], [822, 548], d.port('mux', 'left')],
    'orange',
    true,
  );
  d.edge(
    'reject',
    'filter',
    'violations',
    [d.port('filter', 'right'), [1590, 648], [1590, 281], d.port('violations', 'right')],
    'red',
    true,
    '拒绝',
    [1580, 464],
    'end',
  );
  d.finish(
    top + left + right + bottom,
    '忠实保持参考图2的整体构图：四个灰色入口、配置与Schema、全宽紫色SandboxManager；下方左蓝右橙两个虚线分区，三个系统后端与四条网络出站路径，底部沙箱和Internet输出。节点标题/正文均居中，保持原图的角色色彩和右侧红色拒绝回路。',
  );
}

function linuxTopology() {
  const d = figure(
    'reference-linux-topology',
    '图 3 Linux 后端：进程与命名空间拓扑 + 挂载层',
    '灰色进程没有 seccomp；嵌套 PID ns + DUMPABLE=0 让用户命令看不到、也 ptrace 不到它们',
    1648,
    1048,
  );
  const manager = d.scope(
    'manager',
    'node · SandboxManager',
    664,
    160,
    448,
    174,
    d.node('mux', 'mux proxy 127.0.0.1:<port>', [], 684, 205, 408, 48, 'orange', {
      titleOffset: 30,
    }) +
      d.node('monitor', 'seccomp 违规监视（unix sock 收 JSON）', [], 684, 270, 408, 48, 'red', {
        titleSize: 17,
        titleOffset: 30,
      }),
    'purple',
    true,
    true,
  );
  const nested = d.scope(
    'nested-boundary',
    '',
    124,
    690,
    960,
    272,
    d.node(
      'command',
      'PID2 用户命令（及其子进程树）',
      ['NO_NEW_PRIVS + 3 个 seccomp 过滤器 · DUMPABLE=0', '唯一出口：lo:3128 / lo:1080'],
      154,
      730,
      478,
      84,
      'red',
      { titleOffset: 27, bodyOffset: 49, step: 21, bodySize: 13.5 },
    ) +
      d.node(
        'apply-init',
        'PID1 apply-seccomp init',
        ['新 /proc · max_user_namespaces=0'],
        738,
        740,
        328,
        58,
        'amber',
        { titleOffset: 25, bodyOffset: 46, bodySize: 13.5 },
      ) +
      d.node('observe', '过滤器 ① observe', ['USER_NOTIF 上报违规'], 154, 847, 292, 62, 'white', {
        titleSize: 16,
        titleOffset: 26,
        bodyOffset: 47,
        bodySize: 13.5,
      }) +
      d.node(
        'namespaces',
        '过滤器 ② namespaces',
        ['unshare / setns / mount… → EPERM'],
        464,
        847,
        292,
        62,
        'white',
        { titleSize: 16, titleOffset: 26, bodyOffset: 47, bodySize: 13.5 },
      ) +
      d.node(
        'unix',
        '过滤器 ③ unix',
        ['AF_UNIX / AF_VSOCK socket → EPERM'],
        774,
        847,
        292,
        62,
        'white',
        { titleSize: 16, titleOffset: 26, bodyOffset: 47, bodySize: 13.5 },
      ) +
      text(
        'io_uring 一律 EPERM（IORING_OP_SOCKET 可绕过 socket 规则）；clone3 返回 ENOSYS 迫使 libc 回退 clone',
        604,
        929,
        12.5,
        '#6b7178',
      ) +
      text(
        '嵌套 ns: user* + pid + mnt（*常见路径：直接 unshare 被拒后自建 userns）',
        138,
        951,
        14,
        '#6d28d9',
        700,
        'start',
      ),
    'purple',
  );
  const pidns = d.scope(
    'pid-boundary',
    '',
    94,
    395,
    1020,
    595,
    d.node('init', 'PID1 bwrap init', ['无 seccomp'], 124, 445, 198, 55, 'slate', {
      titleOffset: 23,
      bodyOffset: 44,
    }) +
      d.node('bash', 'PID2 bash 包装脚本', ['无 seccomp'], 384, 445, 248, 55, 'slate', {
        titleOffset: 23,
        bodyOffset: 44,
      }) +
      d.node(
        'stub',
        'apply-seccomp 外层 stub',
        ['加载 namespaces 过滤器 · supervise'],
        724,
        445,
        328,
        55,
        'amber',
        { titleOffset: 23, bodyOffset: 44 },
      ) +
      d.node(
        'http-relay',
        'socat relay lo:3128',
        ['→ /tmp/claude-http-*.sock'],
        384,
        535,
        248,
        48,
        'green',
        { titleOffset: 20, bodyOffset: 39 },
      ) +
      d.node(
        'socks-relay',
        'socat relay lo:1080',
        ['→ /tmp/claude-socks-*.sock'],
        384,
        597,
        248,
        48,
        'green',
        { titleOffset: 20, bodyOffset: 39 },
      ) +
      nested +
      text(
        'bwrap 命名空间：user + pid + mnt + net（netns 只有 lo）',
        108,
        979,
        16,
        '#2451c4',
        700,
        'start',
      ),
    'blue',
  );
  const host = d.scope(
    'host-boundary',
    '宿主（init 命名空间）',
    54,
    125,
    1090,
    883,
    d.node('socat', 'host socat', ['UNIX-LISTEN → mux 端口'], 94, 170, 259, 55, 'green', {
      titleOffset: 23,
      bodyOffset: 44,
    }) +
      d.node(
        'host-bwrap',
        'bwrap（宿主侧父进程）',
        ['参数过多时走 --args 9'],
        94,
        265,
        259,
        55,
        'slate',
        { titleOffset: 23, bodyOffset: 44 },
      ) +
      d.node('shell', '/bin/sh -c', ['执行包装后的命令串'], 394, 265, 228, 55, 'slate', {
        titleOffset: 23,
        bodyOffset: 44,
      }) +
      manager +
      pidns,
    'slate',
  );
  const mounts = [
    ['root', '--ro-bind / /', '整个根先只读'],
    ['write', '--bind allowWrite', '开放可写根'],
    ['pin', '祖先目录 pin（--ro-bind d d）', 'mv / rmdir 父目录得到 EBUSY'],
    ['tmpfs', '--tmpfs 盖住 denyRead 目录', '再回填 allowRead 子路径'],
    ['deny-file', '/dev/null 覆盖 denyRead 文件', '单文件级屏蔽'],
    ['mask', '凭据 mask: --ro-bind 假文件', '内容为等长 sentinel'],
    ['deny-write', '--ro-bind denyWrite', '含强制 deny: .git/hooks · .bashrc …'],
  ];
  const mountGroup = d.scope(
    'mount-boundary',
    '挂载层（自上而下，后者覆盖前者）',
    1174,
    125,
    420,
    598,
    mounts
      .map(([id, title, sub], i) =>
        d.node(id, title, [sub], 1204, 165 + i * 78, 359, 56, 'green', {
          titleSize: 15.5,
          titleOffset: 23,
          bodyOffset: 44,
          bodySize: 13,
        }),
      )
      .join(''),
    'green',
  );
  const notes = d.node(
    'host-limits',
    '宿主前提与限制',
    [
      '依赖非特权 userns；Ubuntu 24.04 需放开',
      'apparmor_restrict_unprivileged_userns',
      'Docker 内可用 enableWeakerNestedSandbox',
      '（改 --bind /proc，README：明显变弱）',
      'bwrap ≤ 9000 参数（约 3000 个挂载）',
      '缺 bwrap / socat 报错，缺 helper 告警',
    ],
    1174,
    755,
    420,
    238,
    'slate',
    { titleSize: 16, titleOffset: 67, bodyOffset: 90, bodySize: 13, step: 20 },
  );
  d.edge(
    'keepalive',
    'socat',
    'mux',
    [d.port('socat', 'right'), [524, 197.5], [524, 229], d.port('mux', 'left')],
    'teal',
    false,
    'TCP keepalive',
    [440, 189],
  );
  d.edge(
    'exec',
    'shell',
    'host-bwrap',
    [d.port('shell', 'left'), d.port('host-bwrap', 'right')],
    'gray',
    false,
    'exec',
    [374, 255],
  );
  d.edge(
    'spawn',
    'manager',
    'shell',
    [[661, 292.5], d.port('shell', 'right')],
    'gray',
    false,
    'spawn',
    [643, 282],
  );
  d.edge(
    'clone',
    'host-bwrap',
    'init',
    [d.port('host-bwrap', 'bottom'), d.port('init', 'top')],
    'gray',
    false,
    'clone(NEWUSER | NEWPID | NEWNS | NEWNET)',
    [234, 376],
    'start',
  );
  d.edge('init-bash', 'init', 'bash', [d.port('init', 'right'), d.port('bash', 'left')]);
  d.edge(
    'bash-stub',
    'bash',
    'stub',
    [d.port('bash', 'right'), d.port('stub', 'left')],
    'gray',
    false,
    'exec',
    [678, 465],
  );
  d.edge(
    'relay',
    'bash',
    'http-relay',
    [d.port('bash', 'bottom'), d.port('http-relay', 'top')],
    'gray',
    false,
    '& 后台 ×2',
    [516, 522],
    'start',
  );
  d.edge(
    'fork',
    'stub',
    'apply-init',
    [d.port('stub', 'bottom'), d.port('apply-init', 'top')],
    'gray',
    false,
    'unshare(NEWPID|NEWNS) + fork',
    [896, 622],
    'start',
  );
  d.edge(
    'execvp',
    'apply-init',
    'command',
    [
      [735, 772],
      [635, 772],
    ],
    'gray',
    false,
    'execvp',
    [686, 761],
  );
  d.edge(
    'violation',
    'stub',
    'monitor',
    [
      [903, 442],
      [903, 321],
    ],
    'red',
    true,
    '违规 JSON（bind-mount 的 unix sock）',
    [888, 376],
    'end',
  );
  d.edge(
    'notify',
    'command',
    'stub',
    [
      [323, 727],
      [323, 674],
      [813, 674],
      [813, 503],
    ],
    'purple',
    true,
    'USER_NOTIF 监听 fd（SCM_RIGHTS 回传）',
    [592, 666],
  );
  for (let i = 0; i < mounts.length - 1; i++)
    d.edge(
      `mount-${i}`,
      mounts[i][0],
      mounts[i + 1][0],
      [d.port(mounts[i][0], 'bottom'), d.port(mounts[i + 1][0], 'top')],
      'teal',
    );
  d.finish(
    host + mountGroup + notes,
    '忠实保持参考图1的宿主框、蓝色bwrap命名空间、内层紫色命名空间和右侧挂载堆栈。进程中性灰、socat与挂载层薄荷绿、manager浅紫、seccomp stub浅黄、用户命令/违规监视浅红。右侧七步挂载自上而下，底部独立宿主前提说明。保留指定实线/虚线路径、进程与监听器标签，边界标题贴左或贴底排版。',
  );
}

overview();
linuxTopology();
