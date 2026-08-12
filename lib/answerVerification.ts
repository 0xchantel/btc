/**
 * Answer Verification Service
 * Handles verification of player answers using AI and pattern matching
 */

export interface AnswerVerificationRequest {
  playerId: string
  category: 'place' | 'animal' | 'object' | 'name' | 'color'
  answer: string
  letter: string
}

export interface VerificationResponse {
  playerId: string
  category: 'place' | 'animal' | 'object' | 'name' | 'color'
  answer: string
  isCorrect: boolean
  confidence: number // 0-100
  reason: string
}

const ANSWER_DATABASE = {
  place: [
    'Australia', 'Austria', 'Argentina', 'Algeria', 'Angola',
    'Brazil', 'Belgium', 'Belarus', 'Bangladesh', 'Bolivia',
    'Canada', 'China', 'Colombia', 'Croatia', 'Cuba',
    'Denmark', 'Dominican Republic', 'Egypt', 'Estonia', 'Ethiopia',
    'France', 'Finland', 'Germany', 'Greece', 'Ghana',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland',
    'Jamaica', 'Japan', 'Kenya', 'Korea', 'Latvia',
    'Lithuania', 'Malaysia', 'Mexico', 'Netherlands', 'Nigeria',
    'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Romania', 'Russia', 'Singapore', 'Slovakia',
    'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
    'Uganda', 'Ukraine', 'United Kingdom', 'USA', 'Vietnam',
    'Yemen', 'Zambia', 'Zimbabwe',
  ],
  animal: [
    'Ant', 'Alligator', 'Antelope', 'Albatross', 'Anaconda',
    'Bear', 'Bat', 'Bee', 'Buffalo', 'Butterfly',
    'Cat', 'Cheetah', 'Cow', 'Crocodile', 'Camel',
    'Dog', 'Dolphin', 'Donkey', 'Duck', 'Deer',
    'Eagle', 'Emu', 'Elephant', 'Elk', 'Eel',
    'Fox', 'Flamingo', 'Fish', 'Frog', 'Ferret',
    'Giraffe', 'Gorilla', 'Goat', 'Guinea Pig', 'Goose',
    'Horse', 'Hippo', 'Hedgehog', 'Hound', 'Hyena',
    'Iguana', 'Ibis', 'Impala', 'Ibex', 'Insect',
    'Jaguar', 'Jellyfish', 'Jay', 'Jackal', 'Junco',
    'Kangaroo', 'Koala', 'Kiwi', 'King Crab', 'Killdeer',
    'Lion', 'Leopard', 'Llama', 'Lobster', 'Lynx',
    'Monkey', 'Moose', 'Mouse', 'Mole', 'Macaw',
    'Newt', 'Narwhal', 'Nightingale', 'Numbat', 'Nautilus',
    'Owl', 'Otter', 'Ocelot', 'Ostrich', 'Orangutan',
    'Penguin', 'Panda', 'Panther', 'Parrot', 'Peacock',
    'Quail', 'Quokka', 'Queen Bee', 'Quelea', 'Quahog',
    'Rabbit', 'Raccoon', 'Raven', 'Rhino', 'Reindeer',
    'Snake', 'Squirrel', 'Shark', 'Sheep', 'Swan',
    'Tiger', 'Toucan', 'Turtle', 'Turkey', 'Toad',
    'Unicorn Fish', 'Uakari', 'Urchin', 'Unau', 'Uguisu',
    'Vulture', 'Viper', 'Vicuña', 'Vole', 'Volant',
    'Whale', 'Wolf', 'Walrus', 'Woodpecker', 'Wombat',
    'X-ray Fish', 'Xantus Hummingbird', 'Xeme', 'Xantus Murrelet', 'Xantus Murre',
    'Yak', 'Yellowfin Tuna', 'Yellow Warbler', 'Yak', 'Yangtze Finless Porpoise',
    'Zebra', 'Zonure', 'Zigzag Heron', 'Zone-tailed Hawk', 'Zander',
  ],
  object: [
    'Apple', 'Anchor', 'Arrow', 'Anchor', 'Alarm Clock',
    'Ball', 'Book', 'Bottle', 'Balloon', 'Backpack',
    'Car', 'Cup', 'Chair', 'Camera', 'Candle',
    'Desk', 'Door', 'Diamond', 'Drum', 'Doll',
    'Egg', 'Elevator', 'Envelope', 'Eye', 'Eraser',
    'Fork', 'Flower', 'Flashlight', 'Fan', 'Flag',
    'Glass', 'Gloves', 'Guitar', 'Gate', 'Gear',
    'Hat', 'Hammer', 'Heart', 'House', 'Hook',
    'Ice Cube', 'Iron', 'Ink', 'Igloo', 'Indigo',
    'Jar', 'Jacket', 'Jug', 'Jigsaw', 'Jewelry',
    'Key', 'Kite', 'Knife', 'Kettle', 'Keychain',
    'Lamp', 'Ladder', 'Laptop', 'Lock', 'Lens',
    'Mirror', 'Mug', 'Microscope', 'Map', 'Medal',
    'Necklace', 'Notebook', 'Nail', 'Net', 'Needle',
    'Orange', 'Oven', 'Ornament', 'Oar', 'Oil Lamp',
    'Pen', 'Plate', 'Pencil', 'Painting', 'Pillow',
    'Quill', 'Quartz', 'Quilted Blanket', 'Quiver', 'Quote',
    'Ring', 'Rope', 'Ruler', 'Rifle', 'Rug',
    'Shoe', 'Spoon', 'Scissors', 'Sofa', 'Stamp',
    'Table', 'Tape', 'Telescope', 'Tie', 'Toy',
    'Umbrella', 'Urn', 'Utensil', 'Uniform', 'USB Drive',
    'Vase', 'Violin', 'Vacuum', 'Valve', 'Vinyl Record',
    'Watch', 'Wallet', 'Whistle', 'Wheel', 'Window',
    'X-Ray Machine', 'Xylophone', 'X-acto Knife', 'Xerox Machine', 'X-ray Tube',
    'Yarn', 'Yo-yo', 'Yoke', 'Yacht Model', 'Yellow Ribbon',
    'Zipper', 'Zootrope', 'Zither', 'Zone Map', 'Zinc Kettle',
  ],
  name: [
    'Alice', 'Andrew', 'Anna', 'Anthony', 'Amanda',
    'Bob', 'Benjamin', 'Bella', 'Brandon', 'Barbara',
    'Charlie', 'Christopher', 'Catherine', 'Charles', 'Caroline',
    'David', 'Daniel', 'Diana', 'Donald', 'Dorothy',
    'Edward', 'Eric', 'Elizabeth', 'Edmund', 'Eleanor',
    'Frank', 'Frederick', 'Frances', 'Franklin', 'Fiona',
    'George', 'Gregory', 'Grace', 'Gerald', 'Gloria',
    'Henry', 'Harold', 'Helen', 'Howard', 'Hannah',
    'Isaac', 'Ivan', 'Iris', 'Ismail', 'Iva',
    'Jack', 'James', 'Jane', 'John', 'Joan',
    'Kevin', 'Kenneth', 'Katherine', 'Keith', 'Karen',
    'Larry', 'Leonard', 'Laura', 'Lawrence', 'Linda',
    'Michael', 'Mark', 'Michelle', 'Matthew', 'Maria',
    'Nicholas', 'Nathan', 'Nancy', 'Neil', 'Natalie',
    'Oliver', 'Oscar', 'Olivia', 'Otto', 'Ophelia',
    'Paul', 'Peter', 'Patricia', 'Philip', 'Paula',
    'Quincy', 'Quentin', 'Quinn', 'Quest', 'Quirina',
    'Robert', 'Richard', 'Rachel', 'Roger', 'Rose',
    'Steven', 'Stephen', 'Susan', 'Samuel', 'Sarah',
    'Thomas', 'Timothy', 'Tammy', 'Terrence', 'Theresa',
    'Ulysses', 'Ugo', 'Ursula', 'Ubaldo', 'Uta',
    'Victor', 'Vincent', 'Victoria', 'Valentino', 'Valerie',
    'William', 'Walter', 'Wendy', 'Wayne', 'Wanda',
    'Xavier', 'Xander', 'Xiomara', 'Xenia', 'Xyla',
    'Yancy', 'Yuri', 'Yasmine', 'Yael', 'Yolanda',
    'Zachary', 'Zeke', 'Zara', 'Zeke', 'Ziva',
  ],
  color: [
    'Azure', 'Aqua', 'Apricot', 'Amber', 'Avocado',
    'Blue', 'Brown', 'Beige', 'Burgundy', 'Bronze',
    'Cyan', 'Coral', 'Chocolate', 'Chartreuse', 'Crimson',
    'Dark Green', 'Denim', 'Desert Sand', 'Dull Purple', 'Deep Blue',
    'Ebony', 'Ecru', 'Emerald', 'Eggplant', 'Evergreen',
    'Fawn', 'Fuchsia', 'Forest Green', 'Floral White', 'Firebrick',
    'Gold', 'Gray', 'Green', 'Goldenrod', 'Gainsboro',
    'Hot Pink', 'Hazel', 'Honeydew', 'Hue', 'Heather',
    'Indigo', 'Ivory', 'Iris', 'Ink', 'Iron',
    'Jade', 'Jet', 'Jasmine', 'Juniper', 'Jonquil',
    'Khaki', 'Kiwi', 'Khmer', 'Kraft', 'Kale',
    'Lavender', 'Lime', 'Linen', 'Light Blue', 'Lemon',
    'Magenta', 'Maroon', 'Mint', 'Mauve', 'Mahogany',
    'Navy', 'Nude', 'Neon', 'Nickel', 'Natural',
    'Orange', 'Olive', 'Orchid', 'Opal', 'Ochre',
    'Purple', 'Pink', 'Plum', 'Puce', 'Peach',
    'Quinoa', 'Quartz', 'Quantum', 'Quicksand', 'Quahog',
    'Red', 'Rose', 'Rust', 'Raven', 'Rosy Brown',
    'Silver', 'Salmon', 'Sand', 'Scarlet', 'Sepia',
    'Tan', 'Teal', 'Taupe', 'Thistle', 'Tomato',
    'Umber', 'Ultramarine', 'Umber', 'Unbleached', 'Uranium',
    'Violet', 'Vanilla', 'Venetian Red', 'Verdigris', 'Vermilion',
    'White', 'Wheat', 'Wine', 'Wisteria', 'Walnut',
    'X-Ray', 'Xanadu', 'Xanthan', 'Xeric', 'Xanthic',
    'Yellow', 'Yolk', 'Yellowish', 'Yucca', 'Yardstick',
    'Zinc', 'Zinnwaldite', 'Zodiac', 'Zoology', 'Zulu',
  ],
}

