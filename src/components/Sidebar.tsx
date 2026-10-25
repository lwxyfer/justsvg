import { Layers as LayersIcon, Shapes, X } from 'lucide-react';
import { useUI } from '../store/ui';
import { InsertPanel } from './InsertPanel';
import { Layers } from './Layers';
import { IconButton } from './shared';
import { documents } from '../app/documents';

export function Sidebar() {
  const ui = useUI();
  return (
    <div className="left-sidebar">
      <nav className="sidebar-heading" aria-label="左侧面板">
        <button
          aria-label="显示插入面板"
          aria-pressed={ui.leftPanel === 'insert'}
          onClick={() => ui.set({ leftPanel: 'insert' })}
        >
          <Shapes size={14} />
          插入
        </button>
        <button
          aria-label="显示图层面板"
          aria-pressed={ui.leftPanel === 'layers'}
          onClick={() => ui.set({ leftPanel: 'layers' })}
        >
          <LayersIcon size={14} />
          图层
        </button>
        <IconButton label="收起左侧面板" onClick={() => ui.set({ leftOpen: false })}>
          <X size={14} />
        </IconButton>
      </nav>
      {ui.leftPanel === 'insert' ? <InsertPanel /> : <Layers key={documents.activeId} />}
    </div>
  );
}
