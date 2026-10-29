import { ResourceCategory, ResourceItem } from './types'

export const DEFAULT_CATEGORIES: ResourceCategory[] = [
  {
    id: 'guides',
    name: 'Guides & Articles',
    nameMn: 'Удирдамж & Зөвлөмж',
    slug: 'guides',
    description: 'Брэндийн стратеги, визуал систем, лого дизайны практик удирдамжууд',
    sortOrder: 1,
  },
  {
    id: 'templates',
    name: 'Templates & Downloads',
    nameMn: 'Загвар & Татах файлууд',
    slug: 'templates',
    description: 'Дизайнерууд болон брэнд менежерүүдэд зориулсан бэлэн файлууд, checklist',
    sortOrder: 2,
  },
  {
    id: 'tools',
    name: 'Tools & Applications',
    nameMn: 'Дизайн & AI Хэрэгслүүд',
    slug: 'tools',
    description: 'Брэндбүүк аудит, AI бриф зөвлөх зэрэг интерактив хэрэгслүүд',
    sortOrder: 3,
  },
  {
    id: 'packaging',
    name: 'Packaging & Print',
    nameMn: 'Сав баглаа боодол',
    slug: 'packaging',
    description: 'Хэвлэлийн эх бэлтгэл, цаас, өнгөлгөө, дардсын стандарт',
    sortOrder: 4,
  },
  {
    id: 'typography',
    name: 'Typography',
    nameMn: 'Үсгийн соёл',
    slug: 'typography',
    description: 'Фонтын сонголт, кирилл бичгийн дүрэм, мэдээллийн шатлал',
    sortOrder: 5,
  },
]

export const DEFAULT_RESOURCES: ResourceItem[] = []