/**
 * Verify a single answer
 */
export async function verifyAnswer(request: AnswerVerificationRequest): Promise<VerificationResponse> {
  const { playerId, category, answer, letter } = request
  const normalizedAnswer = answer.toLowerCase().trim()
  const normalizedLetter = letter.toUpperCase()

  // Get database for category
  const categoryAnswers = ANSWER_DATABASE[category]
  if (!categoryAnswers) {
    return {
      playerId,
      category,
      answer,
      isCorrect: false,
      confidence: 0,
      reason: 'Invalid category',
    }
  }

  // Check if answer starts with correct letter
  if (!normalizedAnswer.startsWith(normalizedLetter.toLowerCase())) {
    return {
      playerId,
      category,
      answer,
      isCorrect: false,
      confidence: 95,
      reason: `Answer must start with letter ${normalizedLetter}`,
    }
  }

  // Check against database (fuzzy matching)
  const isExactMatch = categoryAnswers.some(
    (a) => a.toLowerCase() === normalizedAnswer
  )

  if (isExactMatch) {
    return {
      playerId,
      category,
      answer,
      isCorrect: true,
      confidence: 100,
      reason: 'Valid answer found in database',
    }
  }

  // Fuzzy match (check similarity)
  const similarityScore = checkSimilarity(normalizedAnswer, categoryAnswers)
  const isValidByProximity = similarityScore > 0.8

  if (isValidByProximity) {
    return {
      playerId,
      category,
      answer,
      isCorrect: true,
      confidence: Math.round(similarityScore * 100),
      reason: 'Close match found',
    }
  }

  // Check if answer is a common variation
  const isCommonVariation = checkCommonVariations(normalizedAnswer, category, normalizedLetter)
  if (isCommonVariation) {
    return {
      playerId,
      category,
      answer,
      isCorrect: true,
      confidence: 85,
      reason: 'Valid variation accepted',
    }
  }

  return {
    playerId,
    category,
    answer,
    isCorrect: false,
    confidence: 70,
    reason: 'Answer not recognized in category database',
  }
}

