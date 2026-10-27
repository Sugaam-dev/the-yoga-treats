import { useState } from 'react'
import {
  Coins,
  DollarSign,
  TrendingUp,
  Building,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'

export function AdminFinancePage() {
  const { payments, payouts, refunds, processPayoutsBatch, addToast } = useDemoStore()
  const [activeTab, setActiveTab] = useState<'payouts' | 'payments' | 'refunds'>('payouts')
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const pendingPayouts = payouts.filter((p) => p.status === 'pending')
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.netAmount, 0)

  const totalGrossProcessed = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0)
  const netSettledVolume = totalGrossProcessed - totalRefunded
  const totalPayoutNet = payouts.reduce((sum, p) => sum + p.netAmount, 0)
  const totalFees = Math.round(netSettledVolume * 0.10)

  const handleOpenPayoutConfirmation = () => {
    if (pendingPayouts.length === 0) {
      addToast({
        title: 'No Pending Payouts',
        description: 'All scheduled school payouts are already settled and disbursed.',
        type: 'info',
      })
      return
    }
    setIsConfirmModalOpen(true)
  }

  const handleExecutePayoutBatch = () => {
    processPayoutsBatch()
    setIsConfirmModalOpen(false)
    addToast({
      title: 'Batch Payout Disbursed',
      description: `Settled ${pendingPayouts.length} payout transfers totalling ${formatINR(pendingAmount)}.`,
      type: 'success',
    })
  }

  const handleExportLedger = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    let filename = ''

    if (activeTab === 'payouts') {
      headers = ['Payout Reference', 'School Organizer', 'Gross Amount (INR)', 'Platform Fee (INR)', 'Net Settlement (INR)', 'Destination Account', 'Status', 'Processed Date']
      rows = payouts.map((p) => [
        `"${p.payoutReference}"`,
        `"${p.organizerName}"`,
        p.amount,
        p.feeDeduction,
        p.netAmount,
        `"${p.destinationAccount}"`,
        `"${p.status.toUpperCase()}"`,
        `"${p.processedDate || p.scheduledDate}"`,
      ])
      filename = `payouts-ledger-${new Date().toISOString().split('T')[0]}.csv`
    } else if (activeTab === 'payments') {
      headers = ['Payment Reference', 'Guest Name', 'Retreat Title', 'Payment Method', 'Amount (INR)', 'Status', 'Processed Date']
      rows = payments.map((p) => [
        `"${p.paymentReference}"`,
        `"${p.guestName}"`,
        `"${p.retreatTitle}"`,
        `"${p.paymentMethod}"`,
        p.amount,
        `"${p.status.toUpperCase()}"`,
        `"${p.processedAt}"`,
      ])
      filename = `student-transactions-ledger-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      headers = ['Refund Reference', 'Booking Reference', 'Guest Name', 'Retreat Title', 'Refund Amount (INR)', 'Refund %', 'Status', 'Processed Date', 'Reason']
      rows = refunds.map((r) => [
        `"${r.refundReference}"`,
        `"${r.bookingReference}"`,
        `"${r.guestName}"`,
        `"${r.retreatTitle}"`,
        r.amount,
        r.percentage,
        `"${r.status.toUpperCase()}"`,
        `"${r.processedAt}"`,
        `"${(r.reason || '').replace(/"/g, '""')}"`,
      ])
      filename = `refunds-ledger-${new Date().toISOString().split('T')[0]}.csv`
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      title: 'Financial Ledger Exported',
      description: `Downloaded ${filename} for accounting records.`,
      type: 'info',
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Financial Operations & Settlements"
        description="Audit student transaction flows, marketplace take rates, escrow holds, and organizer automated payout disbursements."
        badge={
          <Badge variant="gold" size="sm">
            Treasury & Clearing
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLedger}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handleOpenPayoutConfirmation}
              className="gap-1.5 text-xs font-medium"
            >
              <Coins className="h-3.5 w-3.5" />
              Process Payout Batch ({pendingPayouts.length})
            </Button>
          </div>
        }
      />

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Settled Student Volume
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(netSettledVolume)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Gross: {formatINR(totalGrossProcessed)} &bull; Reversals: -{formatINR(totalRefunded)}
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Marketplace Take Rate (10%)
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(totalFees)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            Net commission earned post-refunds
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              School Disbursements
            </span>
            <div className="p-2 rounded-lg bg-accent/20 text-[#8b6521]">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(totalPayoutNet)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {payouts.filter((p) => p.status === 'paid').length} completed &bull; {pendingPayouts.length} pending ({formatINR(pendingAmount)})
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-muted-foreground hover:bg-secondary/60'
          }`}
        >
          Organizer Payouts ({payouts.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-muted-foreground hover:bg-secondary/60'
          }`}
        >
          Student Transactions ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'refunds'
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-muted-foreground hover:bg-secondary/60'
          }`}
        >
          Refunds & Reversals ({refunds.length})
        </button>
      </div>

      {/* Payouts Table */}
      {activeTab === 'payouts' ? (
        <Card className="overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payout Ref</th>
                  <th className="py-3 px-4">School Organizer</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Platform Fee</th>
                  <th className="py-3 px-4">Net Settlement</th>
                  <th className="py-3 px-4">Destination Account</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#8b6521]">
                      {payout.payoutReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {payout.organizerName}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {formatINR(payout.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-medium">
                      -{formatINR(payout.feeDeduction)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {formatINR(payout.netAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {payout.destinationAccount}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={payout.status === 'paid' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {payout.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : activeTab === 'payments' ? (
        /* Payments Table */
        <Card className="overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Retreat</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Processed Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#8b6521]">
                      {payment.paymentReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {payment.guestName}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {payment.retreatTitle}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground capitalize">
                      {payment.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {formatINR(payment.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(payment.processedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        {payment.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Refunds & Reversals Table */
        <Card className="overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Refund Ref</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Retreat Sanctuary</th>
                  <th className="py-3 px-4">Refund Amount</th>
                  <th className="py-3 px-4">Policy Applied</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Processed Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No cancellation refunds or payment reversals recorded.
                    </td>
                  </tr>
                ) : (
                  refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-rose-700">
                        {refund.refundReference}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] font-medium text-accent">
                        {refund.bookingReference}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {refund.guestName}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                        {refund.retreatTitle}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-700">
                        -{formatINR(refund.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        <span className="font-medium text-foreground">{refund.percentage}%</span> &bull; {refund.policyApplied}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px] italic max-w-xs truncate">
                        &ldquo;{refund.reason}&rdquo;
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(refund.processedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="destructive" size="sm">
                          {refund.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Payout Batch */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-primary">
                <AlertCircle className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Confirm Simulated Payout Execution
                </h3>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-foreground/80 leading-relaxed">
              <p>
                You are about to execute automated batch settlement for{' '}
                <strong>{pendingPayouts.length} pending organizer transfer(s)</strong>.
              </p>

              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Net Settlement:</span>
                  <span className="font-bold text-foreground text-sm font-serif">
                    {formatINR(pendingAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transfer Method:</span>
                  <span className="font-medium text-foreground">Simulated RTGS / NEFT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Check:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> All Schools Verified
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                Simulated operation: This will update the internal demo store status to &ldquo;PAID&rdquo; and log the disbursement timestamp.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecutePayoutBatch}
                className="font-semibold"
              >
                Confirm Payout Execution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
