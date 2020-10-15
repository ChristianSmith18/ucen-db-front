import { Component } from '@angular/core';
import { User } from './user.interface';
import Swal from 'sweetalert2';
import { SwalService } from './services/swal.service';
import { UcenDbService } from './services/ucen-db.service';
import { RandomUserService } from './services/random-user.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public users: User[] = [];
  public currentIndex: number = null;

  public rut: number = null;
  public name: string = null;
  public lastname: string = null;
  public phonenumber: number = null;

  constructor(
    private readonly db: UcenDbService,
    private readonly swal: SwalService,
    private readonly ruser: RandomUserService,
    private spinner: NgxSpinnerService
  ) {
    this.refreshData();
  }

  public genRandomUser(): void {
    this.spinner.show();
    this.ruser.getUser().subscribe(
      (user) => {
        this.rut = user.rut;
        this.name = user.firstname;
        this.lastname = user.lastname;
        this.phonenumber = user.phonenumber;
        this.spinner.hide();
      },
      (_) => {
        this.swal.showMixin(
          'Surgió un problema al generar el usuario',
          'error'
        );
        this.spinner.hide();
      }
    );
  }

  private refreshData(): void {
    const getDB = this.db.getAllUser().subscribe(({ users }) => {
      this.users = users;
      getDB.unsubscribe();
    });
  }

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;

    document.querySelectorAll('.box-fields')[0].innerHTML = this.dgv(
      this.users[this.currentIndex].rut
    );
    document.querySelectorAll('.box-fields')[1].innerHTML = this.users[
      this.currentIndex
    ].firstname;
    document.querySelectorAll('.box-fields')[2].innerHTML = this.users[
      this.currentIndex
    ].lastname;
    document.querySelectorAll('.box-fields')[3].innerHTML =
      '+56 9 ' + this.users[this.currentIndex].phonenumber;
  }

  public clearIndex(): void {
    this.currentIndex = null;

    document.querySelectorAll('.box-fields')[0].innerHTML = 'Rut';
    document.querySelectorAll('.box-fields')[1].innerHTML = 'Nombre';
    document.querySelectorAll('.box-fields')[2].innerHTML = 'Apellido';
    document.querySelectorAll('.box-fields')[3].innerHTML = 'Telefono';
  }

  public createUser(): void {
    const user: User = {
      firstname: this.name,
      lastname: this.lastname,
      phonenumber: this.phonenumber,
      rut: Number(this.rut),
    };

    this.db.createUser(user).subscribe(
      ({ ok }) => {
        if (ok) {
          this.rut = null;
          this.name = null;
          this.lastname = null;
          this.phonenumber = null;

          this.clearIndex();

          this.clearIndex();

          this.swal.showMixin('Creado correctamente!', 'success');
          this.refreshData();
        } else {
          this.swal.showMixin('Ha ocurrido un problema!', 'error');
        }
      },
      (err) => {
        console.warn(err);
        if (err.error.message) {
          this.swal.showMixin(err.error.message.join('\n'), 'error');
        } else {
          this.swal.showMixin('Ha ocurrido un problema!', 'error');
        }
      }
    );
  }

  // tslint:disable-next-line: typedef
  public async openDialog() {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Usuario',
      html: `
      <div class="form-row row">
        <div class="col-sm-12 form-group">
          <label for="name" class="font-weight-bold w-100 text-left">Nombre:</label>
          <input
            type="text"
            class="form-control"
            id="swal-input1"
            placeholder="Ingrese el nombre del nuevo usuario..."
            value="${this.users[this.currentIndex].firstname}"
            oninput="javascript: if (this.value.split(' ').length > 1) this.value = this.value.split(' ')[0]"
            onkeyup="this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1)"
          />
        </div>
        <div class="col-sm-12">
          <label for="lastname" class="font-weight-bold w-100 text-left">Apellido:</label>
          <input
            type="text"
            class="form-control"
            id="swal-input2"
            placeholder="Ingrese el apellido del nuevo usuario..."
            value="${this.users[this.currentIndex].lastname}"
            oninput="javascript: if (this.value.split(' ').length > 1) this.value = this.value.split(' ')[0]"
            onkeyup="this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1)"
          />
        </div>
        <div class="col-sm-12 p-0 pt-2">
          <label for="lastname" class="font-weight-bold w-100 text-left">Número de teléfono:</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1">+56 9</span>
            </div>
            <input
              type="number"
              class="form-control"
              id="swal-input3"
              placeholder="1234 5678"
              aria-label="Phonenumber"
              value="${this.users[this.currentIndex].phonenumber}"
              oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
              maxlength="8"
            />
          </div>
        </div>
      </div>
        `,
      focusConfirm: false,
      confirmButtonText: 'Actualizar',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value,
          (document.getElementById('swal-input3') as HTMLInputElement).value,
        ];
      },
    });

    if (formValues) {
      const user: User = {
        rut: this.clearRutBox(
          document.querySelectorAll('.box-fields')[0].innerHTML
        ),
        firstname: formValues[0],
        lastname: formValues[1],
        phonenumber: Number(formValues[2]),
      };

      this.db.updateUser(user).subscribe(
        ({ ok }) => {
          if (ok) {
            this.rut = null;
            this.name = null;
            this.lastname = null;
            this.phonenumber = null;

            this.clearIndex();

            this.swal.showMixin('Actualizado correctamente!', 'success');
            this.refreshData();
          } else {
            this.swal.showMixin('Ha ocurrido un problema!', 'error');
          }
        },
        (err) => {
          this.swal.showMixin('Ha ocurrido un problema!', 'error');
        }
      );
    }
  }

  private clearRutBox(rut: string): number {
    return Number(rut.split('-')[0].replace('.', '').replace('.', ''));
  }

  // tslint:disable-next-line: typedef
  public async deleteUser() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.db.deleteUser(this.users[this.currentIndex].rut).subscribe(
          ({ ok }) => {
            if (ok) {
              this.name = null;
              this.lastname = null;
              this.phonenumber = null;

              this.clearIndex();

              this.swal.showMixin('Eliminado correctamente!', 'success');
              this.refreshData();
            } else {
              this.swal.showMixin('Ha ocurrido un problema!', 'error');
            }
          },
          (err) => {
            this.swal.showMixin('Ha ocurrido un problema!', 'error');
          }
        );
      }
    });
  }

  private tarifaFormat(numero: number): string {
    return numero.toLocaleString('en-US').replace(',', '.').replace(',', '.');
  }

  private dgv(rut: number): string {
    const rutFormat = this.tarifaFormat(rut);
    let M = 0;
    let S = 1;
    for (; rut; rut = Math.floor(rut / 10)) {
      S = (S + (rut % 10) * (9 - (M++ % 6))) % 11;
    }

    return `${rutFormat}-${S ? S - 1 : 'k'}`;
  }
}