/**
 * Verify multiple answers at once
 */
export async function verifyAnswers(
  requests: AnswerVerificationRequest[]
): Promise<VerificationResponse[]> {
  return Promise.all(requests.map((req) => verifyAnswer(req)))
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function checkSimilarity(input: string, validAnswers: string[]): number {
  let maxScore = 0

  for (const validAnswer of validAnswers) {
    const normalizedValid = validAnswer.toLowerCase()
    const score = calculateLevenshteinSimilarity(input, normalizedValid)
    maxScore = Math.max(maxScore, score)
  }

  return maxScore
}

/**
 * Levenshtein distance-based similarity
 */
function calculateLevenshteinSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate edit distance (Levenshtein distance)
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

/**
 * Check for common variations (plurals, misspellings, etc.)
 */
function checkCommonVariations(
  answer: string,
  category: string,
  letter: string
): boolean {
  // Remove common suffixes and check
  const variations = [
    answer,
    answer.replace(/s$/, ''), // Remove plural 's'
    answer.replace(/es$/, ''), // Remove 'es'
    answer.replace(/ies$/, 'y'), // Change 'ies' to 'y'
  ]

  const categoryAnswers = ANSWER_DATABASE[category as keyof typeof ANSWER_DATABASE] || []
  return variations.some((v) =>
    categoryAnswers.some((a) => a.toLowerCase() === v && a.charAt(0).toUpperCase() === letter)
  )
}

/**
 * Get random valid answers for hints
 */
export function getRandomAnswers(
  category: 'place' | 'animal' | 'object' | 'name' | 'color',
  letter: string,
  count: number = 3
): string[] {
  const categoryAnswers = ANSWER_DATABASE[category] || []
  const filtered = categoryAnswers.filter(
    (a) => a.charAt(0).toUpperCase() === letter.toUpperCase()
  )

  const shuffled = filtered.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
