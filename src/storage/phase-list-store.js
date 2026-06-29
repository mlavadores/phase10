/**
 * Phase 10 — Phase List Store Module
 * 
 * Manages custom phase lists in localStorage.
 * Users can create, save, load, and delete custom phase orders.
 */

/** @typedef {import('../types.js').PhaseList} PhaseList */

const STORAGE_KEY = 'phase10_custom_phase_lists';

/**
 * Save all custom phase lists.
 * @param {PhaseList[]} lists
 */
export function savePhaseLists(lists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (e) {
    console.warn('Failed to save phase lists:', e);
  }
}

/**
 * Retrieve all custom phase lists.
 * @returns {PhaseList[]}
 */
export function getPhaseLists() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    return JSON.parse(serialized);
  } catch (e) {
    console.warn('Failed to load phase lists:', e);
    return [];
  }
}

/**
 * Add a new custom phase list.
 * @param {PhaseList} phaseList
 */
export function addPhaseList(phaseList) {
  const lists = getPhaseLists();
  lists.push(phaseList);
  savePhaseLists(lists);
}

/**
 * Delete a specific phase list by ID.
 * @param {string} id
 */
export function deletePhaseList(id) {
  const lists = getPhaseLists();
  const filtered = lists.filter(l => l.id !== id);
  savePhaseLists(filtered);
}

/**
 * Update an existing phase list.
 * @param {PhaseList} updatedList
 */
export function updatePhaseList(updatedList) {
  const lists = getPhaseLists();
  const index = lists.findIndex(l => l.id === updatedList.id);
  if (index !== -1) {
    lists[index] = updatedList;
    savePhaseLists(lists);
  }
}

/**
 * Get a specific phase list by ID.
 * @param {string} id
 * @returns {PhaseList | null}
 */
export function getPhaseListById(id) {
  const lists = getPhaseLists();
  return lists.find(l => l.id === id) || null;
}

/**
 * Create a new PhaseList object.
 * @param {string} name
 * @param {number[]} phases - Array of phase numbers (1-10) in custom order
 * @returns {PhaseList}
 */
export function createPhaseList(name, phases) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
    name,
    phases,
    createdAt: new Date().toISOString()
  };
}
