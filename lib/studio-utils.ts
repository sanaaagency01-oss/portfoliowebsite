import { ProjectContract, ProjectTask, DeliverableItem } from './types/studio'

/**
 * Calculates project completion progress (0 - 100) based on contract tasks or deliverables.
 * Prioritizes `contract.tasks` if any exist; falls back to `contract.deliverables`.
 */
export function calculateProjectProgress(contract?: ProjectContract | null): number {
  if (!contract) return 0

  if (contract.tasks && contract.tasks.length > 0) {
    const completedTasks = contract.tasks.filter((t) => t.completed).length
    return Math.round((completedTasks / contract.tasks.length) * 100)
  }

  if (contract.deliverables && contract.deliverables.length > 0) {
    const completedDeliverables = contract.deliverables.filter(
      (d) => d.completed || d.status === 'approved'
    ).length
    return Math.round((completedDeliverables / contract.deliverables.length) * 100)
  }

  return 0
}

/**
 * Formats a number into Mongolian Tugrik representation (e.g. 3,500,000 ₮)
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('mn-MN')} ₮`
}

/**
 * Standard preset tasks based on the 5-stage brand identity process
 */
export const DEFAULT_PRESET_TASKS: ProjectTask[] = [
  {
    id: 'task_1',
    name: '1. Судалгаа & Мудборд боловсруулах',
    description: 'Зах зээл, өрсөлдөгчдийн судалгаа хийж, хэрэглэгчийн ойлголт ба харааны ерөнхий чиглэлийг тодорхойлох',
    due: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: false,
  },
  {
    id: 'task_2',
    name: '2. Лого концепц & хувилбарууд (3 чиглэл)',
    description: 'Брэндийн мөн чанарыг илэрхийлсэн 3 өөр өнцөг бүхий концепц, ноорог боловсруулж танилцуулах',
    due: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    completed: false,
  },
  {
    id: 'task_3',
    name: '3. Сонгосон чиглэлийг хөгжүүлж эцэслэх',
    description: 'Харилцагчийн санал хүсэлтийн дагуу сонгосон концепцийг геометрийн нарийвчлалтайгаар эцэслэх',
    due: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
    completed: false,
  },
  {
    id: 'task_4',
    name: '4. Өнгөний палитр & Типографи систем угсрах',
    description: 'Үндсэн ба туслах өнгө, фонт хослолууд, брэндийн визуал дүрмийг боловсруулах',
    due: new Date(Date.now() + 38 * 86400000).toISOString().split('T')[0],
    completed: false,
  },
  {
    id: 'task_5',
    name: '5. Эх файлууд бэлтгэх & Брэндбүүк хүлээлгэн өгөх',
    description: 'Хэвлэлийн болон цахим хэрэглээний эх вектор файлууд (AI, EPS, SVG, PNG, PDF) ба брэндбүүк бэлтгэж хүлээлгэн өгөх',
    due: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    completed: false,
  },
]

/**
 * Standard preset deliverables
 */
export const DEFAULT_PRESET_DELIVERABLES: DeliverableItem[] = [
  {
    id: 'del_1',
    name: 'Лого систем ба тэмдэгт',
    description: 'Үндсэн болон туслах хувилбарууд, өнгөний хувилбар, аюулгүйн бүс, фонт хослол',
    quantity: '1 систем (Dark & Light)',
    due: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'del_2',
    name: 'Брэндийн үндсэн дүрэм (Брэндбүүк)',
    description: 'Брэндийн харааны систем, өнгөний палитр, типографи, зураглалын аргачлал бүхий хэрэглээний дүрэм',
    quantity: '24 хуудас PDF',
    due: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'del_3',
    name: 'Хэрэглээний загварууд & Сав баглаа боодол',
    description: 'Нэрийн хуудас, албан бланк, хавтас, сошиал медиа постын 5 төрлийн загвар',
    quantity: '5 багц загвар',
    due: new Date(Date.now() + 40 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'del_4',
    name: 'Эх файлуудын багц',
    description: 'Хэвлэлийн болон цахим хэрэглээний эх файлууд (AI, EPS, SVG, PNG, PDF)',
    quantity: 'Бүрэн архивлагдсан багц',
    due: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
  },
]

/**
 * Generates ready-to-share message text for clients (Telegram / Messenger / Email)
 */
export function generateClientShareMessage(
  project: { token: string; name: string; contactName: string },
  origin: string = typeof window !== 'undefined' ? window.location.origin : ''
): string {
  return `Сайн байна уу, ${project.contactName}!\n${project.name} төслийн цахим гэрээ болон ажлын явцыг хянах талбарын холбоос бэлэн боллоо:\n\n🔗 Client Portal: ${origin}/client/${project.token}\n📄 Цахим гэрээ: ${origin}/client/c/${project.token}\n🔑 Нууц токен: ${project.token}\n\nБаярлалаа, Т. Өсөхбаяр (Baysaass)`
}
