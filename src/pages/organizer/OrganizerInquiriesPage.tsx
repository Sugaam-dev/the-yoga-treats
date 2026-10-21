import { useState } from 'react'
import {
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'

export function OrganizerInquiriesPage() {
  const { inquiries, messages, addInquiryMessage } = useDemoStore()
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(
    inquiries[0]?.id || ''
  )
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const activeInquiry = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0]
  const threadMessages = messages.filter((m) => m.inquiryId === activeInquiry?.id)

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !activeInquiry) return

    setIsSending(true)
    setTimeout(() => {
      addInquiryMessage(activeInquiry.id, replyText, 'organizer')
      setReplyText('')
      setIsSending(false)
    }, 400)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Inquiry Inbox"
        description="Direct communication with prospective attendees inquiring about your retreat schedules and dietary details."
        badge={
          <Badge variant="gold" size="sm">
            {inquiries.length} Inquiries
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[620px] items-stretch">
        {/* Inquiries Thread List */}
        <Card className="overflow-hidden flex flex-col border-border/80">
          <div className="p-3.5 border-b border-border/80 bg-secondary/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Conversations
            </span>
            <span className="text-[11px] text-muted-foreground">
              Active Threads
            </span>
          </div>

          <div className="divide-y divide-border/60 overflow-y-auto flex-1">
            {inquiries.map((inq) => {
              const isSelected = inq.id === activeInquiry?.id
              return (
                <button
                  key={inq.id}
                  onClick={() => setSelectedInquiryId(inq.id)}
                  className={cn(
                    'w-full p-4 text-left transition-colors flex flex-col gap-1.5',
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-secondary/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {inq.guestName}
                    </span>
                    <Badge
                      variant={inq.unreadByOrganizer ? 'gold' : 'secondary'}
                      size="sm"
                    >
                      {inq.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {inq.subject}
                  </p>

                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {inq.lastMessageSnippet}
                  </p>

                  <span className="text-[10px] text-muted-foreground mt-1">
                    {inq.retreatTitle || 'General Sanctuary Inquiry'}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Message Thread Detail & Reply Form */}
        <Card className="md:col-span-2 overflow-hidden flex flex-col border-border/80">
          {activeInquiry ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-border/80 bg-secondary/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {activeInquiry.subject}
                    </h4>
                    <Badge variant="outline" size="sm">
                      {activeInquiry.inquiryNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Guest: {activeInquiry.guestName} ({activeInquiry.guestEmail})
                  </p>
                </div>

                <Badge
                  variant={activeInquiry.status === 'replied' ? 'success' : 'warning'}
                  size="sm"
                >
                  {activeInquiry.status === 'replied' ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1 inline" />
                  )}
                  {activeInquiry.status.toUpperCase()}
                </Badge>
              </div>

              {/* Message History */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-background/50">
                {threadMessages.map((msg) => {
                  const isOrganizer = msg.senderRole === 'organizer'
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-lg',
                        isOrganizer ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {msg.senderName}
                        </span>
                        <span>&bull;</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={cn(
                          'p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs',
                          isOrganizer
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-card border border-border text-foreground rounded-tl-none'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Input Bar */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-border/80 bg-card flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your response to the attendee..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  isLoading={isSending}
                  disabled={!replyText.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground my-auto">
              Select an inquiry thread to view conversation history.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
