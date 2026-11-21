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
        lineStyle={{ borderColor: '#1d4ed8' }} // 2026-11-18 스타일
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
          background: '#fef08a', // 2026-11-18 스타일
          border: selected ? '3px dashed #1d4ed8' : '2.5px dashed #ca8a04', // 2026-11-18 스타일
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(202, 138, 4, 0.2)', // 2026-11-18 스타일
          textAlign: 'center',
          fontSize: '14px', // 2026-11-18 스타일
          fontWeight: 800, // 2026-11-18 스타일
          color: '#0f172a', // 2026-11-18 스타일
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
        <div>{label || '노트 주석'}</div>
      </div>
    </>
  );
}

export default NoteNode;