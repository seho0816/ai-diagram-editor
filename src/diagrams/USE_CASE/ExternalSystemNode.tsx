import { Handle, Position } from '@xyflow/react';

export function NoteNode({ data }: { data: { label: string } }) {
  return (
    <div style={{ padding: 8, border: '1px dashed #666', background: '#fffdf0', minWidth: 80, fontSize: '12px' }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label || 'Note'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}