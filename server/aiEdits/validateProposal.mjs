const CLASS_RELATIONS = new Set(['association', 'generalization', 'aggregation', 'composition', 'dependency']);
const FLOW_RELATIONS = new Set(['flow', 'yes', 'no']);
const USECASE_RELATIONS = new Set(['association', 'include', 'extend', 'generalization']);
const USECASE_NODES = new Set(['actorNode', 'useCaseNode', 'boundaryNode', 'subsystem', 'externalSystem', 'note']);
const CONNECTABLE_USECASE_NODES = new Set(['actorNode', 'useCaseNode', 'subsystem', 'externalSystem', 'note']);
const SHAPES = new Set(['startEnd', 'process', 'decision', 'inputOutput']);

// Safety rules apply only to AI proposals, never to the user's freehand editing.
// Keep actor-related and use-case-related relationships semantically distinct.
function isUseCaseRelationPair(relationType, sourceType, targetType) {
  const isActor = (type) => type === 'actorNode' || type === 'externalSystem';
  if (relationType === 'association') {
    return (isActor(sourceType) && targetType === 'useCaseNode') ||
      (sourceType === 'useCaseNode' && isActor(targetType));
  }
  if (relationType === 'include' || relationType === 'extend') {
    return sourceType === 'useCaseNode' && targetType === 'useCaseNode';
  }
  if (relationType === 'generalization') {
    return (sourceType === 'actorNode' && targetType === 'actorNode') ||
      (sourceType === 'useCaseNode' && targetType === 'useCaseNode');
  }
  return false;
}

// Explicit business rules must come from user-authored purpose or diagram notes,
// not from model-written analysis. A title or node name alone is not evidence.
function hasBusinessRuleEvidence(quote, purpose, nodes, businessRule = '') {
  const normalized = (value) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  const evidence = normalized(quote);
  // Short replies such as "후불" count; still require an exact user-authored quote.
  if (!evidence || !/(반드시|필수|항상|매번|선택|조건|경우|때만|별도|나중|불필요|독립|이후|이전에|가능|해야|하지 않는다|후불|선불.{0,8}(?:아님|아니|않|안)|must|always|optional|only if|when)/i.test(evidence)) return false;
  const statements = [purpose, businessRule, ...nodes.filter((node) => node.type === 'note').flatMap((node) =>
    [node.data?.label, node.data?.text, node.data?.content])];
  return statements.some((value) => normalized(value).includes(evidence));
}

function statesSeparateFlow(quote) {
  return /(별도|독립|따로|분리|주문.{0,20}(?:완료|끝난|끝내).{0,20}(?:후|결제)|separate|independent)/i.test(quote ?? '');
}

function supportsConditionalExtension(quote) {
  return /(조건|특정|경우|때만|선택|optional|only if|when)/i.test(quote ?? '');
}

function attributeToken(value) {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ')
    : '';
}

const ALL_FIELDS = [
  'kind', 'targetId', 'tempId', 'source', 'target', 'className', 'label',
  'shape', 'relationType', 'sourceMultiplicity', 'targetMultiplicity',
];

function shortText(value, maxLength = 300) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
function textLines(value) {
  return Array.isArray(value) && value.length <= 30 && value.every((item) => typeof item === 'string')
    ? value.map((item) => shortText(item, 200))
    : null;
}

// The AI may remove at most one CLASS/FLOWCHART edge per proposal.
// An edge is removable only when it is provably redundant or the chosen issue
// explicitly identifies that edge and asks for its removal. This does not
// constrain a user's freehand editing.
function canRemoveClassFlowEdge(edge, edges, diagramType, issue) {
  const requiredType = diagramType === 'CLASS' ? 'classUmlEdge' : 'flowchartEdge';
  if (!edge || edge.type !== requiredType) return false;
  const action = `${issue?.title ?? ''} ${issue?.suggestion ?? ''}`;
  const issueTargetsRemoval = issue?.targetId === edge.id &&
    /(제거|삭제|지우|없애|중복|불필요|remove|delete|redundant|duplicate)/i.test(action);
  const redundant = edges.some((other) => {
    if (other.id === edge.id || other.type !== requiredType ||
        other.data?.relationType !== edge.data?.relationType) return false;
    const sameDirection = edge.source === other.source && edge.target === other.target;
    if (diagramType === 'FLOWCHART') {
      return sameDirection && JSON.stringify(edge.data ?? {}) === JSON.stringify(other.data ?? {});
    }
    const reverseAssociation = edge.data?.relationType === 'association' &&
      edge.source === other.target && edge.target === other.source;
    if (!sameDirection && !reverseAssociation) return false;
    const multiplicity = (record, side) => record?.data?.[side] ?? '';
    return sameDirection
      ? multiplicity(edge, 'sourceMultiplicity') === multiplicity(other, 'sourceMultiplicity') &&
          multiplicity(edge, 'targetMultiplicity') === multiplicity(other, 'targetMultiplicity')
      : multiplicity(edge, 'sourceMultiplicity') === multiplicity(other, 'targetMultiplicity') &&
          multiplicity(edge, 'targetMultiplicity') === multiplicity(other, 'sourceMultiplicity');
  });
  return issueTargetsRemoval || redundant;
}

