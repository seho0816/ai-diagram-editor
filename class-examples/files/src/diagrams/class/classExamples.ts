import type { ClassDiagramNode, UmlDiagramEdge, UmlRelationType } from './types';

export type ClassExampleId = 'bbq' | 'department' | 'convenience' | 'library';

export type ClassExampleInfo = {
  id: ClassExampleId;
  title: string;
  description: string;
  purpose: string;
};

export const CLASS_EXAMPLES: readonly ClassExampleInfo[] = [
  {
    id: 'bbq',
    title: '고깃집 주문 관리',
    description: '주문을 중심으로 퍼지는 배치',
    purpose: '고깃집에서 고객, 테이블, 직원, 주문, 메뉴와 별도 결제를 관리하는 시스템',
  },
  {
    id: 'department',
    title: '백화점 매장 관리',
    description: '백화점 → 층 → 매장 계층 구조',
    purpose: '백화점의 층별 매장, 직원, 상품, 고객 구매를 관리하는 시스템',
  },
  {
    id: 'convenience',
    title: '편의점 재고·판매',
    description: '납품부터 판매까지 가로 배치',
    purpose: '편의점 상품 입고, 재고, 판매, 직원 업무를 관리하는 시스템',
  },
  {
    id: 'library',
    title: '도서관 대출 관리',
    description: '대출을 중심으로 좌우 대칭 배치',
    purpose: '도서관 회원의 도서 대출, 예약, 연체료를 관리하는 시스템',
  },
] as const;

type NodeSpec = {
  id: string;
  name: string;
  x: number;
  y: number;
  attributes: string[];
  methods: string[];
};

type Side = 'top' | 'right' | 'bottom' | 'left';
type EdgeSpec = {
  id: string;
  source: string;
  target: string;
  sourceHandle: Side;
  targetHandle: Side;
  relationType?: UmlRelationType;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
};

type ClassExampleSpec = { nodes: NodeSpec[]; edges: EdgeSpec[] };

