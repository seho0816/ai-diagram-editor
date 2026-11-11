import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

export function NoteNode({ data, selected }: NodeProps) {
  const label = (data as { label?: string }).label;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={40}
        lineStyle={{ borderColor: '#2563eb' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 100,
          minHeight: 40,
          padding: '10px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fef9c3',
          border: selected ? '2.5px dashed #2563eb' : '2px dashed #ca8a04',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 700,
          color: '#1e293b',
        }}
      >
        {handles.map((h) => (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.position}
            style={{
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          />
        ))}
        <div>{label || '노트 주석'}</div>
      </div>
    </>
  );
}

export default NoteNode;