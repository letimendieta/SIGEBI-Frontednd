import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnfermedadCie10Modelo } from '../modelos/enfermedadCie10.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class EnfermedadesCie10Service {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearEnfermedadCie10( enfermedadCie10: EnfermedadCie10Modelo ) {

    return this.http.post(`${ this.url }/enfermedades-cie10`, enfermedadCie10);

  }

  actualizarEnfermedadCie10( enfermedadCie10: EnfermedadCie10Modelo ) {

    const EnfermedadCie10Temp = {
      ...enfermedadCie10
    };

    return this.http.put(`${ this.url }/enfermedades-cie10/`, EnfermedadCie10Temp);


  }

  borrarEnfermedadCie10( id: number ) {

    return this.http.delete(`${ this.url }/enfermedades-cie10/${ id }`);

  }


  getEnfermedadCie10( id: number ) {

    return this.http.get(`${ this.url }/enfermedades-cie10/${ id }`);

  }


  getEnfermedadesCie10() {
    return this.http.get(`${ this.url }/enfermedades-cie10`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarEnfermedadesCie10() {
    return this.http.get(`${ this.url }/enfermedades-cie10/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarEnfermedadesCie10Filtros( enfermedadCie10: EnfermedadCie10Modelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = enfermedadCie10 == null ? new EnfermedadCie10Modelo() : enfermedadCie10;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/enfermedades-cie10/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarEnfermedadesCie10FiltrosTabla( enfermedadCie10: EnfermedadCie10Modelo ) {
    let params = new HttpParams();
    var filtros = enfermedadCie10 == null ? new EnfermedadCie10Modelo() : enfermedadCie10;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/enfermedades-cie10/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( EnfermedadesCie10Obj: object ) {

    const enfermedadesCie10: EnfermedadCie10Modelo[] = [];

    Object.keys( EnfermedadesCie10Obj ).forEach( key => {

      const enfermedadCie10: EnfermedadCie10Modelo = EnfermedadesCie10Obj[key];
      enfermedadesCie10.push( enfermedadCie10 );
    });

    return enfermedadesCie10;

  }
}
