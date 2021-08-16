import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TratamientoModelo } from '../modelos/tratamiento.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class TratamientosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearTratamiento( tratamiento: TratamientoModelo ) {

    return this.http.post(`${ this.url }/tratamientos`, tratamiento);

  }

  actualizarTratamiento( tratamiento: TratamientoModelo ) {

    const TratamientoTemp = {
      ...tratamiento
    };

    return this.http.put(`${ this.url }/tratamientos/`, TratamientoTemp);


  }

  borrarTratamiento( id: number ) {

    return this.http.delete(`${ this.url }/tratamientos/${ id }`);

  }


  getTratamiento( id: number ) {

    return this.http.get(`${ this.url }/tratamientos/${ id }`);

  }


  getTratamientos() {
    return this.http.get(`${ this.url }/tratamientos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarTratamientos() {
    return this.http.get(`${ this.url }/tratamientos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarTratamientosFiltros( tratamiento: TratamientoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = tratamiento == null ? new TratamientoModelo() : tratamiento;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/tratamientos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarTratamientosFiltrosTabla( tratamiento: TratamientoModelo ) {
    let params = new HttpParams();
    var filtros = tratamiento == null ? new TratamientoModelo() : tratamiento;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/tratamientos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( TratamientosObj: object ) {

    const tratamientos: TratamientoModelo[] = [];

    Object.keys( TratamientosObj ).forEach( key => {

      const tratamiento: TratamientoModelo = TratamientosObj[key];
      tratamientos.push( tratamiento );
    });

    return tratamientos;

  }
}
