import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import type { UseCaseNode as UseCaseNodeType } from './types';

const handles = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
];

function UseCaseNode({ data, selected }: NodeProps<UseCaseNodeType>) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={50}
        lineStyle={{ borderColor: '#1d4ed8' }} // 2026-11-18 스타일
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 100,
          minHeight: 50,
          borderRadius: '50% / 50%',
          backgroundColor: selected ? '#dbeafe' : '#eff6ff', // 2026-11-18 스타일
          border: selected ? '3px solid #1d4ed8' : '2.5px solid #1d4ed8', // 2026-11-18 스타일
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(29, 78, 216, 0.18)', // 2026-11-18 스타일
          position: 'relative',
          boxSizing: 'border-box',
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
        <span
          style={{
            fontSize: '14px', // 2026-11-18 스타일
            fontWeight: 800, // 2026-11-18 스타일
            color: '#0f172a', // 2026-11-18 스타일
            padding: '0 16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {data.label || '유스케이스'}
        </span>
      </div>
    </>
  );
}

export default UseCaseNode;