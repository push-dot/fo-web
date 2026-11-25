export const listTotal = (envelope: { data: unknown[]; page: { total?: number } }) =>
  envelope.page.total ?? envelope.data.length
