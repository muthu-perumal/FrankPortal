const KEY = 'fp_authed_v1'

export function isAuthed() {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function setAuthed(value) {
  try {
    localStorage.setItem(KEY, value ? 'true' : 'false')
  } catch {
    // ignore
  }
}

