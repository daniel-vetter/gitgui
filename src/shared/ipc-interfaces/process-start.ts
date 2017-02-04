export const PROCESS_START_REQUEST = "process-start-request";
export const PROCESS_START_RESPONSE = "process-start-response";
export const PROCESS_START_RESPONSE_TYPE_EXIT = "exit";
export const PROCESS_START_RESPONSE_TYPE_STDOUT = "stdout";
export const PROCESS_START_RESPONSE_TYPE_STDERR = "stderr";

export interface ProcessStartRequest {
    id: number;
    command: string;
    args: string[];
    workDirectory: string;
}

export interface ProcessStartResponse {
    id: number;
    type: string;
    data: string;
    code: number;
}