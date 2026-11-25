import type { DiagramNode, DiagramEdge } from '../../types/diagram';

// 2026-11-18 추가: 유스케이스 자동 정렬 (유스케이스 폴더 안에서만 관리)
type AnyNode = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

const UC_X = 360;
const UC_W = 150;
const UC_H = 75;
const GAP = 110;
const TOP = 90;
const LEFT_X = 60;
const RIGHT_X = 680;
const ACTOR_H = 100;

export function autoLayoutUseCase(
  nodes: DiagramNode[],
  edges: DiagramEdge[]
): DiagramNode[] {
  const list = nodes as unknown as AnyNode[];
  const useCases = list.filter((n) => n.type === 'useCaseNode');
  const actors = list.filter((n) => n.type === 'actorNode');
  const boundary = list.find((n) => n.type === 'boundaryNode');

  if (useCases.length === 0) return nodes;

  const placed = new Map<string, { x: number; y: number }>();

  // 유스케이스: 현재 y 순서를 유지하며 세로로 정렬
  const sortedUc = [...useCases].sort((a, b) => a.position.y - b.position.y);
  sortedUc.forEach((uc, i) => {
    placed.set(uc.id, { x: UC_X, y: TOP + i * GAP });
  });

  // 액터: 연결된 유스케이스의 평균 높이에 맞추고, 연결이 많은 쪽을 왼쪽에 둠
  const ucIds = new Set(useCases.map((u) => u.id));
  const links = (actorId: string) =>
    (edges as unknown as { source: string; target: string }[])
      .filter((e) => e.source === actorId || e.target === actorId)
      .map((e) => (e.source === actorId ? e.target : e.source))
      .filter((id) => ucIds.has(id));

  const sortedActors = [...actors].sort(
    (a, b) => links(b.id).length - links(a.id).length
  );
  const half = Math.ceil(sortedActors.length / 2);
  sortedActors.forEach((actor, i) => {
    const targets = links(actor.id);
    const ys = targets.map((id) => (placed.get(id)?.y ?? TOP) + UC_H / 2);
    const centerY = ys.length
      ? ys.reduce((s, y) => s + y, 0) / ys.length
      : TOP + (UC_H * sortedUc.length) / 2;
    placed.set(actor.id, {
      x: i < half ? LEFT_X : RIGHT_X,
      y: Math.round(centerY - ACTOR_H / 2),
    });
  });

  // 같은 쪽에 있는 액터끼리 겹치면 아래로 밀기
  [LEFT_X, RIGHT_X].forEach((x) => {
    const side = sortedActors
      .filter((a) => placed.get(a.id)?.x === x)
      .sort((a, b) => placed.get(a.id)!.y - placed.get(b.id)!.y);
    for (let i = 1; i < side.length; i++) {
      const prev = placed.get(side[i - 1].id)!;
      const cur = placed.get(side[i].id)!;
      if (cur.y < prev.y + ACTOR_H + 20) cur.y = prev.y + ACTOR_H + 20;
    }
  });

  const boundaryHeight = (sortedUc.length - 1) * GAP + UC_H + 90;

  return list.map((n) => {
    if (n.type === 'boundaryNode' && boundary) {
      return {
        ...n,
        position: { x: UC_X - 60, y: TOP - 50 },
        style: { ...(n.style ?? {}), width: UC_W + 120, height: boundaryHeight },
      };
    }
    const pos = placed.get(n.id);
    return pos ? { ...n, position: pos } : n;
  }) as unknown as DiagramNode[];
}