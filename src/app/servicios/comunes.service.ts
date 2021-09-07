import { Injectable } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ComunesService {
  rolesUsuario: Array<String> = [];
  constructor( private tokenService: TokenService ) { }

  obtenerError(e : any){
    var mensaje = "Ocurrió un error en el servidor";
      if(e.error){
        if(e.error.mensaje){
          mensaje = e.error.mensaje;
        } else if(e.error.message){
          mensaje = e.error.message;
        } else if(e.error.errors){
          mensaje = mensaje + ' ' + e.error.errors[0];
        } else if(e.error.error){
          mensaje = mensaje + ' ' + e.error.error;
        }
      }
      console.log(mensaje);
    return mensaje;  
  }

  obtenerRoles(){
    for (let i = 0; i < this.tokenService.roles.length; i++) {
      this.rolesUsuario.push(this.tokenService.roles[i].toString());
    }
    return this.rolesUsuario;
  }
}
