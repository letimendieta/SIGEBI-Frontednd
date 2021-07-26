import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComunesService {

  constructor( ) { }

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
      /*if(e.message){
        mensaje = mensaje + ' ' + e.message;
      }*/
    return mensaje;  
  }
}
