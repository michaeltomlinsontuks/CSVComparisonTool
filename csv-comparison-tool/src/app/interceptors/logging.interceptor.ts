import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export function loggingInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const startTime = Date.now();
  console.log(`[HTTP] Request: ${request.method} ${request.url}`);

  return next(request).pipe(
    tap(
      (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`[HTTP] Response: ${request.method} ${request.url} - ${event.status} (${duration}ms)`);
          if (!(event.body instanceof Blob)) {
            console.log('[HTTP] Response body:', event.body);
          } else {
            console.log('[HTTP] Response: Blob data');
          }
        }
      },
      (error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        console.error(`[HTTP] Error: ${request.method} ${request.url} - ${error.status} (${duration}ms)`);
        console.error('[HTTP] Error details:', error.message);
        if (error.error instanceof ErrorEvent) {
          console.error('[HTTP] Client-side error:', error.error.message);
        } else {
          console.error('[HTTP] Server-side error:', error.error);
        }
      }
    )
  );
}
