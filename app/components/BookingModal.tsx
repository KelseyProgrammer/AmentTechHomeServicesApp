'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import BookingWizard from './BookingWizard'

export default function BookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [rendered, setRendered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRendered(true)
      // Double rAF ensures the element is painted before the transition starts
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      )
    } else {
      setVisible(false)
      const t = setTimeout(() => setRendered(false), 440)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!rendered) return null

  return (
    <Dialog open={rendered} onClose={onClose} className="bm-dialog">
      <div className={`bm-backdrop ${visible ? 'bm-visible' : ''}`} aria-hidden="true" />
      <div className="bm-container">
        <DialogPanel className={`bm-panel ${visible ? 'bm-visible' : ''}`}>
          <div className="bm-header">
            <div className="bm-header-brand">
              <span className="bm-brand-name">AMENT</span>
              <span className="bm-brand-sub">Home &amp; Tech Services</span>
            </div>
            <button className="bm-close" onClick={onClose} aria-label="Close booking panel">
              ✕
            </button>
          </div>
          <BookingWizard inModal={true} />
        </DialogPanel>
      </div>
    </Dialog>
  )
}
