import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreguntaHistorialModelo } from '../modelos/preguntaHistorial.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class PreguntasHistorialService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearPregunta( pregunta: PreguntaHistorialModelo ) {

    return this.http.post(`${ this.url }/preguntas-historial`, pregunta);

  }

  actualizarPregunta( pregunta: PreguntaHistorialModelo ) {

    const PreguntaHistorialTemp = {
      ...pregunta
    };

    return this.http.put(`${ this.url }/preguntas-historial/`, PreguntaHistorialTemp);


  }

  borrarPerguntaHistorial( id: number ) {

    return this.http.delete(`${ this.url }/preguntas-historial/${ id }`);

  }


  getPerguntaHistorial( id: number ) {

    return this.http.get(`${ this.url }/preguntas-historial/${ id }`);

  }


  getPreguntasHistorial() {
    return this.http.get(`${ this.url }/preguntas-historial`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPreguntasHistorial() {
    return this.http.get(`${ this.url }/preguntas-historial/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPreguntasHistorialFiltros( pregunta: PreguntaHistorialModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = pregunta == null ? new PreguntaHistorialModelo() : pregunta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/preguntas-historial/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarPreguntasHistorialFiltrosTabla( pregunta: PreguntaHistorialModelo ) {
    let params = new HttpParams();
    var filtros = pregunta == null ? new PreguntaHistorialModelo() : pregunta;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/preguntas-historial/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarPreguntasHistorialFiltrosTablaOrder( vacuna: PreguntaHistorialModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = vacuna == null ? new PreguntaHistorialModelo() : vacuna;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/preguntas-historial/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( PreguntasHistorialObj: object ) {

    const preguntasHistorial: PreguntaHistorialModelo[] = [];

    Object.keys( PreguntasHistorialObj ).forEach( key => {

      const pregunta: PreguntaHistorialModelo = PreguntasHistorialObj[key];
      preguntasHistorial.push( pregunta );
    });

    return preguntasHistorial;

  }
}
