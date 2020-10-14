import { environment } from './../../environments/environment';
import { User } from './../user.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RandomUserService {
  constructor(private http: HttpClient) {}

  // tslint:disable-next-line: typedef
  public getUser() {
    return this.http.get(environment.randomUser).pipe(
      map((user: any) => {
        const userFiltered: User = {
          rut: Number(user.results[0].cell),
          firstname: user.results[0].name.first,
          lastname: user.results[0].name.last,
          phonenumber: Number(user.results[0].phone),
        };
        return userFiltered;
      })
    );
  }
}
