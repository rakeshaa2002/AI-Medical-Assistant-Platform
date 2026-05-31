export default function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
  }
  return (
    <div className="card flex items-center gap-4">
      {Icon && (
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}
