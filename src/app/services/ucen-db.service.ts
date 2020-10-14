import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './../user.interface';
import { environment } from './../../environments/environment';

interface ResponseUser {
  ok: boolean;
  user: User;
  err?: string;
}

interface ResponseUsers {
  ok: boolean;
  users: User[];
  err?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UcenDbService {
  constructor(private http: HttpClient) {}

  // tslint:disable-next-line: typedef
  public getAllUser() {
    return this.http.get<ResponseUsers>(`${environment.url}`);
  }

  // tslint:disable-next-line: typedef
  public createUser(user: User) {
    return this.http.post<ResponseUser>(`${environment.url}`, user);
  }

  // tslint:disable-next-line: typedef
  public updateUser(newUser: User) {
    return this.http.put<ResponseUser>(`${environment.url}`, newUser);
  }

  // tslint:disable-next-line: typedef
  public deleteUser(id: number) {
    return this.http.delete<ResponseUser>(`${environment.url}?id=${id}`);
  }
}
