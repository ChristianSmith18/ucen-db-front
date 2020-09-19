import { SwalService } from './services/swal.service';
import { UcenDbService } from './services/ucen-db.service';
import { Component } from '@angular/core';
import { User } from './user.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public users: User[] = [];
  public currentIndex: number = null;

  public name: string = null;
  public lastname: string = null;
  public phonenumber: number = null;

  constructor(
    private readonly db: UcenDbService,
    private readonly swal: SwalService
  ) {
    this.refreshData();
  }

  private refreshData(): void {
    const getDB = this.db.getAllUser().subscribe(({ users }) => {
      this.users = users;
      getDB.unsubscribe();
    });
  }

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;

    document.querySelectorAll('.box-fields')[0].innerHTML = this.users[
      this.currentIndex
    ].name;
    document.querySelectorAll('.box-fields')[1].innerHTML = this.users[
      this.currentIndex
    ].lastname;
    document.querySelectorAll('.box-fields')[2].innerHTML =
      '+56 9 ' + this.users[this.currentIndex].phonenumber;
  }

  public clearIndex(): void {
    this.currentIndex = null;

    document.querySelectorAll('.box-fields')[0].innerHTML = 'Nombre';
    document.querySelectorAll('.box-fields')[1].innerHTML = 'Apellido';
    document.querySelectorAll('.box-fields')[2].innerHTML = 'Telefono';
  }

  public createUser(): void {
    const user: User = {
      name: this.name,
      lastname: this.lastname,
      phonenumber: this.phonenumber,
    };

    this.db.createUser(user).subscribe(
      ({ ok }) => {
        if (ok) {
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
        this.swal.showMixin('Ha ocurrido un problema!', 'error');
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
          <label for="name">Nombre:</label>
          <input
            type="text"
            class="form-control"
            id="swal-input1"
            placeholder="Ingrese el nombre del nuevo usuario..."
            value="${this.users[this.currentIndex].name}"
          />
        </div>
        <div class="col-sm-12">
          <label for="lastname">Apellido:</label>
          <input
            type="text"
            class="form-control"
            id="swal-input2"
            placeholder="Ingrese el apellido del nuevo usuario..."
            value="${this.users[this.currentIndex].lastname}"
          />
        </div>
        <div class="col-sm-12 p-0">
          <label for="lastname">Número de teléfono:</label>
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
        name: formValues[0],
        lastname: formValues[1],
        phonenumber: Number(formValues[2]),
      };

      this.db.updateUser(this.users[this.currentIndex].id, user).subscribe(
        ({ ok }) => {
          if (ok) {
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
        this.db.deleteUser(this.users[this.currentIndex].id).subscribe(
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
}
