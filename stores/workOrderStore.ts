import { WorkOrder, WorkOrderStatus, OperationTeam, WorkOrderFilter } from '@/types';

const STORAGE_KEY = 'lineguide_work_orders';

class WorkOrderStore {
  private workOrders: WorkOrder[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.workOrders = JSON.parse(stored);
      } else {
      }
    } catch (error) {
      console.error('❌ localStorage 불러오기 실패:', error);
      this.workOrders = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workOrders));
    } catch (error) {
      console.error('❌ localStorage 저장 실패:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getAllWorkOrders(): WorkOrder[] {
    return [...this.workOrders];
  }

  getWorkOrdersByFilter(filter: WorkOrderFilter): WorkOrder[] {
    return this.workOrders.filter(order => {
      if (filter.operationTeam && order.operationTeam !== filter.operationTeam) {
        return false;
      }
      
      if (filter.status && order.status !== filter.status) {
        return false;
      }
      
      if (filter.dateRange) {
        const orderDate = new Date(order.requestDate);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        
        if (orderDate < startDate || orderDate > endDate) {
          return false;
        }
      }

      if (filter.specificDate) {
        const parsedDate = this.parseRequestDate(order.requestDate);
        if (!parsedDate) return false;
        
        const filterDate = new Date(filter.specificDate);
        const orderDateKey = parsedDate.toISOString().split('T')[0];
        const filterDateKey = filterDate.toISOString().split('T')[0];
        
        if (orderDateKey !== filterDateKey) {
          return false;
        }
      }
      
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        const searchableFields = [
          order.managementNumber,
          order.equipmentName,
          order.concentratorName5G,
          order.equipmentType,
          order.serviceType,
          order.duId,
          order.duName,
          order.channelCard,
          order.port,
          order.lineNumber,
          order.category
        ];
        
        if (!searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        )) {
          return false;
        }
      }
      
      return true;
    });
  }

  private parseRequestDate(requestDate: string): Date | null {
    try {
      // "08월06일(수) 내" 형식에서 월과 일 추출
      const match = requestDate.match(/(\d{1,2})월(\d{1,2})일/);
      if (match) {
        const month = parseInt(match[1]) - 1; // JavaScript Date는 0부터 시작
        const day = parseInt(match[2]);
        const year = new Date().getFullYear();
        return new Date(year, month, day);
      }
      return null;
    } catch {
      return null;
    }
  }

  addWorkOrders(orders: Omit<WorkOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>[]): WorkOrder[] {
    
    const newOrders = orders.map(order => ({
      ...order,
      id: this.generateId(),
      status: 'pending' as WorkOrderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));


    this.workOrders.push(...newOrders);
    
    this.saveToStorage();
    this.notifyListeners();
    
    return newOrders;
  }

  updateWorkOrderStatus(id: string, status: WorkOrderStatus, notes?: string): boolean {
    const order = this.workOrders.find(o => o.id === id);
    if (!order) return false;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    if (status === 'completed') {
      order.completedAt = new Date().toISOString();
    }
    
    if (notes !== undefined) {
      order.notes = notes;
    }

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  updateWorkerMemo(id: string, memo: string): boolean {
    const order = this.workOrders.find(o => o.id === id);
    if (!order) return false;

    order.workerMemo = memo;
    order.updatedAt = new Date().toISOString();

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  generateMemoTemplate(workOrder: WorkOrder, type: 'DU' | 'RU'): string {
    const team = type === 'DU' ? workOrder.operationTeam : (workOrder.ruOperationTeam || workOrder.operationTeam);
    
    if (type === 'DU') {
      return `[${team} DU측]
ㅇ 관리번호 : ${workOrder.managementNumber}
ㅇ 국사 명 : ${workOrder.concentratorName5G.replace('(안)', '').replace('(기)', '')}국사
ㅇ RU 광신호 유/무 : 
ㅇ 5G MUX : 
ㅇ 5G TIE 선번 : 
ㅇ 특이사항 : `;
    } else {
      return `[${team} RU측]
ㅇ 관리번호 : ${workOrder.managementNumber}
ㅇ 국사 명 : ${workOrder.concentratorName5G.replace('(안)', '').replace('(기)', '')}국사
ㅇ RU 광신호 유/무 : 
ㅇ 특이사항 : `;
    }
  }

  deleteWorkOrder(id: string): boolean {
    const index = this.workOrders.findIndex(o => o.id === id);
    if (index === -1) return false;

    this.workOrders.splice(index, 1);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  clearAllWorkOrders() {
    this.workOrders = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  getStatistics() {
    const total = this.workOrders.length;
    const pending = this.workOrders.filter(o => o.status === 'pending').length;
    const inProgress = this.workOrders.filter(o => o.status === 'in_progress').length;
    const completed = this.workOrders.filter(o => o.status === 'completed').length;

    const byTeam: Record<OperationTeam, { pending: number; inProgress: number; completed: number }> = {
      '울산T': { pending: 0, inProgress: 0, completed: 0 },
      '동부산T': { pending: 0, inProgress: 0, completed: 0 },
      '중부산T': { pending: 0, inProgress: 0, completed: 0 },
      '서부산T': { pending: 0, inProgress: 0, completed: 0 },
      '김해T': { pending: 0, inProgress: 0, completed: 0 },
      '진주T': { pending: 0, inProgress: 0, completed: 0 },
      '통영T': { pending: 0, inProgress: 0, completed: 0 },
      '창원T': { pending: 0, inProgress: 0, completed: 0 },
      '지하철T': { pending: 0, inProgress: 0, completed: 0 }
    };

    this.workOrders.forEach(order => {
      byTeam[order.operationTeam][order.status === 'in_progress' ? 'inProgress' : order.status]++;
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      byTeam
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

export const workOrderStore = new WorkOrderStore();