import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConsultaModelo } from '../modelos/consulta.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearConsulta( consulta: ConsultaModelo ) {

    return this.http.post(`${ this.url }/consultas`, consulta);

  }

  actualizarConsulta( consulta: ConsultaModelo ) {

    const ConsultaTemp = {
      ...consulta
    };

    return this.http.put(`${ this.url }/consultas/`, ConsultaTemp);


  }

  borrarConsulta( id: number ) {

    return this.http.delete(`${ this.url }/consultas/${ id }`);

  }


  getConsulta( id: number ) {

    return this.http.get(`${ this.url }/consultas/${ id }`);

  }


  getConsultas() {
    return this.http.get(`${ this.url }/consultas`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarConsultas() {
    return this.http.get(`${ this.url }/consultas/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarConsultasFiltros( consulta: ConsultaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = consulta == null ? new ConsultaModelo() : consulta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/consultas/buscar/`,{params:params});
  }

  buscarConsultasFiltrosTabla( consulta: ConsultaModelo ) {
    let params = new HttpParams();
    var filtros = consulta == null ? new ConsultaModelo() : consulta;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/consultas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( ConsultasObj: object ) {

    const consultas: ConsultaModelo[] = [];

    Object.keys( ConsultasObj ).forEach( key => {

      const consulta: ConsultaModelo = ConsultasObj[key];
      consultas.push( consulta );
    });

    return consultas;

  }
}
