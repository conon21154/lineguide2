import { BarChart3, Users, Clock, CheckCircle } from 'lucide-react'
import { useWorkOrderStatistics, useWorkOrders } from '@/hooks/useWorkOrders'
import { OperationTeam } from '@/types'

export default function Dashboard() {
  const statistics = useWorkOrderStatistics()
  const { workOrders } = useWorkOrders()
  
  const recentWorkOrders = workOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // 실제 데이터가 있는 운용팀들만 필터링
  const activeTeams = Object.keys(statistics.byTeam).filter(team => {
    const teamStats = statistics.byTeam[team as OperationTeam]
    return teamStats.pending + teamStats.inProgress + teamStats.completed > 0
  }) as OperationTeam[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          작업지시 현황을 한눈에 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  전체 작업
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {statistics.total.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-warning-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  대기중
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {statistics.pending.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-primary-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  진행중
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {statistics.inProgress.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  완료
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {statistics.completed.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            운용팀별 작업 현황
          </h3>
          <div className="space-y-3">
            {activeTeams.length > 0 ? (
              activeTeams
                .sort((a, b) => a.localeCompare(b))
                .map((team) => {
                  const teamStats = statistics.byTeam[team]
                  const teamTotal = teamStats.pending + teamStats.inProgress + teamStats.completed
                  
                  return (
                    <div key={team} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {team}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          총 {teamTotal}건
                        </span>
                      </div>
                      <div className="flex space-x-2 text-xs">
                        <span className="px-2 py-1 bg-warning-100 text-warning-800 rounded">
                          대기 {teamStats.pending}
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded">
                          진행 {teamStats.inProgress}
                        </span>
                        <span className="px-2 py-1 bg-success-100 text-success-800 rounded">
                          완료 {teamStats.completed}
                        </span>
                      </div>
                    </div>
                  )
                })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">운용팀별 작업지시가 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">Excel 파일을 업로드하면 팀별 통계가 표시됩니다</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            최근 업로드된 작업지시
          </h3>
          {recentWorkOrders.length > 0 ? (
            <div className="space-y-3">
              {recentWorkOrders.map((workOrder) => (
                <div key={workOrder.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {workOrder.equipmentName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {workOrder.operationTeam} • {workOrder.requestDate}
                    </div>
                    <div className="text-xs font-mono text-gray-400">
                      {workOrder.managementNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      workOrder.status === 'pending' 
                        ? 'bg-warning-100 text-warning-800'
                        : workOrder.status === 'in_progress'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-success-100 text-success-800'
                    }`}>
                      {workOrder.status === 'pending' ? '대기' : 
                       workOrder.status === 'in_progress' ? '진행중' : '완료'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">업로드된 작업지시가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}