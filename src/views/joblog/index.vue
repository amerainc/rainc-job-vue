<template>
  <div class="app-container">
    <!-- 搜索栏 开始-->
    <el-row :gutter="20" class="filter-container">
      <el-col :span="3">
        <el-select v-model="listQuery.jobGroup" @change="FilterSelectHandler">
          <el-option disabled value="">执行器</el-option>
          <el-option v-if="checkPermission(1)" :value="-1" label="全部">
            全部
          </el-option>
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select v-model="listQuery.jobId" @change="FilterSelectHandler">
          <el-option disabled value="">任务</el-option>
          <el-option :value="-1" label="全部">全部</el-option>
          <el-option
            v-for="item in jobList"
            :key="item.id"
            :label="item.jobDesc"
            :value="item.id"
          />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="listQuery.logStatus" @change="FilterSelectHandler">
          <el-option disabled value="" label="状态" />
          <el-option :value="-1" label="全部" />
          <el-option :value="0" label="成功" />
          <el-option :value="1" label="失败" />
          <el-option :value="2" label="进行中" />
        </el-select>
      </el-col>
      <el-col :span="10">
        <el-date-picker
          v-model="filterTime"
          type="datetimerange"
          :picker-options="pickerOptions"
          :editable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
        />
      </el-col>
      <el-col :span="6">
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="FilterSelectHandler"
        >
          搜索
        </el-button>
      </el-col>
    </el-row>
    <!-- 搜索栏 结束-->
    <!-- 表格 开始-->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="任务ID" width="95">
        <template slot-scope="scope">
          <el-link
            type="primary"
            @click="
              showMessage(
                `执行器地址:{executorAddress}<br/>
                JobHandler:{executorHandler}<br/>
                任务参数:{executorParam}<br/>`
                  .replace(
                    '{executorAddress}',
                    scope.row.executorAddress ? scope.row.executorAddress : ''
                  )
                  .replace(
                    '{executorHandler}',
                    scope.row.executorHandler ? scope.row.executorHandler : ''
                  )
                  .replace(
                    '{executorParam}',
                    scope.row.executorParam ? scope.row.executorParam : ''
                  )
              )
            "
          >
            {{ scope.row.jobId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="调度时间">
        <template slot-scope="scope">
          {{ scope.row.triggerTime | formatDate }}
        </template>
      </el-table-column>
      <el-table-column label="调度结果">
        <template slot-scope="scope">
          <el-tag :type="scope.row.triggerCode | codeFilterType">
            {{ scope.row.triggerCode | codeFilterTitle }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="调度备注">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.triggerMsg"
            type="primary"
            @click="showMessage(scope.row.triggerMsg)"
          >
            查看
          </el-link>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="执行时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.handleTime | formatDate }}
        </template>
      </el-table-column>
      <el-table-column label="执行结果" align="center">
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.handleCode != 0"
            :type="scope.row.handleCode | codeFilterType"
          >
            {{ scope.row.handleCode | codeFilterTitle }}
          </el-tag>
          <el-tag v-else :type="scope.row.triggerCode === 200 ? '' : 'info'">
            {{ scope.row.triggerCode === 200 ? "进行中" : "未执行" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行备注">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.handleMsg"
            type="primary"
            @click="showMessage(scope.row.handleMsg)"
          >
            查看
          </el-link>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-dropdown split-button type="primary" @command="handleCommand">
            操作
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="
                  scope.row.triggerCode === 200 && scope.row.handleCode == 0
                "
                :command="{
                  action: 'logkill',
                  params: { id: scope.row.id },
                }"
              >
                终止任务
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格 结束-->
    <!-- 分页 开始-->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
    <!-- 分页 结束-->
    <!-- 表单 开始-->

    <!-- 表单 结束-->
  </div>
</template>

<script>
import { fetchAll as featchGroupList } from '@/api/jobgroup'
import { fetchAll as featchJobList } from '@/api/jobinfo'
import { fetchList, logKill } from '@/api/joblog'
import Pagination from '@/components/Pagination' // 分页
import checkPermission from '@/utils/permission' // 权限控制
export default {
  name: 'JobLog',
  components: { Pagination },
  filters: {
    codeFilterType(code) {
      let ret = ''
      switch (code) {
        case 200:
          ret = 'success'
          break
        case 500:
          ret = 'danger'
          break
        default:
          break
      }
      return ret
    },
    codeFilterTitle(code) {
      let ret = ''
      switch (code) {
        case 200:
          ret = '成功'
          break
        case 500:
          ret = '失败'
          break
        default:
          break
      }
      return ret
    }
  },
  data() {
    return {
      // 列表总数
      total: 0,
      list: null,
      listLoading: true,
      // 列表查询信息
      listQuery: {
        page: 1,
        size: 10,
        // 查询的执行器
        jobGroup: -1,
        jobId: -1,
        logStatus: -1,
        filterTime: ''
      },
      filterTime: [],
      // 表单显示控制
      formState: {
        visiable: false,
        title: ''
      },
      groupList: [],
      jobList: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一小时',
            onClick(picker) {
              const start = new Date()
              const end = new Date()
              start.setTime(start.getTime() - 3600 * 1000)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '今天',
            onClick(picker) {
              const start = new Date()
              const end = new Date()
              start.setTime(start.setHours(0, 0, 0, 0))
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              const end = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              start.setTime(start.setHours(0, 0, 0, 0))
              end.setTime(end.setHours(0, 0, 0, 0))
              end.setTime(end.getTime() - 1)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '本月',
            onClick(picker) {
              const today = new Date()
              const start = new Date(today.getFullYear(), today.getMonth(), 1)
              const end = new Date()
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '上个月',
            onClick(picker) {
              const today = new Date()
              const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
              const end = new Date(today.getFullYear(), today.getMonth(), 1)
              end.setTime(end.getTime() - 1)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
      }
    }
  },
  watch: {
    'listQuery.jobGroup': function(val) {
      this.getJobList(val)
    }
  },
  created() {
    this.getGroupList()
    if (this.$route.query.jobId) {
      this.listQuery.jobId = Number(this.$route.query.jobId)
    }
    if (this.$route.query.jobGroup) {
      this.listQuery.jobGroup = Number(this.$route.query.jobGroup)
    }
    const start = new Date()
    const end = new Date()
    start.setTime(start.setHours(0, 0, 0, 0))
    this.filterTime = [start, end]
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      if (this.filterTime && this.filterTime.length === 2) {
        this.listQuery.filterTime = this.filterTime[0].getTime() + '-' + this.filterTime[1].getTime()
      } else {
        this.listQuery.filterTime = ''
      }
      fetchList(this.listQuery).then(response => {
        this.list = response.content.content
        this.total = response.content.totalElements
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 过滤处理器
    FilterSelectHandler() {
      // 过滤时重置分页信息，并重新获取列表
      this.listQuery.page = 1
      this.getList()
    },
    // 获取执行器列表
    getGroupList() {
      featchGroupList().then(response => {
        this.groupList = response.content
        if (!this.groupList || this.groupList.length === 0) {
          this.$router.push({ path: '/401' })
        }
        if (checkPermission(0) && this.listQuery.jobGroup === -1) { // 如果是普通用户则指定一个执行器
          this.listQuery.jobGroup = this.groupList[0].id
        }
        this.getJobList(this.listQuery.jobGroup)
        // 获取后加载jobinfo列表
        this.getList()
      })
    },
    getJobList(jobGroup) {
      featchJobList({ jobGroup: jobGroup }).then((response) => {
        this.jobList = response.content
      })
    },
    showMessage(message) {
      this.$alert(message, '信息', {
        dangerouslyUseHTMLString: true
      })
    },
    handleCommand(command) {
      const { action, params } = command
      switch (action) {
        case 'logkill':
          logKill(params).then(() => {
            this.$message.success('终止成功')
            setTimeout(() => {
              this.getList()
            }, 1000)
          })
          break
      }
    }
  }
}
</script>
