import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario2Modelo } from '../modelos/usuario2.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { FuncionarioModelo } from '../modelos/funcionario.modelo';
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearUsuario( usuario: Usuario2Modelo ) {

    return this.http.post(`${ this.url }/usuarios`, usuario);

  }

  actualizarUsuario( usuario: Usuario2Modelo ) {

    const usuarioTemp = {
      ...usuario
    };

    return this.http.put(`${ this.url }/usuarios/`, usuarioTemp);
  }

  borrarUsuario( id: number ) {

    return this.http.delete(`${ this.url }/usuarios/${ id }`);
  }


  getUsuario( id: number ) {

    return this.http.get(`${ this.url }/usuarios/${ id }`);
  }


  getUsuarios() {
    return this.http.get(`${ this.url }/usuarios`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarUsuarios() {
    return this.http.get(`${ this.url }/usuarios/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarUsuariosFiltros( usuario: Usuario2Modelo ) {
    let params = new HttpParams();
    var filtros = usuario == null ? new Usuario2Modelo() : usuario;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/usuarios/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  getPersona( id: number ) {

    return this.http.get(`${ this.url }/personas/${ id }`);

  }

  private crearArreglo( usuariosObj: object ) {

    const usuarios: Usuario2Modelo[] = [];

    Object.keys( usuariosObj ).forEach( key => {

      const usuario: Usuario2Modelo = usuariosObj[key];
      if(usuario.funcionarios == null){
        usuario.funcionarios = new FuncionarioModelo;
      }
      usuarios.push( usuario );
    });

    return usuarios;
  }
}
