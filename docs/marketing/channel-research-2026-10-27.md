# 营销渠道规则研究

查阅日期：2026-10-27。范围：X、Reddit、Hacker News、Product Hunt。仅研究，未发帖、评论、联系任何账号。以下将官方规则与方案建议分开；不是法律意见，也不能替代上线前复核。

## 结论

可以设计“发现具体需求 → 判断产品是否解决 → 准备对应案例 → 按平台规则参与 → 追踪真实使用”的获客工作流。不能把“AI 批量爬取 + 自动给陌生人评论”作为默认落地方式。公开可见并不等于允许批量采集，个性化文本也不自动排除垃圾信息风险。

| 渠道 | 已核对的官方规则 | 对后续执行的影响（建议） |
| --- | --- | --- |
| X | 禁止仅依据关键词搜索向用户自动回复；自动回复要求事先明确意愿、退出机制、每次互动一次回复。AI 回复机器人另外需要 X 事先书面明确批准。禁止通过脚本操作网站实施非 API 自动化。 | 可以辅助研究、做案例和准备文案；不要安排 Codex 在浏览器自动给陌生人评论。用户本人有判断地发出相关回复，也需避免重复和骚扰；人工点击并不能让批量推广变成合规。 |
| Reddit | 自动或人工的重复、未经请求的大规模互动都可能是 spam；禁止持续推广特定产品的机器人。社区版主可制定额外规则。 | 优先在明确允许自荐的版块或固定帖子参与，先读当日版规；披露作者关系，回答具体问题，禁止跨社区复制自荐。不把“自荐少于 10%”当作全站安全线。 |
| Hacker News | 禁止 AI 生成或 AI 编辑的帖子、评论；禁止自动发帖；不能主要用于推广，也不能拉票或索要评论。 | Codex 不能代写、润色或代发 HN 帖子和评论。可核对产品事实、整理独立素材；如果用户愿意，须本人独立撰写和发布。因此 HN 不应列入“完全由 Codex 执行”的核心渠道。 |
| Show HN | 要有本人参与制作、可以实际体验的非琐碎作品；尽量无注册等门槛；单纯落地页、名单、Newsletter 不适用。 | 产品可直接体验且作者愿意本人讨论时再考虑，不能只发介绍页。遵守 HN 的 AI 文本禁令。 |
| Product Hunt | 支持创作者自行发布，无需付费找 hunter；强调实际可用的产品、清晰演示和真实讨论；禁止直接索要 upvote。 | 适合作为有案例、有可用产品后的集中发布，不宜将榜单名次视为增长目标。Codex 可准备发布素材和页面，正式操作前仍需确认账户访问与当时规则。 |

## 官方依据

1. [X Automation rules](https://help.x.com/en/rules-and-policies/x-automation)（页面标注更新 2026-04）：见 Ground Rules、Posting automated mentions and replies、AI-Powered Automated Replies、Automated Direct Messages。该页明确要求 AI reply bot 获得事先书面批准；用户关注账号不等于同意自动回复。
2. [X 账号行为规则](https://help.x.com/en/rules-and-policies/x-rules-and-best-practices)：重复、未经请求地向大量账号发相同回复属于 spam。
3. [X Terms of Service](https://x.com/en/tos)：未经事先书面同意禁止爬取；不能把普通可见网页当作自由批采授权。
4. [Reddit Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)（页面标注更新 2026-10-22）：同时覆盖手动和自动行为，并要求查看具体社区规则。
5. [Reddit Don't break the site](https://support.reddithelp.com/hc/en-us/articles/360043512931-Don-t-break-the-site)：列明未经授权协议爬取违规；包括 bots、AI agents、非人工账户的行为。
6. [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/16471395473812-Moderation-Bots-Tooling)：数据访问、商业使用、自动化适用额外审批要求。此处仅核对规则，未研究 API 实施方式。
7. [Hacker News Guidelines](https://news.ycombinator.com/newsguidelines.html)：含 AI 生成/编辑文本和自动发布禁令、推广与拉票约束。
8. [Show HN Guidelines](https://news.ycombinator.com/showhn.html)：作品、可体验性和作者参与要求。
9. [Product Hunt Launch Guide](https://help.producthunt.com/en/articles/17350772-launch-guide)：发布素材、真实姓名账户、本人发布、禁止索票和发布后反馈跟进。
10. [Product Hunt 发布前须知](https://www.producthunt.com/launch/how-product-hunt-works)：不应付费购买 hunter 或导流服务。

## 数据搜集的方案边界

以下是本研究据规则提出的实施建议，不是平台对某一系统的批准：

- 第一阶段优先人工正常搜索、官方允许的发现入口、用户主动提供的线索以及明确获授权的数据来源；按来源分别检查许可。不承诺“全网爬虫”。
- 数据授权与发布授权分别核对；有 API 或可见搜索结果不等于获得所有商业分析、外发或自动回复权限。
- AI 内部评分只依据明确需求、产品功能适配、内容新鲜度和参与规则；记录原始链接及规则状态，不搜集私人联系方式或敏感个人画像。
- 面向资源 KOL，优先其明确接受投稿的表单、公开投稿说明或开放自荐帖子；“分享工具”本身不等于欢迎每条帖下的广告。
- 不用改写句子、换号、降低速度来绕过平台禁令；停止条件应包含删除、明确拒绝、平台警告和账号限制。
- 尚未核对中文平台规则：不能将以上结论直接套用到小红书、即刻、B 站、微信公众号等渠道。

## 可执行性划分

- Codex 可承担：在许可范围内发现线索、核对相关性、生成产品演示、准备案例与大多数渠道的文案、建立记录与归因、分析转化、提出产品调整。
- 不能预先承诺：未经批准的批量采集、X 网页自动操作和陌生人 AI 自动回复、HN 代写代发、绕过验证码/风控、买票或刷互动。
- 人工承担不等于每天全程运营：可把需要人参与的环节集中成一个短批次；但 HN 文本必须用户本人独立撰写，不能把 AI 草稿人工点发送作为替代。
