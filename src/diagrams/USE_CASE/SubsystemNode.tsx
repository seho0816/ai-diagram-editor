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
        lineStyle={{ borderColor: '#1d4ed8' }} // 2026-11-18 스타일
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
          border: selected ? '3px dashed #1d4ed8' : '2.5px dashed #2563eb', // 2026-11-18 스타일
          borderRadius: '10px', // 2026-11-18 스타일
          background: selected ? '#bfdbfe' : '#dbeafe', // 2026-11-18 스타일
        }}
      >
        {handles.map((h) => (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={h.position}
            style={{
              background: '#1d4ed8', // 2026-11-18 스타일
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          />
        ))}
        <div
          style={{
            fontWeight: 800, // 2026-11-18 스타일
            fontSize: '16px', // 2026-11-18 스타일
            color: '#0f172a', // 2026-11-18 스타일
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