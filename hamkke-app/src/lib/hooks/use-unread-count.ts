'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    async function fetchCount() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count: cnt } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setCount(cnt ?? 0)
    }

    fetchCount()

    const channel = supabase
      .channel('notifications-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return count
}
