import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TerminoEstandarModelo } from '../modelos/terminoEstandar.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class TerminoEstandarService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearterminoEstandar( terminoEstandar: TerminoEstandarModelo ) {

    return this.http.post(`${ this.url }/termino-estandar`, terminoEstandar);

  }

  actualizarterminoEstandar( terminoEstandar: TerminoEstandarModelo ) {

    const terminoEstandarTemp = {
      ...terminoEstandar
    };

    return this.http.put(`${ this.url }/termino-estandar/`, terminoEstandarTemp);


  }

  borrarterminoEstandar( id: number ) {

    return this.http.delete(`${ this.url }/termino-estandar/${ id }`);

  }


  getTerminoEstandar( id: number ) {

    return this.http.get(`${ this.url }/termino-estandar/${ id }`);

  }


  getTerminosEstandar() {
    return this.http.get(`${ this.url }/termino-estandar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarTerminoEstandar() {
    return this.http.get(`${ this.url }/termino-estandar/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarTerminoEstandarFiltros( terminoEstandar: TerminoEstandarModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = terminoEstandar == null ? new TerminoEstandarModelo() : terminoEstandar;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/termino-estandar/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarTerminoEstandarFiltrosTabla( terminoEstandar: TerminoEstandarModelo ) {
    let params = new HttpParams();
    var filtros = terminoEstandar == null ? new TerminoEstandarModelo() : terminoEstandar;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/termino-estandar/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( TerminoEstandarObj: object ) {

    const TerminoEstandar: TerminoEstandarModelo[] = [];

    Object.keys( TerminoEstandarObj ).forEach( key => {

      const terminoEstandar: TerminoEstandarModelo = TerminoEstandarObj[key];
      TerminoEstandar.push( terminoEstandar );
    });

    return TerminoEstandar;

  }
}
