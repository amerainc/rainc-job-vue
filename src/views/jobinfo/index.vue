<template>
  <div class="app-container">
    <!-- 搜索栏 开始 -->
    <el-row :gutter="20" class="filter-container">
      <el-col :span="3">
        <el-select v-model="listQuery.jobGroup" @change="FilterSelectHandler">
          <el-option disabled value="-1">执行器</el-option>
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select
          v-model="listQuery.triggerStatus"
          @change="FilterSelectHandler"
        >
          <el-option
            v-for="item in triggerStatusGroup"
            :key="item.status"
            :label="item.title"
            :value="item.status"
          />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-input v-model="listQuery.jobDesc" placeholder="请输入任务描述" />
      </el-col>
      <el-col :span="4">
        <el-input
          v-model="listQuery.executorHandler"
          placeholder="请输入JobHandler"
        />
      </el-col>
      <el-col :span="4">
        <el-input v-model="listQuery.author" placeholder="请输入负责人" />
      </el-col>
      <el-col :span="5">
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="FilterSelectHandler"
        >
          搜索
        </el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" @click="handleAddBtn"> 新增 </el-button>
      </el-col>
    </el-row>
    <!-- 搜索栏 结束 -->
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
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="任务描述">
        <template slot-scope="scope">
          {{ scope.row.jobDesc }}
        </template>
      </el-table-column>
      <el-table-column label="运行模式">
        <template slot-scope="scope">
          <span>{{ scope.row.executorHandler }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Cron" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.jobCron }}
        </template>
      </el-table-column>
      <el-table-column label="负责人" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.author }}
        </template>
      </el-table-column>
      <el-table-column
        class-name="status-col"
        label="状态"
        width="110"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.triggerStatus | statusFilter">
            {{ scope.row.triggerStatus ? "运行" : "停止" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-dropdown split-button type="primary" @command="handleCommand">
            操作
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="{
                  action: 'trigger',
                  params: scope.row.id,
                }"
              >
                执行一次
              </el-dropdown-item>
              <el-dropdown-item
                :command="{
                  action: 'log',
                  params: scope.row.id,
                }"
              >
                查询日志
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :command="{
                  action: 'status',
                  params: {
                    id: scope.row.id,
                    triggerStatus: scope.row.triggerStatus ? 'stop' : 'start',
                  },
                }"
              >
                {{ scope.row.triggerStatus ? "停止" : "启动" }}
              </el-dropdown-item>
              <el-dropdown-item
                :command="{
                  action: 'edit',
                  params: scope.row,
                }"
              >
                修改
              </el-dropdown-item>
              <el-dropdown-item
                :command="{
                  action: 'remove',
                  params: scope.row.id,
                }"
              >
                删除
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
    <!-- 表单 -->
    <el-dialog
      :title="formState.title"
      :visible.sync="formState.visiable"
      width="870px"
      @close="handleDialogClose('form')"
    >
      <el-form ref="form" :model="form" :rules="formRules" label-width="110px">
        <!-- 第一行 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="执行器" prop="jobGroup">
              <el-select v-model="form.jobGroup" style="width: 100%">
                <el-option
                  v-for="item in groupList"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务描述" prop="jobDesc">
              <el-input v-model="form.jobDesc" placeholder="请输入任务描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第二行 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="路由策略" prop="executorRouteStrategy">
              <el-select
                v-model="form.executorRouteStrategy"
                style="width: 100%"
              >
                <el-option
                  v-for="(value, key) in executorRouteStrategyMap"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron" prop="jobCron">
              <cron-input
                v-model="form.jobCron"
                @change="changeCron"
                @reset="resetCron"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第三行 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="阻塞处理策略" prop="executorBlockStrategy">
              <el-select
                v-model="form.executorBlockStrategy"
                style="width: 100%"
              >
                <el-option
                  v-for="(value, key) in executorBlockStrategyMap"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Handler" prop="executorHandler">
              <el-autocomplete
                v-model="form.executorHandler"
                style="width: 100%"
                :fetch-suggestions="querySearch"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第四行 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务超时时间" prop="executorTimeOut">
              <el-input
                v-model="form.executorTimeOut"
                placeholder="任务超时时间，单位秒，大于0生效"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失败重试次数" prop="executorFailRetryCount">
              <el-input
                v-model="form.executorFailRetryCount"
                placeholder="失败重试次数，大于0生效"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第五行 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="author">
              <el-input v-model="form.author" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警邮箱" prop="alarmEmail">
              <el-input
                v-model="form.alarmEmail"
                placeholder="请输入报警邮箱，多地址逗号分隔"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务参数" prop="executorParam">
          <el-input
            v-model="form.executorParam"
            placeholder="请输入任务参数"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="formState.visiable = false"> 取 消 </el-button>
        <el-button type="primary" @click="handleSubmit('form')">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, status, trigger, fetchBlockStrategy, fetchRouterStrategy, fetchHandlers, add, update, remove } from '@/api/jobinfo'
