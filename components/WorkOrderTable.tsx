import { useState } from 'react'
import { Clock, User, CheckCircle, Edit3, Trash2, Eye, X, FileText, Copy } from 'lucide-react'
import clsx from 'clsx'
import { WorkOrder, WorkOrderStatus } from '@/types'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { workOrderStore } from '@/stores/workOrderStore'

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
}

const StatusBadge = ({ status }: { status: WorkOrderStatus }) => {
  const statusConfig = {
    pending: {
      label: '대기',
      icon: Clock,
      className: 'bg-warning-100 text-warning-800'
    },
    in_progress: {
      label: '진행중',
      icon: User,
      className: 'bg-primary-100 text-primary-800'
    },
    completed: {
      label: '완료',
      icon: CheckCircle,
      className: 'bg-success-100 text-success-800'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      <Icon className="w-3 h-3 mr-1" />
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
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">RU 정보</h3>
              <div className="space-y-3">
                <div><span className="font-medium text-gray-700">대표 RU ID:</span> {workOrder.representativeRuId || 'N/A'}</div>
                <div><span className="font-medium text-gray-700">5G Co-Site 수량:</span> {workOrder.coSiteCount5G || 'N/A'}</div>
                <div><span className="font-medium text-gray-700">5G 집중국명:</span> {workOrder.concentratorName5G}</div>
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
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">선번장 정보</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">회선번호:</span>
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                  {workOrder.notes?.match(/회선번호: ([^,]+)/)?.[1] || 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">선번장 상세:</span>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-mono text-sm break-all">{workOrder.lineNumber}</div>
                </div>
              </div>
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


const WorkerMemoModal = ({ workOrder, onClose }: { workOrder: WorkOrder, onClose: () => void }) => {
  const [memo, setMemo] = useState(workOrder.workerMemo || '')
  const [selectedTemplate, setSelectedTemplate] = useState<'DU' | 'RU' | ''>('')

  const applyTemplate = (type: 'DU' | 'RU') => {
    const template = workOrderStore.generateMemoTemplate(workOrder, type)
    setMemo(template)
    setSelectedTemplate(type)
  }

  const handleSave = () => {
    workOrderStore.updateWorkerMemo(workOrder.id, memo)
    onClose()
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memo)
    alert('메모가 클립보드에 복사되었습니다.')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">작업자 메모</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => applyTemplate('DU')}
              className={`btn btn-sm ${
                selectedTemplate === 'DU' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              DU측 템플릿
            </button>
            <button
              onClick={() => applyTemplate('RU')}
              className={`btn btn-sm ${
                selectedTemplate === 'RU' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              RU측 템플릿
            </button>
            <button
              onClick={copyToClipboard}
              className="btn btn-sm btn-secondary"
              disabled={!memo}
            >
              <Copy className="w-4 h-4 mr-1" />
              복사
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작업자 메모 ({workOrder.managementNumber})
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="작업자 메모를 입력하거나 템플릿을 선택하세요..."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingStatus, setEditingStatus] = useState<WorkOrderStatus>('pending')
  const [notes, setNotes] = useState('')
  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null)
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null)
  const { updateStatus, deleteWorkOrder } = useWorkOrders()

  const handleEditStart = (workOrder: WorkOrder) => {
    setEditingId(workOrder.id)
    setEditingStatus(workOrder.status)
    setNotes(workOrder.notes || '')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingStatus('pending')
    setNotes('')
  }

  const handleEditSave = async (id: string) => {
    await updateStatus(id, editingStatus, notes)
    handleEditCancel()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('이 작업지시를 삭제하시겠습니까?')) {
      await deleteWorkOrder(id)
    }
  }

  if (workOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          작업지시가 없습니다
        </h3>
        <p className="text-gray-600">
          Excel 파일을 업로드하여 작업지시를 등록하세요
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업요청일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                운용팀
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                장비 정보
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DU 정보
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업자 메모
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workOrders.map((workOrder) => (
              <tr key={workOrder.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-xs break-all">
                    {workOrder.managementNumber}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                  <div className="text-sm text-gray-900 break-all">
                    {workOrder.requestDate}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {workOrder.operationTeam}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="space-y-1">
                    <div><strong>장비명:</strong> {workOrder.equipmentName}</div>
                    <div><strong>5G 집중국:</strong> {workOrder.concentratorName5G}</div>
                    <div><strong>구분:</strong> {workOrder.equipmentType}</div>
                    <div><strong>서비스:</strong> {workOrder.serviceType}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="space-y-1">
                    <div><strong>DU ID:</strong> {workOrder.duId}</div>
                    <div><strong>DU 명:</strong> {workOrder.duName}</div>
                    <div><strong>채널카드:</strong> {workOrder.channelCard}</div>
                    <div><strong>포트:</strong> {workOrder.port}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingId === workOrder.id ? (
                    <div className="space-y-2">
                      <select
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value as WorkOrderStatus)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">대기</option>
                        <option value="in_progress">진행중</option>
                        <option value="completed">완료</option>
                      </select>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="메모 (선택사항)"
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        rows={2}
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditSave(workOrder.id)}
                          className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <StatusBadge status={workOrder.status} />
                      {workOrder.notes && (
                        <div className="text-xs text-gray-500">
                          {workOrder.notes}
                        </div>
                      )}
                      {workOrder.completedAt && (
                        <div className="text-xs text-gray-500">
                          완료: {new Date(workOrder.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                  {workOrder.workerMemo ? (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 truncate">
                        {workOrder.workerMemo.split('\n')[0]}...
                      </div>
                      <button
                        onClick={() => setEditingMemoId(workOrder.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        메모 편집
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingMemoId(workOrder.id)}
                      className="text-xs text-gray-500 hover:text-blue-600 flex items-center"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      메모 작성
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === workOrder.id ? null : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingDetailId(workOrder.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStart(workOrder)}
                        className="text-primary-600 hover:text-primary-900"
                        title="상태 변경"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(workOrder.id)}
                        className="text-danger-600 hover:text-danger-900"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
      
      {editingMemoId && (
        <WorkerMemoModal
          workOrder={workOrders.find(wo => wo.id === editingMemoId)!}
          onClose={() => setEditingMemoId(null)}
        />
      )}
    </div>
  )
}