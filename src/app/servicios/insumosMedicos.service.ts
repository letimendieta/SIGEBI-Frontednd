import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';
import { InsumoMedicoModelo } from '../modelos/insumoMedico.modelo';

@Injectable({
  providedIn: 'root'
})
export class InsumosMedicosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearInsumoMedico( insumo: InsumoMedicoModelo ) {

    return this.http.post(`${ this.url }/insumos-medicos`, insumo);

  }

  actualizarInsumoMedico( insumo: InsumoMedicoModelo ) {

    const InsumoTemp = {
      ...insumo
    };

    return this.http.put(`${ this.url }/insumos-medicos`, InsumoTemp);


  }

  borrarInsumo( id: number ) {

    return this.http.delete(`${ this.url }/insumos-medicos/${ id }`);

  }


  getInsumo( id: number ) {

    return this.http.get(`${ this.url }/insumos-medicos/${ id }`);

  }


  getInsumos() {
    return this.http.get(`${ this.url }/insumos-medicos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarInsumos() {
    return this.http.get(`${ this.url }/insumos-medicos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarInsumosMedicosFiltros( horario: InsumoMedicoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = horario == null ? new InsumoMedicoModelo() : horario;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/insumos-medicos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarInsumosMedicosFiltrosTabla( insumo: InsumoMedicoModelo ) {
    let params = new HttpParams();
    var filtros = insumo == null ? new InsumoMedicoModelo() : insumo;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/insumos-medicos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( InsumosObj: object ) {

    const insumos: InsumoMedicoModelo[] = [];

    Object.keys( InsumosObj ).forEach( key => {

      const insumo: InsumoMedicoModelo = InsumosObj[key];
      insumos.push( insumo );
    });

    return insumos;

  }
}
