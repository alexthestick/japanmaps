/** Google photo copying has been retired. */
export async function fetchGooglePhotosServerless(): Promise<never> {
  throw new Error('Google photos cannot be imported or stored.');
}

export async function migrateStorePhotosViaEdge(): Promise<never> {
  throw new Error('Google photos cannot be imported or stored.');
}
