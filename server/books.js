/**
 * A chapter from a classic, out of copyright, from Project Gutenberg.
 *
 * Only the books listed in shared/books.json -- chosen to suit everyone --
 * and only from gutenberg.org. A book is fetched once, split into its
 * chapters, and kept; the room is given one chapter at random. Gutenberg
 * asks that its site is not hammered, and this way each book is fetched
 * rarely.
 */
const books = require('../shared/books.json');

const TIMEOUT_MS = 15_000;
const KEEP_BOOKS = 12;
/** A chapter longer than this is cut, with a link to read on. */
const MAX_CHARS = 9_000;
const HEADERS = { 'User-Agent': 'WebOfDoors/1.0 (https://doors.purplefootsteps.co.uk)' };

/** id -> chapters, in the order they were last used. */
const kept = new Map();

/** The text between Gutenberg's own header and footer. */
function bodyOf(text) {
  const start = text.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i);
  const end = text.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i);
  const from = start >= 0 ? text.indexOf('\n', start) + 1 : 0;
  return text.slice(from, end >= 0 ? end : undefined);
}

const NUMBER_WORDS = [
  'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE',
  'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY',
  'THIRTY', 'FORTY', 'FIFTY',
].flatMap((w) => [w, w[0] + w.slice(1).toLowerCase()]);
const NUMBER = `(?:[IVXLCDM]+|\\d+|(?:${NUMBER_WORDS.join('|')})(?:-[A-Za-z]+)?)`;

/**
 * The ways books head their chapters, most explicit first: "CHAPTER I.",
 * "Chapter Twenty-One", "ADVENTURE II."; a numeral on its own, "IV." or
 * "IV. THE SEA-CHEST"; or a bare number on its own line.
 */
const HEADINGS = [
  new RegExp(`^[ \\t]*((?:CHAPTER|Chapter|ADVENTURE|STAVE|Stave|BOOK|PART)[ \\t]+${NUMBER}\\b[^\\n]*)$`, 'gm'),
  /^[ \t]*([IVXLC]+\.?|[IVXLC]+\.[ \t]+[^\n]*)$/gm,
  /^[ \t]*(\d{1,2}\.?)[ \t]*$/gm,
];

/** A chapter shorter than this is a line of a contents page, not a chapter. */
const SHORTEST_CHAPTER = 1_500;

function chaptersBy(body, heading) {
  const marks = [...body.matchAll(heading)];
  const pieces = marks.map((mark, i) => ({
    // A bare numeral says more as "Chapter 4".
    heading: mark[1].trim().replace(/^([IVXLC]+|\d+)\.?$/, 'Chapter $1'),
    text: body.slice(mark.index + mark[0].length, i + 1 < marks.length ? marks[i + 1].index : body.length).trim(),
  }));
  // The last line of a contents page runs on to the first real chapter, so
  // anything straight after two or more contents lines is not a chapter.
  return pieces.filter(
    (piece, i) =>
      piece.text.length > SHORTEST_CHAPTER &&
      !(i >= 2 && pieces.slice(i - 2, i).every((p) => p.text.length < 300))
  );
}

/**
 * Split into chapters by whichever way of heading them finds the most. A
 * book with none is cut into passages instead.
 */
function chaptersOf(body) {
  const chapters = HEADINGS.map((heading) => chaptersBy(body, heading)).reduce((best, next) =>
    next.length > best.length ? next : best
  );
  if (chapters.length >= 3) return chapters;

  const passages = [];
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (let i = 0; i < paragraphs.length; i += 30) {
    passages.push({ heading: '', text: paragraphs.slice(i, i + 30).join('\n\n') });
  }
  return passages;
}

/** Paragraphs, with Gutenberg's hard line breaks inside them undone. */
function paragraphsOf(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').replace(/_/g, '').trim())
    // Where the printed book had a picture.
    .filter((p) => p.length > 0 && !/^\[Illustration[^\]]*\]$/i.test(p));
}

async function loadBook(book) {
  if (kept.has(book.id)) {
    const chapters = kept.get(book.id);
    kept.delete(book.id);
    kept.set(book.id, chapters);
    return chapters;
  }
  const url = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt`;
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} from Gutenberg`);
  const chapters = chaptersOf(bodyOf((await response.text()).replace(/\r\n?/g, '\n')));
  if (!chapters.length) throw new Error('No chapters found');

  if (kept.size >= KEEP_BOOKS) kept.delete(kept.keys().next().value);
  kept.set(book.id, chapters);
  return chapters;
}

async function handleChapter(req, res) {
  res.set('Cache-Control', 'no-store');
  const book = books.find((b) => String(b.id) === req.params.book);
  if (!book) return res.status(400).json({ error: 'Not one of our books.' });

  try {
    const chapters = await loadBook(book);
    const index = Math.floor(Math.random() * chapters.length);
    const chapter = chapters[index];

    let paragraphs = paragraphsOf(chapter.text);
    let heading = chapter.heading;
    // Many books put the chapter's name on the line under its number:
    // "CHAPTER V." then "Advice from a Caterpillar". That belongs in the
    // heading, not as the first paragraph.
    const [first] = paragraphs;
    if (
      paragraphs.length > 1 &&
      first.length < 80 &&
      !/^["“‘']/.test(first) &&
      (!/[a-z]/.test(first) || !/[.!?:;,”"’]$/.test(first))
    ) {
      heading = heading ? `${heading.replace(/\.$/, '')}: ${first.replace(/\.$/, '')}` : first;
      paragraphs = paragraphs.slice(1);
    }
    let cut = false;
    let total = 0;
    // Always at least the first paragraph, however long it is.
    paragraphs = paragraphs.filter((p, i) => {
      total += p.length;
      if (total > MAX_CHARS && i > 0) cut = true;
      return total <= MAX_CHARS || i === 0;
    });

    return res.json({
      title: book.title,
      author: book.author,
      heading,
      paragraphs,
      cut,
      link: `https://www.gutenberg.org/ebooks/${book.id}`,
    });
  } catch (error) {
    console.error('[chapter] could not read the book:', error.message);
    return res.status(502).json({ error: 'The book could not be fetched.' });
  }
}

module.exports = { handleChapter, chaptersOf, bodyOf, paragraphsOf };
