import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FuncionarioModelo } from '../modelos/funcionario.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearFuncionario( funcionario: FuncionarioModelo ) {

    return this.http.post(`${ this.url }/funcionarios`, funcionario);

  }

  actualizarFuncionario( funcionario: FuncionarioModelo ) {

    const funcionarioTemp = {
      ...funcionario
    };

    return this.http.put(`${ this.url }/funcionarios/`, funcionarioTemp);
  }

  borrarFuncionario( id: number ) {

    return this.http.delete(`${ this.url }/funcionarios/${ id }`);
  }


  getFuncionario( id: number ) {

    return this.http.get(`${ this.url }/funcionarios/${ id }`);
  }


  getFuncionarios() {
    return this.http.get(`${ this.url }/funcionarios`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarFuncionarios() {
    return this.http.get(`${ this.url }/funcionarios/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarFuncionariosFiltros( fichaClinica: FuncionarioModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = fichaClinica == null ? new FuncionarioModelo() : fichaClinica;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/funcionarios/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarFuncionariosFiltrosTabla( funcionario: FuncionarioModelo ) {
    let params = new HttpParams();
    var filtros = funcionario == null ? new FuncionarioModelo() : funcionario;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/funcionarios/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  getPersona( id: number ) {

    return this.http.get(`${ this.url }/personas/${ id }`);

  }

  private crearArreglo( funcionariosObj: object ) {

    const funcionarios: FuncionarioModelo[] = [];

    Object.keys( funcionariosObj ).forEach( key => {

      const funcionario: FuncionarioModelo = funcionariosObj[key];
      funcionarios.push( funcionario );
    });

    return funcionarios;
  }
}
