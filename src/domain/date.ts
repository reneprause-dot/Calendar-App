import { format } from 'date-fns'

export function isoDateLocal(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

