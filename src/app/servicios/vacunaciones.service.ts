import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VacunacionModelo } from '../modelos/vacunacion.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class VacunacionesService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearVacuna( vacunacion: VacunacionModelo ) {

    return this.http.post(`${ this.url }/vacunaciones`, vacunacion);

  }

  actualizarVacuna( vacunacion: VacunacionModelo ) {

    const VacunaTemp = {
      ...vacunacion
    };

    return this.http.put(`${ this.url }/vacunaciones/`, VacunaTemp);


  }

  borrarVacuna( id: number ) {

    return this.http.delete(`${ this.url }/vacunaciones/${ id }`);

  }


  getVacuna( id: number ) {

    return this.http.get(`${ this.url }/vacunaciones/${ id }`);

  }


  getVacunaciones() {
    return this.http.get(`${ this.url }/vacunaciones`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarVacunaciones() {
    return this.http.get(`${ this.url }/vacunaciones/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarVacunacionesFiltros( vacunacion: VacunacionModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = vacunacion == null ? new VacunacionModelo() : vacunacion;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/vacunaciones/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarVacunacionesFiltrosTabla( vacunacion: VacunacionModelo ) {
    let params = new HttpParams();
    var filtros = vacunacion == null ? new VacunacionModelo() : vacunacion;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/vacunaciones/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarVacunacionesFiltrosTablaOrder( vacunacion: VacunacionModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = vacunacion == null ? new VacunacionModelo() : vacunacion;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/vacunaciones/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( VacunacionesObj: object ) {

    const vacunaciones: VacunacionModelo[] = [];

    Object.keys( VacunacionesObj ).forEach( key => {

      const vacunacion: VacunacionModelo = VacunacionesObj[key];
      vacunaciones.push( vacunacion );
    });

    return vacunaciones;

  }
}
