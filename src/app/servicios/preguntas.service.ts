import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreguntaModelo } from '../modelos/pregunta.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearPregunta( pregunta: PreguntaModelo ) {

    return this.http.post(`${ this.url }/preguntas`, pregunta);

  }

  actualizarPregunta( pregunta: PreguntaModelo ) {

    const PreguntaTemp = {
      ...pregunta
    };

    return this.http.put(`${ this.url }/preguntas/`, PreguntaTemp);


  }

  borrarPregunta( id: number ) {

    return this.http.delete(`${ this.url }/preguntas/${ id }`);

  }


  getPregunta( id: number ) {

    return this.http.get(`${ this.url }/preguntas/${ id }`);

  }


  getPreguntas() {
    return this.http.get(`${ this.url }/preguntas`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPreguntas() {
    return this.http.get(`${ this.url }/preguntas/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPreguntasFiltros( pregunta: PreguntaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = pregunta == null ? new PreguntaModelo() : pregunta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/preguntas/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarPreguntasFiltrosTabla( pregunta: PreguntaModelo ) {
    let params = new HttpParams();
    var filtros = pregunta == null ? new PreguntaModelo() : pregunta;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/preguntas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarPreguntasFiltrosTablaOrder( vacuna: PreguntaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = vacuna == null ? new PreguntaModelo() : vacuna;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/preguntas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( PreguntasObj: object ) {

    const preguntas: PreguntaModelo[] = [];

    Object.keys( PreguntasObj ).forEach( key => {

      const pregunta: PreguntaModelo = PreguntasObj[key];
      preguntas.push( pregunta );
    });

    return preguntas;

  }
}
