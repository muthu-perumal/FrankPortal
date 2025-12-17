// Stub for lookup/autocomplete API used by "lookupSettings".
// Replace with your real backend / connector call.

export async function getLookupForAPI({ hublinkId, payloadMapping }) {
  void hublinkId
  let input = {}
  try {
    input = JSON.parse(payloadMapping || '{}')
  } catch {
    input = {}
  }

  const term = String(input.SearchTerm || '').trim()
  if (!term) return { Items: [] }

  // Fake address suggestions
  const items = Array.from({ length: Math.min(10, Math.max(3, term.length)) }).map((_, i) => ({
    Id: `${term}-${i + 1}`,
    Text: `${term.toUpperCase()} ${100 + i}`,
    Description: `Toronto, Ontario, M${i}M ${i}M${i}`,
    City: 'Toronto',
    Province: 'Ontario',
    PostalCode: `M${i}M ${i}M${i}`,
  }))

  return { Items: items }
}

