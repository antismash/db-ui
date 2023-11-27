export function fetchJsonResponse(data: any) {
    return { json: () => new Promise((resolve) => resolve(data)), ok: true };
}

export function fetchInvalidJsonResponse(error: Error | string) {
    let err: Error;
    if (typeof error == "string") {
        err = new Error(error);
    } else {
        err = error;
    }
    return { json: () => new Promise((_, reject) => reject(err)), ok: true };
}

export function fetchErrorResponse(statusText: string) {
    return { ok: false, statusText: statusText, status: 418 };
}

export function fetchEmptyResponse() {
    return { ok: true, status: 204 };
}
