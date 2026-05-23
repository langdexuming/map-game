import {X} from 'lucide-react';
import type {ReactNode} from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({title, onClose, children}: Props) {
  return (
    <aside className="drawer anim-slide-right">
      <div className="drawer-header">
        <h3 className="panel-title">{title}</h3>
        <button type="button" onClick={onClose} className="game-button !p-1.5" aria-label="close">
          <X size={16} />
        </button>
      </div>
      <div className="drawer-body">{children}</div>
    </aside>
  );
}
