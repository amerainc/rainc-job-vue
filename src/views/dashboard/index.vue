<template>
  <div class="dashboard-container">
    <panel-group />
    <el-card>
      <div slot="header" class="clearfix">
        <span>调度报表</span>
        <el-date-picker
          v-model="filterTime"
          style="float: right; padding: 3px 0"
          type="datetimerange"
          :clearable="false"
          :editable="false"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
          @change="FilterSelectHandler"
        />
      </div>
      <el-row style="background: #fff; margin-bottom: 32px">
        <el-col :xs="24" :sm="24" :lg="16">
          <line-chart :chart-data="lineChartData" />
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <pie-chart :chart-data="pieChartData" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import { fetchList } from '@/api/joblogReport'
import Moment from 'moment'
export default {
  name: 'Dashboard',
  components: {
    PanelGroup,
    LineChart,
    PieChart
  },
  data() {
    return {
      lineChartData: {
        triggerDay: [],
        runningCount: [],
        sucCount: [],
        failCount: []
      },
      pieChartData: [],
      filterTime: [],
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
  created() {
    const start = new Date()
    const end = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    this.filterTime = [start, end]
    this.getList()
  },
  methods: {
    getList() {
      if (!this.filterTime || this.filterTime.length < 2) {
        return
      }
      const startDate = this.filterTime[0]
      const endDate = this.filterTime[1]
      fetchList({ startDate: startDate, endDate: endDate }).then((response) => {
        const data = response.content
        this.lineChartData.triggerDay = data.map((temp) => { return Moment(temp.triggerDay).format('YYYY-MM-DD') })
        this.lineChartData.runningCount = data.map((temp) => temp.runningCount)
        this.lineChartData.sucCount = data.map((temp) => temp.sucCount)
        this.lineChartData.failCount = data.map((temp) => temp.failCount)
        const runningCount = this.lineChartData.runningCount.reduce((x, y) => x + y)
        const sucCount = this.lineChartData.sucCount.reduce((x, y) => x + y)
        const failCount = this.lineChartData.failCount.reduce((x, y) => x + y)
        this.pieChartData = [
          {
            value: runningCount,
            name: '进行中',
            itemStyle: { color: '#3888fa' }
          },
          {
            value: sucCount,
            name: '成功',
            itemStyle: { color: '#32CD32' }
          },
          {
            value: failCount,
            name: '失败',
            itemStyle: { color: '#FF005A' }
          }
        ]
      })
    },
    FilterSelectHandler() {
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }
}
</style>
