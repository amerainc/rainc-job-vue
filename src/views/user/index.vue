<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="filter-container">
      <el-col :span="4">
        <el-select v-model="listQuery.role" @change="jobFilterSelectHandler">
          <el-option disabled value="-1">角色</el-option>
          <el-option
            v-for="item in roleList"
            :key="item.value"
            :label="item.title"
            :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-input v-model="listQuery.username" placeholder="请输入查询的账号" />
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
      <el-table-column align="center" label="账号" width="200">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="密码">
        <template> ********* </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          />
          <el-button
            type="primary"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.id)"
          />
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
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input
            v-model="form.password"
            :placeholder="isEdit ? '请输入新密码，为空则不更新' : '请输入密码'"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio :label="0">普通用户</el-radio>
            <el-radio :label="1">管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-show="form.role == 0" label="权限" prop="permission">
          <el-select v-model="form.permission" multiple style="width: 100%">
            <el-option
              v-for="item in groupList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
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
import { fetchList, add, update, remove } from '@/api/user'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { fetchAll as featchGroupList } from '@/api/jobgroup'
export default {
  name: 'User',
  components: { Pagination },
  filters: {
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
        role: -1,
        username: ''
      },
      // 角色信息
      roleList: [{
        title: '全部',
        value: -1
      }, {
        title: '普通用户',
        value: 0
      }, {
        title: '管理员',
        value: 1
      }],
      form: null,
      formRules:
      {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        role: [{ required: true, message: '请选择权限', trigger: 'change' }]
      },
      DEFAULT_FORM: {
        username: '',
        password: '',
        role: 0,
        permission: ''
      },
      isEdit: false,
      // 表单显示控制
      formState: {
        visiable: false,
        title: ''
      },
      groupList: []
    }
  },
  created() {
    this.getList()
    this.getGroupList()
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
        if (this.groupList && this.groupList.length > 0) {
          this.listQuery.jobGroup = this.groupList[0].id
        }
        // 获取后加载jobinfo列表
        this.getList()
      })
    },
    jobFilterSelectHandler() {
      this.listQuery.page = 1
      this.getList()
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
      this.form.password = ''
      this.form.permission = this.form.permission ? this.form.permission.split(',').map(item => Number(item)) : []
    },
    handleSearch() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDialogClose(formName) {
      this.$nextTick(() => {
        if (this.$refs[formName] != null) {
          this.$refs[formName].resetFields()
        }
      })
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
    }
  }
}
</script>
