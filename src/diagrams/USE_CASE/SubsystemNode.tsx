import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

export function SubsystemNode({ data, selected }: NodeProps) {
  const label = (data as { label?: string }).label;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        lineStyle={{ borderColor: '#2563eb' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 200,
          minHeight: 150,
          boxSizing: 'border-box',
          padding: 20,
          border: selected ? '2.5px dashed #2563eb' : '2px dashed #3182ce',
          borderRadius: '8px',
          background: selected
            ? 'rgba(37, 99, 235, 0.10)'
            : 'rgba(49, 130, 206, 0.05)',
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
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#1e293b',
            marginBottom: 10,
          }}
        >
          {label || '서브시스템'}
        </div>
      </div>
    </>
  );
}

export default SubsystemNode;