import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface BufferItem {
    id: bigint;
    status: BufferStatus;
    queuedAt: bigint;
    taskId: bigint;
    retryCount: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface CloudRecord {
    id: bigint;
    data: string;
    taskId: bigint;
    syncedAt: bigint;
    category: IntentCategory;
}
export interface Analytics {
    totalTasks: bigint;
    successRate: bigint;
    totalMessages: bigint;
    bufferSize: bigint;
    tasksByCategory: {
        ticket: bigint;
        finance: bigint;
        hotel: bigint;
        food: bigint;
    };
    syncedCount: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ChatMessage {
    id: bigint;
    content: string;
    userId: Principal;
    entities: Array<[string, string]>;
    intent: IntentCategory;
    timestamp: bigint;
}
export interface AutomationTask {
    id: bigint;
    status: TaskStatus;
    userId: Principal;
    createdAt: bigint;
    category: IntentCategory;
    payload: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum BufferStatus {
    flushing = "flushing",
    queued = "queued",
    failed = "failed",
    synced = "synced"
}
export enum IntentCategory {
    ticket = "ticket",
    finance = "finance",
    hotel = "hotel",
    food = "food",
    unknown_ = "unknown"
}
export enum TaskStatus {
    pending = "pending",
    done = "done",
    processing = "processing",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCloudRecord(taskId: bigint, data: string, category: string): Promise<CloudRecord>;
    addToBuffer(taskId: bigint): Promise<BufferItem>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(category: string, payload: string): Promise<AutomationTask>;
    flushBuffer(): Promise<bigint>;
    getAnalytics(): Promise<Analytics>;
    getBufferQueue(): Promise<Array<BufferItem>>;
    getCallerUserRole(): Promise<UserRole>;
    getCloudRecords(): Promise<Array<CloudRecord>>;
    getMessages(): Promise<Array<ChatMessage>>;
    getTasks(): Promise<Array<AutomationTask>>;
    isCallerAdmin(): Promise<boolean>;
    pingExternalService(url: string): Promise<string>;
    sendMessage(content: string): Promise<ChatMessage>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateTaskStatus(taskId: bigint, status: string): Promise<boolean>;
}
