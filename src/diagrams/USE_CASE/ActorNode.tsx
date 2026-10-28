import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActorNode as ActorNodeType } from './types';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

function ActorNode({ data, selected }: NodeProps<ActorNodeType>) {
  return (
    <div className={`uml-actor-node ${selected ? 'selected' : ''}`} style={{ textAlign: 'center', padding: '8px' }}>
      {handles.map((h) => (
        <Handle key={h.id} id={h.id} type="source" position={h.position} />
      ))}
      <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" strokeWidth="2">
        <circle cx="12" cy="6" r="4" />
        <path d="M12 10v7M7 13h10M9 21l3-4 3 4" />
      </svg>
      <div style={{ fontSize: '12px', fontWeight: 600 }}>{data.label}</div>
    </div>
  );
}

export default ActorNode;