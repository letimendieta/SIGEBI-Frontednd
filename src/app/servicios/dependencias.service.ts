import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DependenciaModelo } from '../modelos/dependencia.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class DependenciasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearDependencia( dependencia: DependenciaModelo ) {

    return this.http.post(`${ this.url }/dependencias`, dependencia);

  }

  actualizarDependencia( dependencia: DependenciaModelo ) {

    const DependenciaTemp = {
      ...dependencia
    };

    return this.http.put(`${ this.url }/dependencias/`, DependenciaTemp);


  }

  borrarDependencia( id: number ) {

    return this.http.delete(`${ this.url }/dependencias/${ id }`);

  }


  getDependencia( id: number ) {

    return this.http.get(`${ this.url }/dependencias/${ id }`);

  }


  getDependencias() {
    return this.http.get(`${ this.url }/dependencias`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarDependencias() {
    return this.http.get(`${ this.url }/dependencias/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarDependenciasFiltros( dependencia: DependenciaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = dependencia == null ? new DependenciaModelo() : dependencia;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/dependencias/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarDependenciasFiltrosOrder( dependencia: DependenciaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = dependencia == null ? new DependenciaModelo() : dependencia;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/dependencias/buscar/`,{params:params});
  }

  buscarDependenciasFiltrosTabla( dependencia: DependenciaModelo ) {
    let params = new HttpParams();
    var filtros = dependencia == null ? new DependenciaModelo() : dependencia;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/dependencias/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( DependenciasObj: object ) {

    const dependencias: DependenciaModelo[] = [];

    Object.keys( DependenciasObj ).forEach( key => {

      const dependencia: DependenciaModelo = DependenciasObj[key];
      dependencias.push( dependencia );
    });

    return dependencias;

  }
}
