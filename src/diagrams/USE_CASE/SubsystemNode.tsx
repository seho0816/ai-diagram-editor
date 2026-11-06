import { Handle, Position } from '@xyflow/react';

export function SubsystemNode({ data }: { data: { label: string } }) {
  return (
    <div style={{ padding: 20, border: '2px dashed #3182ce', background: 'rgba(49, 130, 206, 0.05)', minWidth: 200, minHeight: 150 }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{data.label || 'Subsystem'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}