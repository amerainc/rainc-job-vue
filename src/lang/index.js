import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCNLocale from 'vue-cron-generator/src/locale/zh-CN'

Vue.use(VueI18n)

const messages = {
  zh_CN: {
    ...zhCNLocale
  }
}

const i18n = new VueI18n({
  // set locale
  // options: en | zh
  locale: 'zh_CN',
  // set locale messages
  messages
})

export default i18n
