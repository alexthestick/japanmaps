export function isAuthorizedCronRequest(request: Request, expectedSecret: string | undefined): boolean {
  const suppliedSecret = request.headers.get('x-cron-secret');
  return Boolean(expectedSecret && suppliedSecret && suppliedSecret === expectedSecret);
}
