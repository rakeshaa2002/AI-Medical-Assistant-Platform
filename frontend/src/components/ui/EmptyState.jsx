import { FiInbox } from 'react-icons/fi'

export default function EmptyState({ icon: Icon = FiInbox, title = 'Nothing here yet', subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="mb-3 text-slate-300 dark:text-slate-600" size={48} />
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}
