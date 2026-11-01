import { useHomeLocale } from './homeLocale';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { BrandIdentity } from '../components/Brand';
import { editorHref, examplesHref } from '../app/routing';
import { skillHref } from './SkillStage';
import { homeRoute } from './homeRoute';
import { FooterMorph } from './FooterMorph';

export function DocumentFooter() {
  const { t } = useHomeLocale();
  return (
    <footer className="document-footer" aria-label={t('SVG 文档的最后一行')}>
      <div className="footer-document home-width">
        <div className="footer-artwork">
          <FooterMorph />
        </div>
        <div className="footer-content">
          <a href="#top" className="footer-brand" aria-label={t('回到首页顶部')}>
            <BrandIdentity />
          </a>
          <p className="footer-tagline">Just diagrams. Just SVG.</p>
          <p className="footer-description">
            {t(
              'JustSVG 是一个开源 SVG 图表编辑器，用于架构图、流程图和信息图。配合 SVG Skill，在 AI 工具中生成，再打开 SVG 继续修改。',
            )}
          </p>
          <nav className="footer-navigation" aria-label={t('底部导航')}>
            <div className="footer-link-group">
              <h3>{t('产品')}</h3>
              <a href={editorHref} onClick={(event) => homeRoute(event, editorHref)}>
                {t('打开编辑器')} <ArrowUpRight size={13} />
              </a>
              <a href="#brand-styles">
                {t('品牌风格')} <ArrowUpRight size={13} />
              </a>
              <a href={examplesHref} onClick={(event) => homeRoute(event, examplesHref)}>
                {t('示例库')} <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="footer-link-group">
              <h3>{t('资源')}</h3>
              <a href={skillHref} download>
                SVG Skill <ArrowUpRight size={13} />
              </a>
              <a href="https://github.com/lwxyfer/justsvg" target="_blank" rel="noreferrer">
                GitHub <ArrowUpRight size={13} />
              </a>
            </div>
          </nav>
          <div className="footer-meta">
            <span>{t('本地编辑 · 无需账号')}</span>
            <a className="back-top" href="#top">
              {t('回到顶部')} <ArrowUp size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
