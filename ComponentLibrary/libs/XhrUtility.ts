export default class XhrUtility {
    static get<T>(url, map: (data: any) => T = (data) => data): Promise<T> {
        return this.makeRequest<T>('GET', url, null, map);
    }

    static post<T>(url, data, map: (data: any) => T = (data) => data): Promise<T> {
        return this.makeRequest<T>('POST', url, data, map);
    }

    static delete(url): Promise<void> {
        return this.makeRequest<void>('DELETE', url);
    }

    private static makeRequest<T>(method, url, data: any = null, map: (data: any) => T = (data) => data): Promise<T> {
        return new Promise(
            (resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (xhr.response) {
                            const parsedResponse = JSON.parse(xhr.response);
                            resolve(map(parsedResponse));
                        }
                        else {
                            resolve();
                        }
                    } else {
                        if (!(xhr.status === 401)) {
                            reject({
                                status: xhr.status,
                                statusText: xhr.statusText
                            });
                        }
                    }
                };
                xhr.onerror = () => {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                };
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                if (data === null) {
                    xhr.send();
                }
                else {
                    xhr.send(JSON.stringify(data));
                }
            }
        );
    }
}