// Model output is untrusted. Invalid or unsupported operations are discarded.
export function normalizeAiEditProposal(raw, { diagramType, purpose = '', businessRule = '', nodes, edges, issue = null }) {
  const nodeType = diagramType === 'CLASS' ? 'classNode' : 'flowchartNode';
  const isUseCase = diagramType === 'USE_CASE';
  const edgeType = diagramType === 'CLASS' ? 'classUmlEdge' : isUseCase ? 'umlEdge' : 'flowchartEdge';
  const relations = diagramType === 'CLASS' ? CLASS_RELATIONS : isUseCase ? USECASE_RELATIONS : FLOW_RELATIONS;
  const knownNodes = new Map(nodes.map((node) => [node.id, node.type]));
  const nodeData = new Map(nodes.map((node) => [node.id, node.data]));
  const knownEdges = new Map(edges.map((edge) => [edge.id, edge.type]));
  const edgeDetails = new Map(edges.map((edge) => [edge.id, edge]));
  const aliases = new Set();
  const aliasShapes = new Map();
  const operations = [];

  for (const rawOperation of (Array.isArray(raw?.operations) ? raw.operations : []).slice(0, 4)) {
    if (!rawOperation || typeof rawOperation !== 'object' ||
      !ALL_FIELDS.every((field) => typeof rawOperation[field] === 'string')) continue;
    const attrs = textLines(rawOperation.attributes);
    const methods = textLines(rawOperation.methods);
    const removeAttributes = textLines(rawOperation.removeAttributes ?? []);
    if (attrs === null || methods === null || removeAttributes === null || removeAttributes.length > 5) continue;
    const op = {
      kind: rawOperation.kind,
      targetId: shortText(rawOperation.targetId, 100),
      tempId: shortText(rawOperation.tempId, 100),
      source: shortText(rawOperation.source, 100),
      target: shortText(rawOperation.target, 100),
      className: shortText(rawOperation.className, 160),
      attributes: attrs,
      removeAttributes,
      methods,
      label: shortText(rawOperation.label, 160),
      shape: shortText(rawOperation.shape, 40),
      relationType: shortText(rawOperation.relationType, 40),
      evidence: shortText(rawOperation.evidence, 300),
      sourceMultiplicity: shortText(rawOperation.sourceMultiplicity, 20),
      targetMultiplicity: shortText(rawOperation.targetMultiplicity, 20),
    };
    if (op.kind === 'ADD_NODE') {
      if (!/^new:[a-zA-Z0-9_-]{1,32}$/.test(op.tempId) ||
        aliases.has(op.tempId) || knownNodes.has(op.tempId)) continue;
      if (diagramType === 'CLASS' && !op.className) continue;
      if (diagramType === 'FLOWCHART' && (!op.label || !SHAPES.has(op.shape))) continue;
      if (isUseCase && (!op.label || !USECASE_NODES.has(op.shape))) continue;
      if (op.removeAttributes.length) continue;
      aliases.add(op.tempId);
      if (isUseCase) aliasShapes.set(op.tempId, op.shape);
    } else if (op.kind === 'UPDATE_NODE') {
      const existingNodeType = knownNodes.get(op.targetId);
      if (isUseCase ? !USECASE_NODES.has(existingNodeType) : existingNodeType !== nodeType) continue;
      if (diagramType === 'CLASS') {
        if (!op.className) continue;
        const existing = nodeData.get(op.targetId)?.attributes;
        if (op.removeAttributes.length && !Array.isArray(existing)) continue;
        const available = new Set((Array.isArray(existing) ? existing : []).map(attributeToken));
        if (op.removeAttributes.some((attr) => !available.has(attributeToken(attr)))) continue;
      }
      if (diagramType === 'FLOWCHART' && (!op.label || !SHAPES.has(op.shape) || op.removeAttributes.length)) continue;
      if (isUseCase && (!op.label || (op.shape && op.shape !== existingNodeType) || op.removeAttributes.length)) continue;
    } else if (op.kind === 'ADD_EDGE') {
      if (op.removeAttributes.length) continue;
      const validNode = (id) => isUseCase
        ? CONNECTABLE_USECASE_NODES.has(knownNodes.get(id)) || (aliases.has(id) && CONNECTABLE_USECASE_NODES.has(aliasShapes.get(id)))
        : knownNodes.get(id) === nodeType || aliases.has(id);
      if (!validNode(op.source) || !validNode(op.target) || !relations.has(op.relationType)) {
        if (isUseCase) return { description: '잘못된 유스케이스 연결을 포함한 전체 수정안을 보류했습니다.', operations: [] };
        continue;
      }
      if (isUseCase && op.source === op.target) return { description: '동일한 요소를 자기 자신에게 연결하는 AI 수정안은 보류했습니다.', operations: [] };
      if (isUseCase) {
        const sourceType = knownNodes.get(op.source) ?? aliasShapes.get(op.source);
        const targetType = knownNodes.get(op.target) ?? aliasShapes.get(op.target);
        if (!isUseCaseRelationPair(op.relationType, sourceType, targetType)) {
          return {
            description: 'AI가 UML 의미에 맞지 않는 관계선 추가를 제안했습니다. 연결 대상과 관계 종류를 수동으로 확인해 주세요.',
            operations: [],
          };
        }
        // Change an existing relation using UPDATE_EDGE instead of adding parallel lines.
        const alreadyConnected = edges.some((edge) => edge.type === 'umlEdge' &&
          ((edge.source === op.source && edge.target === op.target) ||
           (edge.source === op.target && edge.target === op.source)));
        if (alreadyConnected) return {
          description: '이미 연결된 두 요소는 새 관계선을 중복 추가하지 않고 기존 선을 수정해야 합니다.', operations: [],
        };
      }
    } else if (op.kind === 'REMOVE_EDGE') {
      if (diagramType === 'CLASS' || diagramType === 'FLOWCHART') {
        const edge = edgeDetails.get(op.targetId);
        const unusedFieldsAreEmpty = !op.tempId && !op.source && !op.target &&
          !op.relationType && op.removeAttributes.length === 0;
        if (!unusedFieldsAreEmpty || operations.some((item) => item.kind === 'REMOVE_EDGE') ||
            !canRemoveClassFlowEdge(edge, edges, diagramType, issue)) {
          return { description: '제거할 관계선을 안전하게 확인하지 못했습니다. 해당 관계선을 직접 선택하거나 다시 분석해 주세요.', operations: [] };
        }
        operations.push(op);
        continue;
      }
      // Only remove an existing include/extend link between two use cases.
      // No node deletion, no arbitrary edge deletion, and no ungrounded changes.
      if (!isUseCase || op.removeAttributes.length) continue;
      const edge = edgeDetails.get(op.targetId);
      if (!edge || edge.type !== 'umlEdge' ||
          !['include', 'extend'].includes(edge.data?.relationType) ||
          knownNodes.get(edge.source) !== 'useCaseNode' ||
          knownNodes.get(edge.target) !== 'useCaseNode' ||
          !hasBusinessRuleEvidence(op.evidence, purpose, nodes, businessRule) ||
          !statesSeparateFlow(op.evidence)) {
        return {
          description: '관계를 제거하려면 두 업무가 별도로 진행된다는 근거가 필요합니다. 예: 주문을 마친 후 결제는 별도로 진행합니다.',
          operations: [],
        };
      }
    } else if (op.kind === 'UPDATE_EDGE') {
      if (op.removeAttributes.length) continue;
      if (knownEdges.get(op.targetId) !== edgeType || !relations.has(op.relationType)) {
        if (isUseCase) return { description: '존재하지 않는 유스케이스 관계선을 수정하려 해 전체 수정안을 보류했습니다.', operations: [] };
        continue;
      }
      if (isUseCase) {
        const edge = edgeDetails.get(op.targetId);
        if (!edge) continue;
        // UPDATE_EDGE may only keep the original ends or reverse them, never rewire to other nodes.
        const noEndpointChange = (op.source === '' && op.target === '') ||
          (op.source === edge.source && op.target === edge.target);
        const reversed = op.source === edge.target && op.target === edge.source && edge.source !== edge.target;
        if (!noEndpointChange && !reversed) return {
          description: 'AI가 관계선을 다른 요소로 임의 연결하려 했습니다. 기존 두 요소의 방향 변경만 허용합니다.', operations: [],
        };
        const sourceId = reversed ? edge.target : edge.source;
        const targetId = reversed ? edge.source : edge.target;
        if (sourceId === targetId || !isUseCaseRelationPair(
          op.relationType, knownNodes.get(sourceId), knownNodes.get(targetId)
        )) return {
          description: '연결 대상에 적합하지 않은 관계 종류를 제안했습니다. 액터-유스케이스는 association, 유스케이스끼리는 include/extend 등을 검토해 주세요.', operations: [],
        };
        const original = edge.data?.relationType;
        const twoCases = knownNodes.get(sourceId) === 'useCaseNode' && knownNodes.get(targetId) === 'useCaseNode';
        // Protect decisions that depend on business rules, while allowing obvious
        // structural fixes such as actor-to-use-case include -> association.
        const needsRule = reversed || (twoCases && original !== op.relationType &&
          (original === 'include' || original === 'extend' || op.relationType === 'include' || op.relationType === 'extend'));
        if (needsRule && (!hasBusinessRuleEvidence(op.evidence, purpose, nodes, businessRule) ||
          (twoCases && op.relationType === 'extend' && !supportsConditionalExtension(op.evidence)))) return {
          description: '이 관계를 안전하게 바꾸려면 실제 업무 규칙이 필요합니다. 예를 들어 결제가 반드시 필요한지, 어떤 조건에서 진행되는지 아래에서 알려주세요.',
          operations: [],
        };
      }
    } else {
      continue;
    }
    operations.push(op);
  }

  return {
    description: shortText(raw?.description, 500) || '수정할 수 있는 부분을 검토했습니다.',
    operations,
  };
}