import { fetchAll as featchGroupList } from '@/api/jobgroup'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import CronInput from 'vue-cron-generator/src/components/cron-input'
export default {
  name: 'JobInfo',
  components: { Pagination, CronInput },
  filters: {
    // 状态样式
    statusFilter(status) {
      return status ? 'success' : 'info'
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
        jobGroup: '',
        // 查询的触发状态 -1全部 0停止 1运行
        triggerStatus: -1,
        jobDesc: '',
        executorHandler: '',
        author: ''
      },
      // 执行器列表
      groupList: null,
      // 任务触发状态
      triggerStatusGroup: [{
        status: -1,
        title: '全部'
      }, {
        status: 0,
        title: '停止'
      }, {
        status: 1,
        title: '运行'
      }],
      form: null,
      DEFAULT_FORM: {
        jobGroup: null, // 执行器
        jobDesc: '', // 任务描述
        executorRouteStrategy: 'FIRST', // 路由策略
        jobCron: '* * * * * ?', // cron表达式
        executorHandler: '', // 执行器handler
        executorBlockStrategy: 'SERIAL_EXECUTION', // 阻塞策略
        executorTimeOut: null, // 任务超时时间
        executorFailRetryCount: null, // 失败重试次数
        author: '', // 负责人
        alarmEmail: '', // 报警邮箱
        executorParam: '' // 执行器任务参数
      },
      isEdit: false,
      formRules:
      {
        jobGroup: [{ required: true, message: '请选择执行器', trigger: 'change' }],
        executorRouteStrategy: [{ required: true, message: '请选择路由策略', trigger: 'change' }],
        executorBlockStrategy: [{ required: true, message: '请选择阻塞策略', trigger: 'change' }],
        jobDesc: [{ required: true, message: '任务描述不能为空', trigger: 'change' }],
        author: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        jobCron: [{ required: true, message: 'Cron表达式不能为空', trigger: 'change' }],
        executorHandler: [{ required: true, message: 'JobHandler不能为空', trigger: 'change' }]
      },
      // 表单显示控制
      formState: {
        visiable: false,
        title: ''
      },
      cronPopover: false,
      executorBlockStrategyMap: null,
      executorRouteStrategyMap: null,
      handlerList: null
    }
  },
  watch: {
    'form.jobGroup': function(value) {
      if (value != null) {
        fetchHandlers(value).then(response => {
          this.handlerList = response.content
        }).catch(() => {
          this.handlerList = null
        })
      }
    }
  },
  created() {
    this.getGroupList()
    this.getStrategy()
    this.form = Object.assign({}, this.DEFAULT_FORM)
  },
  methods: {
    // 获取jobinfo列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.content.content
        this.total = response.content.totalElements
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 获取执行器列表
    getGroupList() {
      featchGroupList().then(response => {
        this.groupList = response.content
        if (!this.groupList || this.groupList.length === 0) {
          this.$router.push({ path: '/401' })
        }
        this.listQuery.jobGroup = this.groupList[0].id
        this.DEFAULT_FORM.jobGroup = this.groupList[0].id
        // 获取后加载jobinfo列表
        this.getList()
      })
    },
    // 获取策略信息
    getStrategy() {
      fetchBlockStrategy().then(response => {
        this.executorBlockStrategyMap = response.content
      })
      fetchRouterStrategy().then(response => {
        this.executorRouteStrategyMap = response.content
      })
    },
    // 过滤处理器
    FilterSelectHandler() {
      // 过滤时重置分页信息，并重新获取列表
      this.listQuery.page = 1
      this.getList()
    },
    // 命令控制信息
    handleCommand(command) {
      const { action, params } = command
      switch (action) {
        // 修改触发状态
        case 'status':
          status(params).then(() => {
            this.getList()
          })
          break
        case 'edit':
          // 修改信息
          this.handleEdit(params)
          break
        case 'remove':
          // 删除信息
          this.handleDelete(params)
          break
        case 'trigger':
          // 触发一次
          trigger(params).then(() => {
            this.$message(
              {
                message: '触发成功',
                type: 'success'
              })
          }).catch(() => {
            this.$message.error('触发失败')
          }
          )
          break
        case 'log':
          this.$router.push({ path: '/joblog/index', query: { jobId: params, jobGroup: this.listQuery.jobGroup } })
          break
      }
    },
    handleDelete(id) {
      this.$confirm('确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        remove(id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(() => {
          this.$message.success('删除失败')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 表单相关
    handleAddBtn() {
      this.form = Object.assign({}, this.DEFAULT_FORM)
      this.isEdit = false
      this.formState.title = '新增'
      this.formState.visiable = true
    },
    handleEdit(data) {
      this.formState.title = '修改'
      this.isEdit = true
      this.formState.visiable = true
      this.form = Object.assign({}, data)
    },
    handleSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isEdit) {
            update(this.form).then(() => {
              this.$message.success('修改成功')
              this.getList()
              this.formState.visiable = false
              return true
            }).catch(() => {
              this.$message.fail('修改失败')
              return false
            })
          } else {
            add(this.form).then(() => {
              this.$message.success('新增成功')
              this.getList()
              this.formState.visiable = false
              return true
            }).catch(() => {
              this.$message.fail('新增失败')
              return false
            })
          }
        } else {
          return false
        }
      })
    },
    // 输入提示
    querySearch(queryString, cb) {
      if (this.handlerList == null) {
        cb(results)
      } else {
        var handlerList = this.handlerList.map(item => {
          return { value: item }
        })
        var results = queryString ? handlerList.filter(this.createFilter(queryString)) : handlerList
        // 调用 callback 返回建议列表的数据
        cb(results)
      }
    },
    // 过滤
    createFilter(queryString) {
      return (handler) => {
        return (handler.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // 关闭
    handleDialogClose(formName) {
      this.$nextTick(() => {
        if (this.$refs[formName] != null) {
          this.$refs[formName].resetFields()
        }
      })
    },
    // cron
    changeCron(val) {
      this.form.jobCron = val
    },
    resetCron() {
      this.form.jobCron = '* * * * * ?'
    }
  }
}
</script>
