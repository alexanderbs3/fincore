import { Page } from '../models/models';

/**
 * Normaliza a resposta de paginação do Spring Data.
 * O backend pode retornar em dois formatos:
 *  1. Flat: { content, totalElements, totalPages, number, size }
 *  2. Nested: { content, page: { totalElements, totalPages, number, size } }
 * Esta função centraliza esse tratamento — NÃO duplicar nos services.
 */
export function normalizePage<T>(raw: unknown): Page<T> {
  const r = raw as Record<string, unknown>;

  if (r['page'] && typeof r['page'] === 'object') {
    const p = r['page'] as Record<string, unknown>;
    const number = (p['number'] as number) ?? 0;
    const totalPages = (p['totalPages'] as number) ?? 1;
    return {
      content:       (r['content'] as T[]) ?? [],
      totalElements: (p['totalElements'] as number) ?? 0,
      totalPages,
      number,
      size:          (p['size'] as number) ?? 10,
      first:         number === 0,
      last:          number + 1 >= totalPages,
    };
  }

  const number = (r['number'] as number) ?? 0;
  const totalPages = (r['totalPages'] as number) ?? 1;
  return {
    content:       (r['content'] as T[]) ?? [],
    totalElements: (r['totalElements'] as number) ?? 0,
    totalPages,
    number,
    size:          (r['size'] as number) ?? 10,
    first:         (r['first'] as boolean) ?? number === 0,
    last:          (r['last'] as boolean) ?? number + 1 >= totalPages,
  };
}
