import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CustomResponse } from '../interface/custom-response';
import { Status } from './../enum/status.enum';
import { Server } from './../interface/server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private readonly apiUrl = 'http://localhost:8080/server';

  constructor(private http: HttpClient) {}

  servers$ = <Observable<CustomResponse>>(
    this.http
      .get<CustomResponse>(`${this.apiUrl}/list`)
      .pipe(tap(console.log), catchError(this.handleError))
  );

  save$ = (server: Server) =>
    <Observable<CustomResponse>>(
      this.http
        .post<CustomResponse>(`${this.apiUrl}/save`, server)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  ping$ = (ipAddress: string) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(`${this.apiUrl}/ping/${ipAddress}`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  filter$ = (status: Status, response: CustomResponse) =>
    new Observable<CustomResponse>((suscriber) => {
      console.log(response);
      suscriber.next(
        status === Status.ALL
          ? { ...response, message: `Servers filteres by ${status} status` }
          : {
              ...response,
              message:
                response.data.servers.filter(
                  (server) => server.status === status
                ).length > 0
                  ? `Servers filtered by
              $${
                status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'
              } status`
                  : `No servers of ${status} found`,
              data: {
                servers: response.data.servers.filter(
                  (server) => server.status === status
                ),
              },
            }
      );
      suscriber.complete();
    }).pipe(tap(console.log), catchError(this.handleError));

  delete$ = (serverId: number) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(`${this.apiUrl}/delete/${serverId}`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    throw throwError(`An error occurred - Error code: ${error.status}`);
  }
}
