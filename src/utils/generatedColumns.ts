/**
 * Columns Postgres computes for us (`GENERATED ALWAYS AS (...) STORED`),
 * keyed by table. Explicitly setting ANY value for one of these in an
 * insert or update — even a value that "matches" what Postgres would
 * compute — throws Postgres error 428C9: "cannot insert a non-DEFAULT
 * value into column". Omitting the field is not a workaround, it's the
 * only correct option: Postgres still computes and stores the real value
 * automatically, every time, from the row's other columns.
 *
 * `stores.normalized_name` has broken production TWICE by being added back
 * to an insert payload — once directly, once via a plausible-sounding "but
 * fuzzy dedup needs it populated" justification (it doesn't: Postgres
 * populates it automatically on every insert, so find_store_duplicates()'s
 * fuzzy_name tier already works with zero client involvement). If you're
 * about to add a column from this list to a payload to fix some other
 * problem, that problem needs a different fix — this list stays the single
 * source of truth for "never set this by hand," and assertNoGeneratedColumns
 * below is what actually enforces it at runtime.
 */
export const GENERATED_COLUMNS = {
  stores: ['normalized_name'],
} as const;

type GeneratedTable = keyof typeof GENERATED_COLUMNS;

/**
 * Throws immediately, with a clear explanation, if `payload` sets any
 * column Postgres generates itself for `table`. Call this on every
 * insert/update payload built for that table, right before it's sent to
 * Supabase — it turns a cryptic Postgres 428C9 failure (or, worse, a
 * silently-reintroduced bug that isn't caught until a real approval fails
 * in production) into an immediate, self-explanatory error at the exact
 * call site that caused it.
 */
export function assertNoGeneratedColumns(table: GeneratedTable, payload: Record<string, unknown>): void {
  const offending = GENERATED_COLUMNS[table].filter((col) => col in payload);
  if (offending.length === 0) return;

  const cols = offending.join(', ');
  const plural = offending.length > 1;
  throw new Error(
    `Refusing to write to "${table}": payload explicitly sets generated column${plural ? 's' : ''} ` +
      `${cols}. Postgres computes ${plural ? 'these columns' : 'this column'} automatically ` +
      `(GENERATED ALWAYS) — remove ${plural ? 'them' : 'it'} from the payload instead of setting ` +
      `${plural ? 'them' : 'it'}. See src/utils/generatedColumns.ts for why.`,
  );
}
