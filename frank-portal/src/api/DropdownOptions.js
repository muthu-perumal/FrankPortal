// Stubs for dropdown option-loading APIs used by optionsType:
// EXISTING / MASTER / REPOSITORY / PREDEFINED(User)
//
// Replace these with your real backend calls.

export async function getUniqueColumnValues(wFormId, payload) {
  void wFormId
  const col = payload?.column || 'column'
  return [`${col} Option A`, `${col} Option B`, `${col} Option C`]
}

export async function getUniqueColumnsRepository(repositoryField, repositoryId) {
  void repositoryId
  return [`${repositoryField} Repo A`, `${repositoryField} Repo B`]
}

export async function getUniqueColumnsFromParentRepository(repositoryId, payload) {
  void repositoryId
  const col = payload?.column || 'column'
  const filter = payload?.filters?.[0]?.value
  if (!filter) return []
  return [`${col} (${filter}) 1`, `${col} (${filter}) 2`]
}

export async function getUserList(filter) {
  // In your app you used: { criteria: "userType", value: "Normal" }
  void filter
  return ['Demo User', 'Alex Johnson', 'Taylor Smith']
}

