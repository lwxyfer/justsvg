import { memo, useSyncExternalStore } from 'react';
import { Layers as LayersIcon, Shapes } from 'lucide-react';
import { useChromeUI } from '../store/ui';
import { InsertPanel } from './InsertPanel';
import { Layers } from './Layers';
import { documents } from '../app/documents';
import { useLocale } from '../i18n/locale';

export const Sidebar = memo(function Sidebar() {
  useSyncExternalStore(documents.subscribe, documents.getSnapshot);
  const ui = useChromeUI();
  const { t } = useLocale();
  return (
    <div className="left-sidebar">
      <nav className="sidebar-heading" aria-label={t('左侧面板')}>
        <button
          aria-label={t('显示插入面板')}
          aria-pressed={ui.leftPanel === 'insert'}
          onClick={() => ui.set({ leftPanel: 'insert' })}
        >
          <Shapes size={14} />
          {t('插入')}
        </button>
        <button
          aria-label={t('显示图层面板')}
          aria-pressed={ui.leftPanel === 'layers'}
          onClick={() => ui.set({ leftPanel: 'layers' })}
        >
          <LayersIcon size={14} />
          {t('图层')}
        </button>
      </nav>
      {ui.leftPanel === 'insert' ? <InsertPanel /> : <Layers key={documents.activeId} />}
    </div>
  );
});
