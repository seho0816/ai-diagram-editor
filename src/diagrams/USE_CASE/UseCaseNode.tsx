import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { UseCaseNode as UseCaseNodeType } from './types';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

function UseCaseNode({ data, selected }: NodeProps<UseCaseNodeType>) {
  return (
    <div
      style={{
        padding: '10px 20px',
        borderRadius: '50%',
        border: selected ? '2px solid #2563eb' : '1.5px solid #333',
        background: '#fff',
        fontSize: '13px',
        textAlign: 'center',
      }}
    >
      {handles.map((h) => (
        <Handle key={h.id} id={h.id} type="source" position={h.position} />
      ))}
      {data.label}
    </div>
  );
}

export default UseCaseNode;