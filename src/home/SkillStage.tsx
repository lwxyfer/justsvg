import { useHomeLocale } from './homeLocale';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Copy, FileCode2, Palette } from 'lucide-react';
import { NativeDiagram } from './NativeDiagram';
import { themes } from './diagramModel';
import type { DiagramEdits, HomeTheme } from './diagramModel';
import { FileDrawing } from './FileDrawing';
import { ConstructionConnections } from './ConstructionConnections';
import { ChapterBackdrop } from './ChapterBackdrop';

export const skillHref = `${import.meta.env.BASE_URL}skills/svg-diagram-skill.zip`;
const installCommand = 'npx skills add lwxyfer/justsvg --skill svg-diagram';
const skillGuide = 'https://github.com/lwxyfer/justsvg/tree/main/skills/svg-diagram#直接调用与安装';

export function SkillStage({ theme, edits }: { theme: HomeTheme; edits: DiagramEdits }) {
  const { locale, t } = useHomeLocale();
  const [taskEdit, setTask] = useState<string | null>(null);
  const task = taskEdit ?? t('绘制 RAG 架构图，标明知识索引、检索与生成之间的关系。');
  const [message, setMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const fallback = useRef<HTMLTextAreaElement>(null);
  const installCode = useRef<HTMLElement>(null);
  const [installCopied, setInstallCopied] = useState<boolean | null>(null);
  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setInstallCopied(true);
    } catch {
      if (installCode.current) {
        const range = document.createRange();
        range.selectNodeContents(installCode.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setInstallCopied(false);
    }
  };
  const styleNotes = {
    native: t('简洁的技术文档风格，白底蓝线、原生文字与清晰分组。'),
    figma: t(
      '参考 https://www.figma.com/figjam/ ，采用暖白点阵画布、黄色检索核心、角色色与组件几何。',
    ),
    vercel: t(
      '参考 https://vercel.com/geist/introduction ，采用黑白秩序、文件路径注释与工程线框。',
    ),
    openai: t(
      '参考 https://developers.openai.com/blog/ 的暖色封面，采用珊瑚色域、透明技术平面与细轮廓弧线。',
    ),
  };
  const instruction =
    locale === 'en'
      ? `Use the installed svg-diagram Skill. In the JustSVG repository, read skills/svg-diagram/SKILL.md.\n\n${task}\n\nStyle: ${t(themes[theme].name)}. ${styleNotes[theme]}${theme === 'native' ? '' : `\nIn the JustSVG repository, also read src/examples/prompts/brand-${theme}-rag.md.`}\nPreserve all nine nodes (documents, chunking, embeddings, index, query, retrieval, context, model, answer) and their connections.\nUse English for all diagram text. Keep text and groups editable. Output native SVG, the complete prompt and validation notes.`
      : `请使用已安装的 svg-diagram Skill；在 JustSVG 仓库中可读取 skills/svg-diagram/SKILL.md。\n\n${task}\n\n风格参照：${t(themes[theme].name)}。${styleNotes[theme]}${theme === 'native' ? '' : `\n若在 JustSVG 仓库运行，可补充读取 src/examples/prompts/brand-${theme}-rag.md。`}\n保留文档、切分、编码、索引、查询、检索、上下文、模型、回答九个节点及其关系。\n输出可编辑的原生 SVG、完整生成 Prompt 和检查记录。`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(instruction);
      setMessage('生成指令已复制。粘贴到已安装 SVG Skill 的 AI 工具中运行。');
    } catch {
      setShowPrompt(true);
      setMessage('已选中生成指令，按 ⌘ / Ctrl+C 复制。');
      requestAnimationFrame(() => {
        fallback.current?.focus();
        fallback.current?.select();
      });
    }
  };
  return (
    <section className="skill-chapter chapter" id="skill" aria-labelledby="skill-title">
      <ChapterBackdrop kind="skill" />
      <ConstructionConnections kind="skill-file" />
      <ConstructionConnections kind="task-diagram" />
      <div className="chapter-heading home-width">
        <div>
          <h2 id="skill-title">
            {t('把画图任务')}
            <br className="desktop-break" />
            {t('交给 AI。')}
          </h2>
          <p>{t('安装 SVG Skill 后，将任务复制到你的 AI 工具，生成可编辑的 SVG。')}</p>
        </div>
      </div>
      <div className="skill-install home-width">
        <div>
          <h3>{t('安装 SVG Skill')}</h3>
          <ol>
            <li>{t('在终端运行以下命令，并在提示时选择你的 AI 工具。')}</li>
            <li>{t('在 AI 工具中开启新会话，复制下方绘图任务，请它使用 svg-diagram。')}</li>
          </ol>
        </div>
        <div>
          <div className="skill-install-command">
            <code ref={installCode}>{installCommand}</code>
            <button className="home-text-link" type="button" onClick={() => void copyInstall()}>
              <Copy size={15} aria-hidden="true" />
              {t('复制安装命令')}
            </button>
          </div>
          {installCopied !== null && (
            <p role="status">{t(installCopied ? '安装命令已复制。' : '已选中安装命令，请手动复制。')}</p>
          )}
          <p>{t('也可以解压 ZIP，让 AI 工具直接读取其中的 svg-diagram/SKILL.md。')}</p>
          <div className="skill-install-links">
            <a className="home-text-link" href={skillHref} download>
              {t('下载 SVG Skill')}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
            <a className="home-text-link" href={skillGuide}>
              {t('查看安装指南')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="skill-visual home-width">
        <div className="skill-ticket">
          <div className="skill-chat-agent">
            <FileCode2 size={17} />
            <span>SVG Skill</span>
            <span>{t('AI 绘图任务')}</span>
          </div>
          <div className="skill-composer">
            <label className="home-sr-only" htmlFor="skill-task">
              {t('描述你想画的图')}
            </label>
            <textarea
              id="skill-task"
              value={task}
              maxLength={500}
              onChange={(e) => {
                setTask(e.target.value);
                setMessage('');
              }}
              spellCheck={false}
            />
            <div className="skill-composer-tools">
              <span className="ticket-theme">
                <Palette size={13} />
                {t(themes[theme].name)}
              </span>
              <button
                className="skill-send"
                onClick={() => void copy()}
                aria-label={t('复制生成指令')}
                title={t('复制生成指令')}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
          <span className="skill-chat-hint">{t('复制时会附上所选风格与 SVG 要求。')}</span>
        </div>
        <div className="skill-diagram">
          <NativeDiagram theme={theme} edits={edits} construction variant="skill" />
        </div>
        <div className="skill-file">
          <FileDrawing theme={theme} edits={edits} landscape />
          <ArrowDown size={18} />
        </div>
      </div>
      <div className="skill-caption home-width">
        <p>{t('SVG 生成结果示例')}</p>
        <a href="#editor-demo" className="home-text-link">
          {t('试着修改这张图')}
          <ArrowDown size={15} />
        </a>
      </div>
      <div className="prompt-area home-width">
        <button
          className="home-text-link"
          onClick={() => setShowPrompt(!showPrompt)}
          aria-expanded={showPrompt}
        >
          {showPrompt ? t('收起生成指令') : t('查看生成指令')}
          <ArrowDown size={13} />
        </button>
        {message && <p role="status">{t(message)}</p>}
        {showPrompt && (
          <textarea
            aria-label={t('完整 Skill 任务指令')}
            ref={fallback}
            readOnly
            value={instruction}
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        <span className="skill-honesty">
          {t('这里展示固定示例。请在 AI 工具中运行指令生成新图。')}
        </span>
      </div>
    </section>
  );
}
