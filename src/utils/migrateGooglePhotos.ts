/** Google photo copying has been retired. */
export async function migrateStorePhotos(): Promise<never> {
  throw new Error('Google photos cannot be imported or stored.');
}