// 클래스마다 도형의 배치가 다르고, 관계선은 실제 Class UML 렌더러가 이해하는
// relationType 및 source/targetMultiplicity만 사용한다.
const specifications: Record<ClassExampleId, ClassExampleSpec> = {
  bbq: {
    nodes: [
      { id: 'customer', name: 'Customer', x: 30, y: 350, attributes: ['- customerId: Long', '- name: String'], methods: ['+ placeOrder(): void'] },
      { id: 'employee', name: 'Employee', x: 30, y: 25, attributes: ['- employeeId: Long', '- name: String'], methods: ['+ takeOrder(): void'] },
      { id: 'table', name: 'DiningTable', x: 490, y: 25, attributes: ['- tableNo: int', '- seats: int'], methods: ['+ markOccupied(): void'] },
      { id: 'order', name: 'Order', x: 490, y: 355, attributes: ['- orderId: Long', '- orderedAt: Date'], methods: ['+ calculateTotal(): int'] },
      { id: 'item', name: 'OrderItem', x: 900, y: 355, attributes: ['- quantity: int', '- unitPrice: int'], methods: ['+ subtotal(): int'] },
      { id: 'menu', name: 'MenuItem', x: 1270, y: 355, attributes: ['- menuId: Long', '- price: int'], methods: ['+ changePrice(price: int): void'] },
      { id: 'payment', name: 'Payment', x: 490, y: 725, attributes: ['- paymentId: Long', '- amount: int'], methods: ['+ pay(): boolean'] },
    ],
    edges: [
      { id: 'customer-order', source: 'customer', target: 'order', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'employee-order', source: 'employee', target: 'order', sourceHandle: 'bottom', targetHandle: 'top', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'table-order', source: 'table', target: 'order', sourceHandle: 'bottom', targetHandle: 'top', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      // composition marker is attached at target (the whole Order).
      { id: 'item-order', source: 'item', target: 'order', sourceHandle: 'left', targetHandle: 'right', relationType: 'composition', sourceMultiplicity: '1..*', targetMultiplicity: '1' },
      { id: 'item-menu', source: 'item', target: 'menu', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '0..*', targetMultiplicity: '1' },
      { id: 'order-payment', source: 'order', target: 'payment', sourceHandle: 'bottom', targetHandle: 'top', sourceMultiplicity: '1', targetMultiplicity: '0..1' },
    ],
  },
  department: {
    nodes: [
      { id: 'mall', name: 'DepartmentStore', x: 520, y: 20, attributes: ['- storeId: Long', '- name: String'], methods: ['+ getOpeningHours(): String'] },
      { id: 'floor', name: 'Floor', x: 520, y: 280, attributes: ['- floorNo: int', '- label: String'], methods: ['+ listShops(): List'] },
      { id: 'shop', name: 'Shop', x: 520, y: 550, attributes: ['- shopId: Long', '- category: String'], methods: ['+ checkStock(): void'] },
      { id: 'employee', name: 'Employee', x: 40, y: 780, attributes: ['- employeeId: Long', '- name: String'], methods: ['+ serveCustomer(): void'] },
      { id: 'product', name: 'Product', x: 1020, y: 780, attributes: ['- productId: Long', '- price: int'], methods: ['+ updatePrice(): void'] },
      { id: 'customer', name: 'Customer', x: 1020, y: 40, attributes: ['- customerId: Long', '- name: String'], methods: ['+ purchase(): void'] },
      { id: 'sale', name: 'Sale', x: 1020, y: 420, attributes: ['- saleId: Long', '- total: int'], methods: ['+ issueReceipt(): void'] },
    ],
    edges: [
      { id: 'floor-mall', source: 'floor', target: 'mall', sourceHandle: 'top', targetHandle: 'bottom', relationType: 'composition', sourceMultiplicity: '1..*', targetMultiplicity: '1' },
      { id: 'shop-floor', source: 'shop', target: 'floor', sourceHandle: 'top', targetHandle: 'bottom', relationType: 'composition', sourceMultiplicity: '1..*', targetMultiplicity: '1' },
      { id: 'employee-shop', source: 'employee', target: 'shop', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '0..*', targetMultiplicity: '1' },
      { id: 'shop-product', source: 'shop', target: 'product', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'customer-sale', source: 'customer', target: 'sale', sourceHandle: 'bottom', targetHandle: 'top', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'sale-shop', source: 'sale', target: 'shop', sourceHandle: 'left', targetHandle: 'right', sourceMultiplicity: '0..*', targetMultiplicity: '1' },
      { id: 'sale-product', source: 'sale', target: 'product', sourceHandle: 'bottom', targetHandle: 'top', sourceMultiplicity: '0..*', targetMultiplicity: '1..*' },
    ],
  },
  convenience: {
    nodes: [
      { id: 'supplier', name: 'Supplier', x: 20, y: 140, attributes: ['- supplierId: Long', '- name: String'], methods: ['+ ship(): void'] },
      { id: 'delivery', name: 'Delivery', x: 320, y: 140, attributes: ['- deliveryId: Long', '- receivedAt: Date'], methods: ['+ confirmArrival(): void'] },
      { id: 'inventory', name: 'Inventory', x: 620, y: 140, attributes: ['- stockId: Long', '- quantity: int'], methods: ['+ adjustStock(): void'] },
      { id: 'product', name: 'Product', x: 920, y: 140, attributes: ['- barcode: String', '- price: int'], methods: ['+ isExpired(): boolean'] },
      { id: 'sale', name: 'Sale', x: 1220, y: 140, attributes: ['- saleId: Long', '- total: int'], methods: ['+ checkout(): void'] },
      { id: 'customer', name: 'Customer', x: 1220, y: 500, attributes: ['- customerId: Long'], methods: ['+ pay(): boolean'] },
      { id: 'clerk', name: 'Clerk', x: 920, y: 500, attributes: ['- clerkId: Long', '- shift: String'], methods: ['+ scanBarcode(): void'] },
    ],
    edges: [
      { id: 'supplier-delivery', source: 'supplier', target: 'delivery', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'delivery-inventory', source: 'delivery', target: 'inventory', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '0..*', targetMultiplicity: '1' },
      { id: 'product-inventory', source: 'product', target: 'inventory', sourceHandle: 'left', targetHandle: 'right', sourceMultiplicity: '1', targetMultiplicity: '1' },
      { id: 'product-sale', source: 'product', target: 'sale', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '1..*', targetMultiplicity: '0..*' },
      { id: 'customer-sale', source: 'customer', target: 'sale', sourceHandle: 'top', targetHandle: 'bottom', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'clerk-sale', source: 'clerk', target: 'sale', sourceHandle: 'right', targetHandle: 'bottom', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
    ],
  },
  library: {
    nodes: [
      { id: 'library', name: 'Library', x: 550, y: 15, attributes: ['- libraryId: Long', '- name: String'], methods: ['+ findBook(): Book'] },
      { id: 'member', name: 'Member', x: 70, y: 280, attributes: ['- memberId: Long', '- name: String'], methods: ['+ borrow(): void'] },
      { id: 'book', name: 'Book', x: 1040, y: 280, attributes: ['- isbn: String', '- title: String'], methods: ['+ isAvailable(): boolean'] },
      { id: 'loan', name: 'Loan', x: 550, y: 340, attributes: ['- loanId: Long', '- dueDate: Date'], methods: ['+ returnBook(): void'] },
      { id: 'reservation', name: 'Reservation', x: 70, y: 720, attributes: ['- reservationId: Long', '- status: String'], methods: ['+ cancel(): void'] },
      { id: 'fine', name: 'Fine', x: 1040, y: 720, attributes: ['- fineId: Long', '- amount: int'], methods: ['+ settle(): boolean'] },
    ],
    edges: [
      { id: 'book-library', source: 'book', target: 'library', sourceHandle: 'top', targetHandle: 'right', relationType: 'aggregation', sourceMultiplicity: '0..*', targetMultiplicity: '1' },
      { id: 'member-loan', source: 'member', target: 'loan', sourceHandle: 'right', targetHandle: 'left', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'book-loan', source: 'book', target: 'loan', sourceHandle: 'left', targetHandle: 'right', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'member-reservation', source: 'member', target: 'reservation', sourceHandle: 'bottom', targetHandle: 'top', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'loan-fine', source: 'loan', target: 'fine', sourceHandle: 'right', targetHandle: 'top', sourceMultiplicity: '1', targetMultiplicity: '0..1' },
      { id: 'book-reservation', source: 'book', target: 'reservation', sourceHandle: 'bottom', targetHandle: 'right', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
    ],
  },
};

export function createClassExample(
  exampleId: ClassExampleId,
  edgeType = 'umlEdge',
): { info: ClassExampleInfo; nodes: ClassDiagramNode[]; edges: UmlDiagramEdge[] } {
  const info = CLASS_EXAMPLES.find((example) => example.id === exampleId);
  if (!info) throw new Error(`알 수 없는 클래스 예시: ${exampleId}`);
  const spec = specifications[exampleId];
  const prefix = `class-example-${exampleId}-`;
  return {
    info,
    nodes: spec.nodes.map((node) => ({
      id: `${prefix}${node.id}`,
      type: 'classNode',
      position: { x: node.x, y: node.y },
      data: {
        className: node.name,
        attributes: [...node.attributes],
        methods: [...node.methods],
      },
    })),
    edges: spec.edges.map((edge) => ({
      id: `${prefix}${edge.id}`,
      type: edgeType as UmlDiagramEdge['type'],
      source: `${prefix}${edge.source}`,
      target: `${prefix}${edge.target}`,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: {
        relationType: edge.relationType ?? 'association',
        ...(edge.sourceMultiplicity !== undefined ? { sourceMultiplicity: edge.sourceMultiplicity } : {}),
        ...(edge.targetMultiplicity !== undefined ? { targetMultiplicity: edge.targetMultiplicity } : {}),
      },
    })),
  };
}
