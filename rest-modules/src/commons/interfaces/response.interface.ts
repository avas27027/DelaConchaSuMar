export type Response<T = unknown> = {
    success: boolean;
    message: string;
    data?: T;
} & Pagination

type Pagination = {
    nextCursor?: string | null;
    hasMore?: boolean;
    total?: number;
}