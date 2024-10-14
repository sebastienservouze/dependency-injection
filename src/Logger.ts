export interface ILogger {
    verbose?(...data: any[]): void;
    debug(...data: any[]): void;
    log?(...data: any[]): void;
    info?(...data: any[]): void;
    warn?(...data: any[]): void;
    error?(...data: any[]): void;
}