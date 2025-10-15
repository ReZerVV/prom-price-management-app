export async function getLogs(
  page?: number,
  perPage?: number,
) {
  return (window as any).api.getLogs({
    page,
    perPage,
  })
}
