import { useState } from 'react'
import {
  Coins,
  DollarSign,
  TrendingUp,
  Building,
  Download,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function AdminFinancePage() {
  const { payments, payouts, addToast } = useDemoStore()
  const [activeTab, setActiveTab] = useState<'payouts' | 'payments'>('payouts')

  const totalProcessed = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalPayoutNet = payouts.reduce((sum, p) => sum + p.netAmount, 0)
  const totalFees = payouts.reduce((sum, p) => sum + p.feeDeduction, 0)

  const handleProcessPayouts = () => {
    addToast({
      title: 'Batch Payout Scheduled',
      description: 'Automated ACH / SEPA transfer initiated for all pending school balances.',
      type: 'success',
    })
  }

  const handleExportLedger = () => {
    addToast({
      title: 'Financial Ledger Exported',
      description: 'CSV reconciliation file ready for accounting records.',
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
              onClick={handleProcessPayouts}
              className="gap-1.5 text-xs font-medium"
            >
              <Coins className="h-3.5 w-3.5" />
              Process Payout Batch
            </Button>
          </div>
        }
      />

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Student Volume
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              ${totalProcessed.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {payments.length} verified checkout transactions
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
              ${totalFees.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Net platform commission collected
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              School Disbursements
            </span>
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              ${totalPayoutNet.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {payouts.filter((p) => p.status === 'paid').length} completed &bull; {payouts.filter((p) => p.status === 'pending').length} pending
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'payouts'
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-muted-foreground hover:bg-secondary/60'
          }`}
        >
          Organizer Payouts ({payouts.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'payments'
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-muted-foreground hover:bg-secondary/60'
          }`}
        >
          Student Transactions ({payments.length})
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
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-accent">
                      {payout.payoutReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {payout.organizerName}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      ${payout.amount.toLocaleString()} {payout.currency}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-medium">
                      -${payout.feeDeduction.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      ${payout.netAmount.toLocaleString()} {payout.currency}
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
      ) : (
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
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-accent">
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
                      ${payment.amount.toLocaleString()} {payment.currency}
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
      )}
    </div>
  )
}
