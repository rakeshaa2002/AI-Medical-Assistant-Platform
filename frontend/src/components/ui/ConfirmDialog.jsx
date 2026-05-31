import Modal from './Modal'
import Spinner from './Spinner'

/**
 * Accessible confirmation dialog to replace window.confirm().
 * <ConfirmDialog open={...} title="Delete report?" onConfirm={...} onClose={...} danger />
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner size={16} className="text-white" /> : confirmLabel}
          </button>
        </>
      }
    >
      {message && <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>}
    </Modal>
  )
}
