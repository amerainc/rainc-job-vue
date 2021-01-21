<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="filter-container">
      <el-col :span="4">
        <el-input v-model="listQuery.appName" placeholder="请输入appName" />
      </el-col>
      <el-col :span="4">
        <el-input v-model="listQuery.title" placeholder="请输入名称" />
      </el-col>
      <el-col :span="14">
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="jobFilterSelectHandler"
        >
          搜索
        </el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" @click="handleAddBtn"> 新增 </el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="AppName">
        <template slot-scope="scope">
          {{ scope.row.appName }}
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="注册方式">
        <template slot-scope="scope">
          {{ !scope.row.addressList ? "自动注册" : "手动注册" }}
        </template>
      </el-table-column>
      <el-table-column label="注册地址">
        <template slot-scope="scope">
          {{ !scope.row.addressList ? "无" : scope.row.addressList }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-dropdown split-button type="primary" @command="handleCommand">
            操作
            <el-dropdown-menu slot="dropdown">
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
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />

    <!-- 表单 -->
    <el-dialog
      :title="formState.title"
      :visible.sync="formState.visiable"
      @close="handleDialogClose('form')"
    >
      <el-form ref="form" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="appName" prop="appName">
          <el-autocomplete
            v-model="form.appName"
            style="width: 100%"
            :fetch-suggestions="querySearchAppName"
            placeholder="请输入appName"
          />
        </el-form-item>

        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="机器地址" prop="addressList">
          <el-select
            v-model="form.addressList"
            multiple
            allow-create
            filterable
            style="width: 100%"
            placeholder="请输入机器地址，为空则自动注册,格式为http://ip:prot"
          >
            <el-option
              v-for="item in addressList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
import { fetchList, add, update, remove, fetchAppNameList, fetchAddressList } from '@/api/jobgroup'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'JobGroup',
  components: { Pagination },
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
        appName: '',
        title: ''
      },
      // 执行器列表
      groupList: null,
      form: null,
      DEFAULT_FORM: {
        appName: '',
        title: '',
        addressList: ''
      },
      isEdit: false,
      formRules:
      {
        appName: [{ required: true, message: '请输入appName', trigger: 'change' }],
        title: [{ required: true, message: '请输入名称', trigger: 'change' }]
      },
      // 表单显示控制
      formState: {
        visiable: false,
        title: ''
      },
      appNameList: [],
      addressList: [],
      // 当前appName
      curAppName: ''
    }
  },
  watch: {
    'form.appName': function(val) {
      if (this.appNameList.includes(val) && this.curAppName !== val) {
        this.curAppName = val
        fetchAddressList(val).then(response => {
          this.addressList = response.content
        })
      }
    }
  },
  created() {
    this.getList()
    this.getAppNameList()
    this.form = Object.assign({}, this.DEFAULT_FORM)
  },
  methods: {
    // 获取jobGroup列表
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
    jobFilterSelectHandler() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCommand(command) {
      const { action, params } = command
      switch (action) {
        case 'edit':
          this.handleEdit(params)
          break
        case 'remove':
          this.handleDelete(params)
          break
      }
    },
    handleAddBtn() {
      this.isEdit = false
      this.formState.title = '新增'
      this.formState.visiable = true
      this.form = Object.assign({}, this.DEFAULT_FORM)
    },
    handleEdit(data) {
      this.isEdit = true
      this.formState.title = '修改'
      this.formState.visiable = true
      this.form = Object.assign({}, data)
      this.form.addressList = this.form.addressList ? this.form.addressList.split(',') : []
    },
    handleSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isEdit) {
            update(Object.assign({}, this.form)).then(() => {
              this.$message.success('修改成功')
              this.getList()
              this.formState.visiable = false
              return true
            }).catch(() => {
              this.$message.fail('修改失败')
              return false
            })
          } else {
            add(Object.assign({}, this.form)).then(() => {
              this.$message.success('新增成功')
              this.getList()
              this.formState.visiable = false
              return true
            }).catch(() => {
              this.$message.fail('新增失败')
              return false
            })
          }
          return false
        }
      })
    },
    handleDialogClose(formName) {
      this.$nextTick(() => {
        if (this.$refs[formName] != null) {
          this.$refs[formName].resetFields()
        }
      })
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
    getAppNameList() {
      fetchAppNameList().then((response) => {
        this.appNameList = response.content
      })
    },
    querySearchAppName(queryString, cb) {
      if (this.appNameList == null) {
        cb(results)
      } else {
        var appNameList = this.appNameList.map(item => {
          return { value: item }
        })
        var results = queryString ? appNameList.filter(this.createFilter(queryString)) : appNameList
        // 调用 callback 返回建议列表的数据
        cb(results)
      }
    },
    querySearchAddress(queryString, cb) {
      if (this.addressList == null) {
        cb(results)
      } else {
        var addressList = this.addressList.map(item => {
          return { value: item }
        })
        var results = queryString ? addressList.filter(this.createFilter(queryString)) : addressList
        // 调用 callback 返回建议列表的数据
        cb(results)
      }
    },
    createFilter(queryString) {
      return (filter) => {
        return (filter.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    }
  }
}
</script>
