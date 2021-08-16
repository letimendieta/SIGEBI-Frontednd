import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DepartamentoModelo } from '../modelos/departamento.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';


@Injectable({
  providedIn: 'root'
})
export class DepartamentosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearDepartamento( departamento: DepartamentoModelo ) {

    return this.http.post(`${ this.url }/departamentos`, departamento);

  }

  actualizarDepartamento( departamento: DepartamentoModelo ) {

    const DepartamentoTemp = {
      ...departamento
    };

    return this.http.put(`${ this.url }/departamentos/`, DepartamentoTemp);


  }

  borrarDepartamento( id: number ) {

    return this.http.delete(`${ this.url }/departamentos/${ id }`);

  }


  getDepartamento( id: number ) {

    return this.http.get(`${ this.url }/departamentos/${ id }`);

  }


  getDepartamentos() {
    return this.http.get(`${ this.url }/departamentos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarDepartamentos() {
    return this.http.get(`${ this.url }/departamentos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarDepartamentosFiltros( departamento: DepartamentoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = departamento == null ? new DepartamentoModelo() : departamento;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/departamentos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarDepartamentosFiltrosOrder( departamento: DepartamentoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = departamento == null ? new DepartamentoModelo() : departamento;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/departamentos/buscar/`,{params:params});
  }

  buscarDepartamentosFiltrosTabla( departamento: DepartamentoModelo ) {
    let params = new HttpParams();
    var filtros = departamento == null ? new DepartamentoModelo() : departamento;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/departamentos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( DepartamentosObj: object ) {

    const departamentos: DepartamentoModelo[] = [];

    Object.keys( DepartamentosObj ).forEach( key => {

      const departamento: DepartamentoModelo = DepartamentosObj[key];
      departamentos.push( departamento );
    });

    return departamentos;

  }
}
