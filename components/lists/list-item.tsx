'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Edit2, Trash2, MessageSquare } from 'lucide-react'
import { useListItemVerifications } from '@/hooks/use-collaborative-lists'
import { type ListItem } from '@/lib/types'

interface ListItemComponentProps {
  item: ListItem
  index: number
  listType: 'bullet' | 'numbered'
  userId: string
  userName: string
  isCreator: boolean
  onUpdate: (itemId: string, text: string) => void
  onDelete: (itemId: string) => void
}

export default function ListItemComponent({
  item,
  index,
  listType,
  userId,
  userName,
  isCreator,
  onUpdate,
  onDelete,
}: ListItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const [showCorrectionField, setShowCorrectionField] = useState(false)
  const [correctionText, setCorrectionText] = useState('')
  
  const { verifications, myVerification, submitVerification } = useListItemVerifications(
    item.id,
    userId,
    userName
  )

  const handleSave = () => {
    if (editText.trim() && editText !== item.text) {
      onUpdate(item.id, editText)
    }
    setIsEditing(false)
  }

  const handleVerify = async (isAccurate: boolean) => {
    if (!isAccurate && !correctionText.trim() && !myVerification) {
      setShowCorrectionField(true)
      return
    }

    await submitVerification(isAccurate, correctionText.trim() || undefined)
    if (!isAccurate) {
      setShowCorrectionField(false)
      setCorrectionText('')
    }
  }

  // Calculate consensus
  const totalVerifications = verifications.length
  const accurateCount = verifications.filter(v => v.is_accurate).length
  const inaccurateCount = totalVerifications - accurateCount
  const consensusPercentage = totalVerifications > 0 ? (accurateCount / totalVerifications) * 100 : 0

  // Get consensus color
  const getConsensusColor = () => {
    if (totalVerifications === 0) return 'bg-gray-200'
    if (consensusPercentage >= 80) return 'bg-green-500'
    if (consensusPercentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const prefix = listType === 'numbered' ? `${index + 1}.` : '•'

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3 border-l-4" style={{ borderLeftColor: myVerification?.is_accurate ? '#22c55e' : myVerification?.is_accurate === false ? '#ef4444' : '#d1d5db' }}>
      <div className="flex items-start gap-3">
        <span className="font-bold text-gray-600 dark:text-gray-300 mt-1">{prefix}</span>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSave()
                  }
                  if (e.key === 'Escape') {
                    setIsEditing(false)
                    setEditText(item.text)
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditText(item.text)
                }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 dark:text-gray-200">{item.text}</p>
              
              {/* Consensus Bar */}
              {totalVerifications > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{accurateCount} ✓</span>
                    <span>{inaccurateCount} ✗</span>
                    <span className="ml-auto">{Math.round(consensusPercentage)}% consensus</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getConsensusColor()}`}
                      style={{ width: `${consensusPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Verifications from others */}
              {verifications.length > 0 && (
                <div className="mt-3 space-y-2">
                  {verifications.map(v => (
                    <div key={v.id} className="text-xs bg-white dark:bg-gray-800 rounded p-2 flex items-start gap-2">
                      {v.is_accurate ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{v.user_name}</span>
                        {v.correction_text && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            {v.correction_text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verification Actions (for non-creators who haven't verified) */}
              {!isCreator && !myVerification && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(true)}
                      className="flex-1"
                      data-testid="verify-accurate"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accurate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(false)}
                      className="flex-1"
                      data-testid="verify-inaccurate"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Inaccurate
                    </Button>
                  </div>

                  {showCorrectionField && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Suggest a correction..."
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleVerify(false)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerify(false)}
                        disabled={!correctionText.trim()}
                      >
                        Submit Correction
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Edit/Delete Actions (for creator) */}
              {isCreator && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
