import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HorarioModelo } from '../modelos/horario.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearHorario( horario: HorarioModelo ) {

    return this.http.post(`${ this.url }/horarios-disponibles`, horario);

  }

  actualizarHorario( horario: HorarioModelo ) {

    const HorarioTemp = {
      ...horario
    };

    return this.http.put(`${ this.url }/horarios-disponibles/`, HorarioTemp);


  }

  borrarHorario( id: number ) {

    return this.http.delete(`${ this.url }/horarios-disponibles/${ id }`);

  }


  getHorario( id: number ) {

    return this.http.get(`${ this.url }/horarios-disponibles/${ id }`);

  }


  getHorarios() {
    return this.http.get(`${ this.url }/horarios-disponibles`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarHorarios() {
    return this.http.get(`${ this.url }/horarios-disponibles/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarHorariosFiltros( horario: HorarioModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = horario == null ? new HorarioModelo() : horario;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/horarios-disponibles/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarHorariosFiltrosTabla( horario: HorarioModelo ) {
    let params = new HttpParams();
    var filtros = horario == null ? new HorarioModelo() : horario;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/horarios-disponibles/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( HorariosObj: object ) {

    const horarios: HorarioModelo[] = [];

    Object.keys( HorariosObj ).forEach( key => {

      const horario: HorarioModelo = HorariosObj[key];
      horarios.push( horario );
    });

    return horarios;

  }
}
