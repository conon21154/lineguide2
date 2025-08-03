import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { WorkOrder, WorkOrderStatus } from '@/types'

interface SimpleWorkOrderTableProps {
  workOrders: WorkOrder[]
}

const StatusBadge = ({ status }: { status: WorkOrderStatus }) => {
  const statusConfig = {
    pending: {
      label: '대기',
      className: 'bg-yellow-100 text-yellow-800'
    },
    in_progress: {
      label: '진행중',
      className: 'bg-blue-100 text-blue-800'
    },
    completed: {
      label: '완료',
      className: 'bg-red-100 text-red-800'
    }
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

const WorkOrderDetailModal = ({ workOrder, onClose }: { workOrder: WorkOrder, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">작업지시 상세정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">관리번호:</span> 
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                    {workOrder.managementNumber}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">작업요청일:</span>
                  <div className="text-sm mt-1 break-all">
                    {workOrder.requestDate}
                  </div>
                </div>
                <div><span className="font-medium text-gray-700">운용팀:</span> <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{workOrder.operationTeam}</span></div>
                <div><span className="font-medium text-gray-700">상태:</span> <StatusBadge status={workOrder.status} /></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">장비 정보</h3>
              <div className="space-y-3">
                <div><span className="font-medium text-gray-700">장비 타입:</span> {workOrder.equipmentType}</div>
                <div><span className="font-medium text-gray-700">장비명:</span> {workOrder.equipmentName}</div>
                <div><span className="font-medium text-gray-700">종류:</span> {workOrder.category}</div>
                <div><span className="font-medium text-gray-700">서비스 구분:</span> {workOrder.serviceType}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">DU 정보</h3>
              <div className="space-y-3">
                <div><span className="font-medium text-gray-700">DU ID:</span> {workOrder.duId}</div>
                <div><span className="font-medium text-gray-700">DU명:</span> {workOrder.duName}</div>
                <div><span className="font-medium text-gray-700">채널카드:</span> {workOrder.channelCard}</div>
                <div><span className="font-medium text-gray-700">포트:</span> {workOrder.port}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">기타 정보</h3>
              <div className="space-y-3">
                <div><span className="font-medium text-gray-700">5G 집중국명:</span> {workOrder.concentratorName5G}</div>
                <div><span className="font-medium text-gray-700">대표 RU ID:</span> {workOrder.representativeRuId || 'N/A'}</div>
                <div><span className="font-medium text-gray-700">5G Co-Site 수량:</span> {workOrder.coSiteCount5G || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">선번장 정보</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-mono text-sm break-all">{workOrder.lineNumber}</div>
            </div>
          </div>
          
          {workOrder.notes && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">메모</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm">{workOrder.notes}</div>
              </div>
            </div>
          )}
          
          {workOrder.workerMemo && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">작업자 메모</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm whitespace-pre-wrap">{workOrder.workerMemo}</div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">시간 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div><span className="font-medium">생성일:</span> {new Date(workOrder.createdAt).toLocaleString()}</div>
              <div><span className="font-medium">수정일:</span> {new Date(workOrder.updatedAt).toLocaleString()}</div>
              {workOrder.completedAt && (
                <div><span className="font-medium">완료일:</span> {new Date(workOrder.completedAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SimpleWorkOrderTable({ workOrders }: SimpleWorkOrderTableProps) {
  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null)

  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto h-8 w-8 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          선택한 날짜에 작업지시가 없습니다
        </h3>
        <p className="text-xs text-gray-600">
          다른 날짜를 선택해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리번호
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업요청일
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                운용팀
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workOrders.map((workOrder) => (
              <tr key={workOrder.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-sm text-gray-900">
                  <button
                    onClick={() => setViewingDetailId(workOrder.id)}
                    className="font-mono text-xs bg-gray-100 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer break-all text-left"
                  >
                    {workOrder.managementNumber}
                  </button>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="text-xs break-all">
                    {workOrder.requestDate}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {workOrder.operationTeam}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <StatusBadge status={workOrder.status} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setViewingDetailId(workOrder.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="상세보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {viewingDetailId && (
        <WorkOrderDetailModal
          workOrder={workOrders.find(wo => wo.id === viewingDetailId)!}
          onClose={() => setViewingDetailId(null)}
        />
      )}
    </div>
  )
}