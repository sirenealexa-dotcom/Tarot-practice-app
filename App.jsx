import React, { useEffect, useMemo, useRef, useState } from 'react'

const MAX_DECKS = 15
const DB_NAME = 'tarot-practice-studio-db'
const DB_VERSION = 1
const STORE_DECKS = 'decks'
const STORE_READINGS = 'readings'
const STORE_SPREADS = 'spreads'
const STORE_SETTINGS = 'settings'

const MAJOR_ARCANA = [
  'The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant',
  'The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man',
  'Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'
]
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles']
const RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King']
const TAROT_CARD_NAMES = [
  ...MAJOR_ARCANA,
  ...SUITS.flatMap((suit) => RANKS.map((rank) => `${rank} of ${suit}`)),
]
const PRESET_SPREADS = [
  { id: 'one-card', name: 'One Card', positions: ['Focus'] },
  { id: 'three-card', name: 'Three Card', positions: ['Past', 'Present', 'Future'] },
  { id: 'mind-body-spirit', name: 'Mind / Body / Spirit', positions: ['Mind', 'Body', 'Spirit'] },
  { id: 'situation-action-outcome', name: 'Situation / Action / Outcome', positions: ['Situation', 'Action', 'Outcome'] },
  { id: 'crossroads', name: 'Crossroads', positions: ['Option A', 'Option B', 'Advice', 'Outcome'] },
  { id: 'four-elements', name: 'Four Elements', positions: ['Fire', 'Water', 'Air', 'Earth'] },
  { id: 'five-card-line', name: 'Five Card Line', positions: ['1', '2', '3', '4', '5'] },
  { id: 'decision-making', name: 'Decision Making', positions: ['Issue', 'Obstacle', 'Hidden', 'Advice', 'Outcome'] },
  { id: 'horseshoe', name: 'Horseshoe', positions: ['Past', 'Present', 'Hidden Influence', 'Obstacle', 'Others', 'Advice', 'Outcome'] },
  { id: 'relationship', name: 'Relationship', positions: ['You', 'Other', 'Connection', 'Challenge', 'Potential'] },
  { id: 'shadow-work', name: 'Shadow Work', positions: ['Mask', 'Shadow', 'Lesson', 'Healing', 'Integration'] },
  { id: 'chakra', name: 'Chakra', positions: ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'] },
  { id: 'week-ahead', name: 'Week Ahead', positions: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'celtic-cross', name: 'Celtic Cross', positions: ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Advice', 'Environment', 'Hopes / Fears', 'Outcome'] },
  { id: 'year-ahead-12', name: 'Year Ahead (12)', positions: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  { id: 'zodiac-12', name: 'Zodiac (12)', positions: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] },
  { id: 'moon-cycle-8', name: 'Moon Cycle', positions: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'] },
  { id: 'hero-journey-9', name: "Hero's Journey", positions: ['Call', 'Refusal', 'Mentor', 'Threshold', 'Trials', 'Abyss', 'Transformation', 'Return', 'Gift'] },
  { id: 'decision-tree-9', name: 'Decision Tree', positions: ['Current Path', 'Motivation', 'Obstacle', 'Unknown', 'Choice A', 'Choice B', 'Short Term', 'Long Term', 'Core Advice'] },
  { id: 'grand-practice-15', name: 'Grand Practice (15)', positions: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'] },
]

const CARD_MEANINGS = {
  'The Fool': ['Beginnings, innocence, leap of faith', 'Recklessness, hesitation, poor judgment'],
  'The Magician': ['Manifestation, skill, focused will', 'Manipulation, scattered energy, illusion'],
  'The High Priestess': ['Intuition, mystery, inner knowing', 'Disconnection, hidden motives, blocked intuition'],
  'The Empress': ['Nurture, abundance, creativity', 'Smothering, stagnation, creative block'],
  'The Emperor': ['Structure, authority, stability', 'Rigidity, domination, control issues'],
  'The Hierophant': ['Tradition, teaching, spiritual order', 'Rebellion, dogma, restrictive beliefs'],
  'The Lovers': ['Union, choice, alignment', 'Disharmony, imbalance, difficult decisions'],
  'The Chariot': ['Determination, movement, victory', 'Loss of direction, aggression, lack of control'],
  'Strength': ['Courage, patience, inner mastery', 'Self-doubt, forcefulness, low resilience'],
  'The Hermit': ['Reflection, solitude, guidance', 'Isolation, withdrawal, avoidance'],
  'Wheel of Fortune': ['Change, cycles, destiny', 'Resistance to change, setbacks, delay'],
  'Justice': ['Truth, balance, accountability', 'Unfairness, bias, avoidance of consequences'],
  'The Hanged Man': ['Pause, surrender, new perspective', 'Stalling, resistance, missed insight'],
  'Death': ['Transformation, endings, release', 'Clinging, stagnation, fear of change'],
  'Temperance': ['Harmony, moderation, healing', 'Excess, imbalance, impatience'],
  'The Devil': ['Attachment, temptation, shadow', 'Liberation, detachment, breaking patterns'],
  'The Tower': ['Shock, revelation, upheaval', 'Avoided disaster, denial, slow collapse'],
  'The Star': ['Hope, inspiration, serenity', 'Discouragement, doubt, disconnection'],
  'The Moon': ['Dreams, uncertainty, intuition', 'Clarity emerging, confusion, fear'],
  'The Sun': ['Joy, success, vitality', 'Temporary clouding, delayed optimism, burnout'],
  'Judgement': ['Awakening, reckoning, renewal', 'Self-doubt, avoidance, failure to learn'],
  'The World': ['Completion, wholeness, fulfillment', 'Incomplete cycle, delay, loose ends'],
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_DECKS)) db.createObjectStore(STORE_DECKS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORE_READINGS)) db.createObjectStore(STORE_READINGS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORE_SPREADS)) db.createObjectStore(STORE_SPREADS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function getAll(storeName) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const request = tx.objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}
async function put(storeName, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}
async function remove(storeName, id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(id)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
function shuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
function exportJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
function cardCategory(name) {
  if (MAJOR_ARCANA.includes(name)) return 'Major Arcana'
  const suit = SUITS.find((s) => name.endsWith(`of ${s}`))
  return suit || 'Other'
}
function defaultMeaning(name, reversed) {
  const custom = CARD_MEANINGS[name]
  if (custom) return reversed ? custom[1] : custom[0]
  if (name.includes('Wands')) return reversed ? 'Restlessness, delay, burnout' : 'Drive, ambition, action'
  if (name.includes('Cups')) return reversed ? 'Emotional confusion, avoidance, imbalance' : 'Emotion, intuition, connection'
  if (name.includes('Swords')) return reversed ? 'Inner conflict, miscommunication, delay' : 'Mind, truth, conflict, clarity'
  if (name.includes('Pentacles')) return reversed ? 'Instability, scarcity, neglect' : 'Material life, grounding, resources'
  return reversed ? 'Blocked energy or inversion of the lesson' : 'Core meaning active and available'
}
function makeEmptyDeck(name = '') {
  return {
    id: uid(),
    name,
    createdAt: new Date().toISOString(),
    cards: TAROT_CARD_NAMES.map((cardName, index) => ({
      id: `${index + 1}`,
      name: cardName,
      image: '',
      personalNotes: '',
    })),
  }
}
function syncPayload({ decks, readings, customSpreads, settings }) {
  return {
    exportedAt: new Date().toISOString(),
    decks,
    readings,
    customSpreads,
    settings,
  }
}
function importPayload(payload) {
  return {
    decks: Array.isArray(payload?.decks) ? payload.decks : [],
    readings: Array.isArray(payload?.readings) ? payload.readings : [],
    customSpreads: Array.isArray(payload?.customSpreads) ? payload.customSpreads : [],
    settings: payload?.settings || { id: 'app-settings', cameraFirst: true },
  }
}
function spreadGridClass(count) {
  if (count <= 3) return 'spread-grid spread-grid-3'
  if (count <= 5) return 'spread-grid spread-grid-5'
  if (count <= 10) return 'spread-grid spread-grid-10'
  return 'spread-grid spread-grid-15'
}

function App() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('decks')
  const [decks, setDecks] = useState([])
  const [readings, setReadings] = useState([])
  const [customSpreads, setCustomSpreads] = useState([])
  const [settings, setSettings] = useState({ id: 'app-settings', cameraFirst: true })
  const [selectedDeckId, setSelectedDeckId] = useState('')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)

  useEffect(() => {
    Promise.all([getAll(STORE_DECKS), getAll(STORE_READINGS), getAll(STORE_SPREADS), getAll(STORE_SETTINGS)])
      .then(([storedDecks, storedReadings, storedSpreads, storedSettings]) => {
        setDecks(storedDecks)
        setReadings(storedReadings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        setCustomSpreads(storedSpreads)
        if (storedSettings[0]) setSettings(storedSettings[0])
        setSelectedDeckId(storedDecks[0]?.id || '')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    const handleInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    if (window.matchMedia?.('(display-mode: standalone)').matches) setIsInstalled(true)
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
  }

  const allSpreads = useMemo(() => [...PRESET_SPREADS, ...customSpreads], [customSpreads])
  const totalImages = useMemo(() => decks.reduce((sum, deck) => sum + deck.cards.filter((c) => c.image).length, 0), [decks])

  const saveSettings = async (next) => {
    setSettings(next)
    await put(STORE_SETTINGS, next)
  }

  if (loading) return <div className="loading-screen">Loading Tarot Practice Studio…</div>

  return (
    <div className="app-shell">
      <header className="hero card">
        <div>
          <div className="badge-row">
            <span className="badge">Installable Android-style PWA</span>
            <span className="badge">{isOffline ? 'Offline mode active' : 'Offline-ready'}</span>
            {installPrompt && !isInstalled && <button className="pill-button" onClick={installApp}>Install app</button>}
            {isInstalled && <span className="badge">Installed</span>}
          </div>
          <h1>Tarot Practice Studio</h1>
          <p>Build up to 15 digital tarot decks from your own photos, capture full decks card by card with a guided workflow, practice with 20 preset spreads plus custom layouts, save reading history, and move your full library between Samsung devices with backup sync files.</p>
        </div>
        <div className="stats-grid">
          <div className="stat"><span>Decks</span><strong>{decks.length}</strong></div>
          <div className="stat"><span>Card Images</span><strong>{totalImages}</strong></div>
          <div className="stat"><span>Spreads</span><strong>{allSpreads.length}</strong></div>
          <div className="stat"><span>Readings</span><strong>{readings.length}</strong></div>
        </div>
      </header>

      <nav className="tabbar card">
        {['decks', 'practice', 'history', 'custom', 'sync'].map((name) => (
          <button key={name} className={tab === name ? 'tab active' : 'tab'} onClick={() => setTab(name)}>
            {name === 'custom' ? 'Custom Spreads' : name[0].toUpperCase() + name.slice(1)}
          </button>
        ))}
      </nav>

      {tab === 'decks' && (
        <DeckBuilder
          decks={decks}
          setDecks={setDecks}
          selectedDeckId={selectedDeckId}
          setSelectedDeckId={setSelectedDeckId}
          settings={settings}
          saveSettings={saveSettings}
        />
      )}
      {tab === 'practice' && (
        <PracticeView decks={decks} readings={readings} setReadings={setReadings} allSpreads={allSpreads} />
      )}
      {tab === 'history' && <HistoryView readings={readings} setReadings={setReadings} />}
      {tab === 'custom' && <CustomSpreadsView customSpreads={customSpreads} setCustomSpreads={setCustomSpreads} />}
      {tab === 'sync' && (
        <SyncView
          decks={decks}
          setDecks={setDecks}
          readings={readings}
          setReadings={setReadings}
          customSpreads={customSpreads}
          setCustomSpreads={setCustomSpreads}
          settings={settings}
          setSettings={saveSettings}
        />
      )}
    </div>
  )
}

function DeckBuilder({ decks, setDecks, selectedDeckId, setSelectedDeckId, settings, saveSettings }) {
  const [newDeckName, setNewDeckName] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [activeCard, setActiveCard] = useState(null)
  const selectedDeck = decks.find((d) => d.id === selectedDeckId) || null

  const updateDeck = async (updatedDeck) => {
    await put(STORE_DECKS, updatedDeck)
    setDecks(decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)))
  }

  const createDeck = async () => {
    if (!newDeckName.trim() || decks.length >= MAX_DECKS) return
    const deck = makeEmptyDeck(newDeckName.trim())
    await put(STORE_DECKS, deck)
    setDecks([...decks, deck])
    setSelectedDeckId(deck.id)
    setNewDeckName('')
  }

  const removeDeckItem = async (id) => {
    await remove(STORE_DECKS, id)
    const next = decks.filter((d) => d.id !== id)
    setDecks(next)
    if (selectedDeckId === id) setSelectedDeckId(next[0]?.id || '')
  }

  const updateCardImage = async (index, file) => {
    if (!selectedDeck || !file) return
    const image = await fileToDataUrl(file)
    await updateDeck({
      ...selectedDeck,
      cards: selectedDeck.cards.map((card, i) => (i === index ? { ...card, image } : card)),
    })
  }

  const updateCardNotes = async (cardId, personalNotes) => {
    if (!selectedDeck) return
    await updateDeck({
      ...selectedDeck,
      cards: selectedDeck.cards.map((card) => (card.id === cardId ? { ...card, personalNotes } : card)),
    })
  }

  const filteredCards = useMemo(() => {
    if (!selectedDeck) return []
    return selectedDeck.cards.filter((card) => {
      const matchesQuery = card.name.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'All' || cardCategory(card.name) === filter
      return matchesQuery && matchesFilter
    })
  }, [selectedDeck, query, filter])

  return (
    <div className="two-col">
      <section className="card side-panel">
        <h2>Digital Decks</h2>
        <p className="muted">Touch-friendly deck management for phone and tablet.</p>
        <div className="input-row">
          <input value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} placeholder="Create a deck name" />
          <button onClick={createDeck} disabled={decks.length >= MAX_DECKS}>Add</button>
        </div>
        <div className="switch-row">
          <div>
            <strong>Camera-first mode</strong>
            <p className="muted">Open Samsung camera directly when possible.</p>
          </div>
          <input type="checkbox" checked={settings.cameraFirst} onChange={(e) => saveSettings({ ...settings, cameraFirst: e.target.checked })} />
        </div>
        <div className="deck-list">
          {decks.map((deck) => (
            <button key={deck.id} className={deck.id === selectedDeckId ? 'deck-item active' : 'deck-item'} onClick={() => setSelectedDeckId(deck.id)}>
              <div>
                <strong>{deck.name}</strong>
                <div className="muted small">{deck.cards.filter((c) => c.image).length} / 78 uploaded</div>
              </div>
              <span className="delete-link" onClick={(e) => { e.stopPropagation(); removeDeckItem(deck.id) }}>Delete</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card main-panel">
        {!selectedDeck ? <div className="empty-box">Select or create a deck to begin.</div> : (
          <>
            <div className="panel-header">
              <div>
                <h2>Deck Builder</h2>
                <input value={selectedDeck.name} onChange={(e) => updateDeck({ ...selectedDeck, name: e.target.value })} />
              </div>
              <div className="stack-actions">
                <GuidedCapture deck={selectedDeck} updateDeck={updateDeck} cameraFirst={settings.cameraFirst} />
                <button className="ghost" onClick={() => exportJson(`${selectedDeck.name || 'tarot-deck'}.json`, selectedDeck)}>Export Deck</button>
              </div>
            </div>

            <DeckCompletion deck={selectedDeck} />

            <div className="filters-row">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search card name" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                <option>Major Arcana</option>
                {SUITS.map((suit) => <option key={suit}>{suit}</option>)}
              </select>
            </div>

            <div className="card-grid">
              {filteredCards.map((card) => {
                const index = selectedDeck.cards.findIndex((c) => c.id === card.id)
                return (
                  <article key={card.id} className="mini-card">
                    <div className="mini-card-head">
                      <div>
                        <strong>{card.name}</strong>
                        <div className="muted small">{cardCategory(card.name)}</div>
                      </div>
                    </div>
                    <button className="image-frame" onClick={() => setActiveCard(card)}>
                      {card.image ? <img src={card.image} alt={card.name} /> : <span className="muted">No image uploaded</span>}
                    </button>
                    <label className="upload-button">
                      <input type="file" accept="image/*" capture={settings.cameraFirst ? 'environment' : undefined} onChange={(e) => updateCardImage(index, e.target.files?.[0])} hidden />
                      Capture / Upload
                    </label>
                    <textarea value={card.personalNotes || ''} onChange={(e) => updateCardNotes(card.id, e.target.value)} placeholder="Personal card notes" />
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>

      {activeCard && (
        <Modal onClose={() => setActiveCard(null)}>
          <div className="modal-card-image">{activeCard.image ? <img src={activeCard.image} alt={activeCard.name} /> : <div className="empty-box">No image</div>}</div>
          <h3>{activeCard.name}</h3>
          <p className="muted">{defaultMeaning(activeCard.name, false)}</p>
        </Modal>
      )}
    </div>
  )
}

function GuidedCapture({ deck, updateDeck, cameraFirst }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!deck) return
    const firstMissing = deck.cards.findIndex((card) => !card.image)
    setIndex(firstMissing >= 0 ? firstMissing : 0)
  }, [deck.id])

  const current = deck.cards[index]
  const uploaded = deck.cards.filter((card) => card.image).length

  const saveCurrent = async (file) => {
    if (!file) return
    const image = await fileToDataUrl(file)
    await updateDeck({
      ...deck,
      cards: deck.cards.map((card, i) => (i === index ? { ...card, image } : card)),
    })
    if (index < deck.cards.length - 1) setIndex(index + 1)
  }

  const nextMissing = () => {
    const next = deck.cards.findIndex((card, i) => i > index && !card.image)
    if (next >= 0) setIndex(next)
  }

  return (
    <>
      <button className="ghost" onClick={() => setOpen(true)}>Guided Full-Deck Capture</button>
      {open && (
        <Modal onClose={() => setOpen(false)} large>
          <div className="guided-header">
            <div>
              <h3>Photograph Full Deck</h3>
              <p className="muted">{deck.name} — Card {index + 1} of 78</p>
            </div>
            <div className="badge">{uploaded}/78 uploaded</div>
          </div>
          <progress max="78" value={uploaded}></progress>
          <div className="guided-layout">
            <div className="guided-preview image-frame tall">
              {current.image ? <img src={current.image} alt={current.name} /> : <span className="muted">No photo yet</span>}
            </div>
            <div className="guided-controls">
              <h4>{current.name}</h4>
              <p className="muted">{cardCategory(current.name)}</p>
              <input ref={fileRef} type="file" accept="image/*" capture={cameraFirst ? 'environment' : undefined} hidden onChange={(e) => saveCurrent(e.target.files?.[0])} />
              <button onClick={() => fileRef.current?.click()}>Capture Current Card</button>
              <button className="ghost" onClick={nextMissing}>Next Missing Card</button>
              <div className="input-row wrap">
                <button className="ghost" onClick={() => setIndex(Math.max(0, index - 1))}>Previous</button>
                <button className="ghost" onClick={() => setIndex(Math.min(deck.cards.length - 1, index + 1))}>Next</button>
                <button className="ghost" onClick={() => setIndex(0)}>Start Over</button>
              </div>
            </div>
          </div>
          <div className="guided-mini-grid">
            {deck.cards.map((card, i) => (
              <button key={card.id} className={i === index ? 'mini-progress active' : 'mini-progress'} onClick={() => setIndex(i)}>
                <div>{i + 1} {card.image ? '✓' : ''}</div>
                <span>{card.name}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

function DeckCompletion({ deck }) {
  const cards = deck.cards
  const uploaded = cards.filter((c) => c.image).length
  const groups = ['Major Arcana', ...SUITS].map((group) => {
    const total = cards.filter((c) => cardCategory(c.name) === group).length
    const done = cards.filter((c) => cardCategory(c.name) === group && c.image).length
    return { group, total, done }
  })
  return (
    <div className="completion-box">
      <div className="completion-head"><strong>Deck completion</strong><span>{uploaded} / 78</span></div>
      <progress max="78" value={uploaded}></progress>
      <div className="completion-grid">
        {groups.map((item) => (
          <div key={item.group} className="completion-item">
            <div className="completion-head"><span>{item.group}</span><span>{item.done}/{item.total}</span></div>
            <progress max={item.total} value={item.done}></progress>
          </div>
        ))}
      </div>
    </div>
  )
}

function PracticeView({ decks, readings, setReadings, allSpreads }) {
  const [deckId, setDeckId] = useState(decks[0]?.id || '')
  const [spreadId, setSpreadId] = useState(allSpreads[0]?.id || '')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [drawnCards, setDrawnCards] = useState([])
  const [activeCard, setActiveCard] = useState(null)

  const deck = decks.find((d) => d.id === deckId)
  const spread = allSpreads.find((s) => s.id === spreadId)
  const availableCards = deck?.cards.filter((c) => c.image) || []
  const canDraw = deck && spread && availableCards.length >= spread.positions.length

  const draw = () => {
    const items = shuffle(availableCards).slice(0, spread.positions.length).map((card, i) => ({
      ...card,
      position: spread.positions[i],
      reversed: Math.random() < 0.5,
    }))
    setDrawnCards(items)
  }
  const saveReading = async () => {
    if (!drawnCards.length || !deck || !spread) return
    const reading = {
      id: uid(),
      title: title || `${spread.name} Reading`,
      deckName: deck.name,
      spreadName: spread.name,
      createdAt: new Date().toISOString(),
      notes,
      drawnCards,
    }
    await put(STORE_READINGS, reading)
    setReadings([reading, ...readings])
  }

  return (
    <div className="two-col practice-view">
      <section className="card side-panel">
        <h2>Practice Setup</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional reading title" />
        <select value={deckId} onChange={(e) => setDeckId(e.target.value)}>
          <option value="">Select a deck</option>
          {decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.name}</option>)}
        </select>
        <select value={spreadId} onChange={(e) => setSpreadId(e.target.value)}>
          {allSpreads.map((spread) => <option key={spread.id} value={spread.id}>{spread.name}</option>)}
        </select>
        {spread && <div className="chips">{spread.positions.map((position) => <span className="chip" key={position}>{position}</span>)}</div>}
        <div className="input-row wrap">
          <button onClick={draw} disabled={!canDraw}>Randomize</button>
          <button className="ghost" onClick={saveReading} disabled={!drawnCards.length}>Save Reading</button>
        </div>
        {!canDraw && spread && <p className="muted">You need at least {spread.positions.length} uploaded cards in this deck.</p>}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Practice notes" className="big-notes" />
      </section>

      <section className="card main-panel">
        <h2>{title || 'Practice Reading'}</h2>
        {!drawnCards.length ? <div className="empty-box">Choose a deck and spread, then randomize the cards.</div> : (
          <div className={spreadGridClass(drawnCards.length)}>
            {drawnCards.map((card, index) => (
              <article key={`${card.id}-${index}`} className="spread-card">
                <div className="spread-top">
                  <strong>{card.position}</strong>
                  <span className="badge">{card.reversed ? 'Reversed' : 'Upright'}</span>
                </div>
                <button className="image-frame tall" onClick={() => setActiveCard(card)}>
                  <img src={card.image} alt={card.name} className={card.reversed ? 'reversed' : ''} />
                </button>
                <div className="spread-title">{card.name}</div>
                <p className="muted small">{defaultMeaning(card.name, card.reversed)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {activeCard && (
        <Modal onClose={() => setActiveCard(null)}>
          <div className="modal-card-image"><img src={activeCard.image} alt={activeCard.name} className={activeCard.reversed ? 'reversed' : ''} /></div>
          <h3>{activeCard.name}</h3>
          <div className="badge">{activeCard.reversed ? 'Reversed' : 'Upright'}</div>
          <p className="muted">{defaultMeaning(activeCard.name, activeCard.reversed)}</p>
        </Modal>
      )}
    </div>
  )
}

function HistoryView({ readings, setReadings }) {
  const [active, setActive] = useState(readings[0] || null)
  const deleteReading = async (id) => {
    await remove(STORE_READINGS, id)
    const next = readings.filter((r) => r.id !== id)
    setReadings(next)
    setActive(next[0] || null)
  }
  return (
    <div className="two-col">
      <section className="card side-panel">
        <h2>Reading History</h2>
        <div className="deck-list">
          {readings.map((reading) => (
            <button key={reading.id} className={active?.id === reading.id ? 'deck-item active' : 'deck-item'} onClick={() => setActive(reading)}>
              <div>
                <strong>{reading.title}</strong>
                <div className="muted small">{reading.spreadName} • {reading.deckName}</div>
              </div>
              <span className="delete-link" onClick={(e) => { e.stopPropagation(); deleteReading(reading.id) }}>Delete</span>
            </button>
          ))}
        </div>
      </section>
      <section className="card main-panel">
        {!active ? <div className="empty-box">No saved readings yet.</div> : (
          <>
            <h2>{active.title}</h2>
            <p className="muted">{active.spreadName} • {active.deckName} • {new Date(active.createdAt).toLocaleString()}</p>
            {active.notes && <div className="notes-box">{active.notes}</div>}
            <div className={spreadGridClass(active.drawnCards.length)}>
              {active.drawnCards.map((card, i) => (
                <article key={`${card.id}-${i}`} className="spread-card">
                  <div className="spread-top"><strong>{card.position}</strong><span className="badge">{card.reversed ? 'Reversed' : 'Upright'}</span></div>
                  <div className="image-frame tall"><img src={card.image} alt={card.name} className={card.reversed ? 'reversed' : ''} /></div>
                  <div className="spread-title">{card.name}</div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function CustomSpreadsView({ customSpreads, setCustomSpreads }) {
  const [name, setName] = useState('')
  const [positionsText, setPositionsText] = useState('')
  const addSpread = async () => {
    const positions = positionsText.split('\n').map((p) => p.trim()).filter(Boolean)
    if (!name.trim() || !positions.length) return
    const spread = { id: uid(), name: name.trim(), positions }
    await put(STORE_SPREADS, spread)
    setCustomSpreads([...customSpreads, spread])
    setName('')
    setPositionsText('')
  }
  const deleteSpread = async (id) => {
    await remove(STORE_SPREADS, id)
    setCustomSpreads(customSpreads.filter((spread) => spread.id !== id))
  }
  return (
    <div className="card main-panel">
      <h2>Custom Spreads</h2>
      <div className="input-row wrap">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spread name" />
        <button onClick={addSpread}>Add Spread</button>
      </div>
      <textarea value={positionsText} onChange={(e) => setPositionsText(e.target.value)} placeholder={'Card 1\nCard 2\nCard 3'} className="big-notes" />
      <div className="deck-list two-up">
        {customSpreads.map((spread) => (
          <div key={spread.id} className="deck-item static-item">
            <div><strong>{spread.name}</strong><div className="muted small">{spread.positions.length} positions</div></div>
            <span className="delete-link" onClick={() => deleteSpread(spread.id)}>Delete</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SyncView({ decks, setDecks, readings, setReadings, customSpreads, setCustomSpreads, settings, setSettings }) {
  const inputRef = useRef(null)
  const exportAll = () => exportJson('tarot-practice-sync-backup.json', syncPayload({ decks, readings, customSpreads, settings }))
  const importAll = async (file) => {
    if (!file) return
    const payload = importPayload(JSON.parse(await file.text()))
    for (const item of payload.decks) await put(STORE_DECKS, item)
    for (const item of payload.readings) await put(STORE_READINGS, item)
    for (const item of payload.customSpreads) await put(STORE_SPREADS, item)
    await put(STORE_SETTINGS, payload.settings)
    setDecks(payload.decks)
    setReadings(payload.readings)
    setCustomSpreads(payload.customSpreads)
    setSettings(payload.settings)
  }
  return (
    <div className="card main-panel">
      <h2>Sync-Ready Backup</h2>
      <p className="muted">This package is offline-first and sync-ready. Right now, you can export one complete backup file from your Samsung phone and import it into your Samsung tablet. Later, this same app structure can be connected to Firebase, Supabase, Google Drive, or another backend.</p>
      <div className="input-row wrap">
        <button onClick={exportAll}>Export Full Backup</button>
        <button className="ghost" onClick={() => inputRef.current?.click()}>Import Full Backup</button>
        <input ref={inputRef} type="file" accept="application/json" hidden onChange={(e) => importAll(e.target.files?.[0])} />
      </div>
    </div>
  )
}

function Modal({ children, onClose, large = false }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={large ? 'modal large' : 'modal'} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  )
}

export default App
