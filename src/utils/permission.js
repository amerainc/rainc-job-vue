import store from '@/store'

/**
 * @param {Integer} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  return store.getters.role === value
}
