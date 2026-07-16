import { createRouter, createWebHistory } from 'vue-router'
import EditorView from '../views/EditorView.vue'
import SettingsView from '../views/SettingsView.vue'
import PreferencesView from '../views/PreferencesView.vue'
import PrestashopView from '../views/PrestashopView.vue'

const routes = [
  { path: '/', redirect: '/editor' },
  { path: '/editor', component: EditorView },
  { path: '/catalog', component: SettingsView },
  { path: '/settings', component: PreferencesView },
  { path: '/prestashop', component: PrestashopView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
