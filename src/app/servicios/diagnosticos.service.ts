import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DiagnosticoModelo } from '../modelos/diagnostico.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearDiagnostico( diagnostico: DiagnosticoModelo ) {

    return this.http.post(`${ this.url }/diagnosticos`, diagnostico);

  }

  actualizarDiagnostico( diagnostico: DiagnosticoModelo ) {

    const DiagnosticoTemp = {
      ...diagnostico
    };

    return this.http.put(`${ this.url }/diagnosticos/`, DiagnosticoTemp);


  }

  borrarDiagnostico( id: number ) {

    return this.http.delete(`${ this.url }/diagnosticos/${ id }`);

  }


  getDiagnostico( id: number ) {

    return this.http.get(`${ this.url }/diagnosticos/${ id }`);

  }


  getDiagnosticos() {
    return this.http.get(`${ this.url }/diagnosticos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarDiagnosticos() {
    return this.http.get(`${ this.url }/diagnosticos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarDiagnosticosFiltros( diagnostico: DiagnosticoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = diagnostico == null ? new DiagnosticoModelo() : diagnostico;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/diagnosticos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarDiagnosticosFiltrosTabla( diagnostico: DiagnosticoModelo ) {
    let params = new HttpParams();
    var filtros = diagnostico == null ? new DiagnosticoModelo() : diagnostico;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/diagnosticos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( DiagnosticosObj: object ) {

    const diagnosticos: DiagnosticoModelo[] = [];

    Object.keys( DiagnosticosObj ).forEach( key => {

      const diagnostico: DiagnosticoModelo = DiagnosticosObj[key];
      diagnosticos.push( diagnostico );
    });

    return diagnosticos;

  }
}
