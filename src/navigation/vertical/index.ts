import dashboard from './dashboard'
import masterdata from './masterdata'
import pengaturan from './pengaturan'
import transaksi from './transaksi'
import type { VerticalNavItems } from '@layouts/types'

export default [...dashboard, ...pengaturan, ...masterdata, ...transaksi] as VerticalNavItems
