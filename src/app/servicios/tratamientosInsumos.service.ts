import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TratamientoInsumoModelo } from '../modelos/tratamientoInsumo.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class TratamientosInsumosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearTratamiento( tratamientoInsumo: TratamientoInsumoModelo ) {

    return this.http.post(`${ this.url }/tratamientos-insumos`, tratamientoInsumo);

  }

  actualizarTratamiento( tratamientoInsumo: TratamientoInsumoModelo ) {

    const TratamientoTemp = {
      ...tratamientoInsumo
    };

    return this.http.put(`${ this.url }/tratamientos-insumos/`, TratamientoTemp);


  }

  borrarTratamiento( id: number ) {

    return this.http.delete(`${ this.url }/tratamientos-insumos/${ id }`);

  }


  getTratamiento( id: number ) {

    return this.http.get(`${ this.url }/tratamientos-insumos/${ id }`);

  }


  getTratamientosInsumos() {
    return this.http.get(`${ this.url }/tratamientos-insumos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarTratamientosInsumos() {
    return this.http.get(`${ this.url }/tratamientos-insumos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarTratamientosInsumosFiltros( tratamientoInsumo: TratamientoInsumoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = tratamientoInsumo == null ? new TratamientoInsumoModelo() : tratamientoInsumo;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/tratamientos-insumos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarTratamientosInsumosFiltrosTabla( tratamientoInsumo: TratamientoInsumoModelo ) {
    let params = new HttpParams();
    var filtros = tratamientoInsumo == null ? new TratamientoInsumoModelo() : tratamientoInsumo;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/tratamientos-insumos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( TratamientosInsumosObj: object ) {

    const tratamientoInsumosInsumos: TratamientoInsumoModelo[] = [];

    Object.keys( TratamientosInsumosObj ).forEach( key => {

      const tratamientoInsumo: TratamientoInsumoModelo = TratamientosInsumosObj[key];
      tratamientoInsumosInsumos.push( tratamientoInsumo );
    });

    return tratamientoInsumosInsumos;

  }
}
