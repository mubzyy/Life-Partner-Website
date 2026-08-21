export default function Badge({ status }) {
  const map = {
    'Paid':        'badge-paid',
    'Pending':     'badge-pending',
    'Failed':      'badge-failed',
    'Active':      'badge-active',
    'Inactive':    'badge-inactive',
    'Verified':    'badge-verified',
    'Unverified':  'badge-unverified',
    'Rejected':    'badge-rejected',
    'Approved':    'badge-verified',
    'Premium':     'badge-premium',
    'Free':        'badge-free',
    'Expired':     'badge-failed',
    'Canceled':    'badge-inactive',
  };
  return <span className={`badge ${map[status] || 'badge-inactive'}`}>{status}</span>;
}
