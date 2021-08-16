import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';
import { PatologiaProcedimientoModelo } from '../modelos/patologiaProcedimiento.modelo';

@Injectable({
  providedIn: 'root'
})
export class PatologiasProcedimientosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearPatologiaProcedimiento( patologiaProcedimiento: PatologiaProcedimientoModelo ) {

    return this.http.post(`${ this.url }/patologias-procedimientos`, patologiaProcedimiento);

  }

  actualizarPatologiaProcedimiento( patologiaProcedimiento: PatologiaProcedimientoModelo ) {

    const PatologiaProcedimientoTemp = {
      ...patologiaProcedimiento
    };

    return this.http.put(`${ this.url }/patologias-procedimientos/`, PatologiaProcedimientoTemp);


  }

  borrarPatologiaProcedimiento( id: number ) {

    return this.http.delete(`${ this.url }/patologias-procedimientos/${ id }`);

  }


  getPatologiaProcedimiento( id: number ) {

    return this.http.get(`${ this.url }/patologias-procedimientos/${ id }`);

  }


  getPatologiasProcedimientos() {
    return this.http.get(`${ this.url }/patologias-procedimientos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPatologiasProcedimientos() {
    return this.http.get(`${ this.url }/patologias-procedimientos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }
  
  buscarPatologiasProcedimientosFiltrosTablaOrder( patologiaProcedimiento: PatologiaProcedimientoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = patologiaProcedimiento == null ? new PatologiaProcedimientoModelo() : patologiaProcedimiento;
    
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/patologias-procedimientos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarPatologiasProcedimientosFiltrosTabla( patologiaProcedimiento: PatologiaProcedimientoModelo ) {
    let params = new HttpParams();
    var filtros = patologiaProcedimiento == null ? new PatologiaProcedimientoModelo() : patologiaProcedimiento;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/patologias-procedimientos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( PatologiasProcedimientosObj: object ) {

    const patologiasProcedimientos: PatologiaProcedimientoModelo[] = [];

    Object.keys( PatologiasProcedimientosObj ).forEach( key => {

      const patologiaProcedimiento: PatologiaProcedimientoModelo = PatologiasProcedimientosObj[key];
      patologiasProcedimientos.push( patologiaProcedimiento );
    });

    return patologiasProcedimientos;

  }
}
