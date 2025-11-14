'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals(metric => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }

    // In production, send to analytics endpoint
    // Example: Send to custom analytics endpoint
    // if (process.env.NODE_ENV === 'production') {
    //   fetch('/api/vitals', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(metric),
    //   }).catch(console.error)
    // }

    // Example: Send to Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', metric.name, {
    //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //     event_label: metric.id,
    //     non_interaction: true,
    //   })
    // }
  })

  return null
}
